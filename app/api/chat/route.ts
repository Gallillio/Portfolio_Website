// Streaming chat endpoint. Replaces pages/api/gemini.ts, which returned a
// generic `{ error: 'Failed to generate response' }` for every possible cause —
// quota, overload, bad payload, genuine bug — making the intermittent failures
// impossible to diagnose from the browser.
//
// Everything above the `return new Response(...)` line carries a real HTTP
// status code and a specific message. Only failures after the first upstream
// byte are reported in-band, because a flushed 200 header cannot be revoked.

import type { ChatMessage } from "@/lib/types";
import type { ChatErrorBody, ChatErrorCode, ChatStreamFrame, ChatUsage } from "@/lib/ai/protocol";
import { encodeSSE, parseSSE } from "@/lib/ai/sse";
import { checkRateLimit, clientKey } from "@/lib/ai/rate-limit";
import { buildPayload, fetchGeminiStream, UpstreamError } from "@/lib/ai/gemini";
import { admit, noteUpstream429, release, settle, type QuotaScope } from "@/lib/ai/quota";
import { MAX_MESSAGE_CHARS, MAX_TOTAL_HISTORY_CHARS } from "@/lib/ai/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Whole-request budget. */
const REQUEST_TIMEOUT_MS = 45_000;
/**
 * No response headers from Google within this long means the free endpoint is
 * stuck. Production saw calls sit the full 45s and then fail; a visitor should
 * hear about that in seconds, not watch a thinking indicator for most of a minute.
 */
const FIRST_BYTE_TIMEOUT_MS = 15_000;
/** Idle-between-deltas budget. Catches a hung upstream that the overall timeout would sit on. */
const STALL_TIMEOUT_MS = 20_000;

const isProd = process.env.NODE_ENV === "production";

function errorResponse(
  status: number,
  code: ChatErrorCode,
  message: string,
  opts: { retryable?: boolean; detail?: string; retryAfterMs?: number } = {}
): Response {
  const body: ChatErrorBody = {
    code,
    message,
    retryable: opts.retryable ?? false,
    ...(opts.retryAfterMs ? { retryAfterMs: Math.ceil(opts.retryAfterMs) } : {}),
    ...(opts.detail && !isProd ? { detail: opts.detail } : {}),
  };
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts.retryAfterMs) headers["Retry-After"] = String(Math.ceil(opts.retryAfterMs / 1000));
  return new Response(JSON.stringify(body), { status, headers });
}

/** The free-tier cap is reached, whether Google said so or our own ledger did. */
function quotaResponse(scope: QuotaScope, retryAfterMs: number, detail?: string): Response {
  if (scope === "per-day") {
    return errorResponse(
      429,
      "UPSTREAM_QUOTA_EXHAUSTED",
      "The daily AI quota has been used up. It resets at midnight Pacific.",
      // Not retryable in any useful sense: the cap will not clear for hours.
      { retryable: false, detail, retryAfterMs }
    );
  }
  return errorResponse(
    429,
    "UPSTREAM_RATE_LIMITED",
    "The AI service hit its per-minute limit.",
    { retryable: true, detail, retryAfterMs }
  );
}

interface ValidBody {
  message: string;
  conversationHistory: ChatMessage[];
}

/** Returns a validated body, or a string describing exactly which field is wrong. */
function validate(raw: unknown): ValidBody | string {
  if (typeof raw !== "object" || raw === null) return "Request body must be a JSON object.";

  const { message, conversationHistory } = raw as Record<string, unknown>;

  if (typeof message !== "string") return "Field 'message' is required and must be a string.";
  const trimmed = message.trim();
  if (!trimmed) return "Field 'message' must not be empty.";
  if (trimmed.length > MAX_MESSAGE_CHARS) {
    return `Field 'message' must be ${MAX_MESSAGE_CHARS} characters or fewer.`;
  }

  // The old route did conversationHistory.map() with no guard, so a missing or
  // non-array value threw a TypeError straight into the generic 500.
  if (conversationHistory === undefined || conversationHistory === null) {
    return { message: trimmed, conversationHistory: [] };
  }
  if (!Array.isArray(conversationHistory)) {
    return "Field 'conversationHistory' must be an array when present.";
  }

  const history: ChatMessage[] = [];
  let totalChars = 0;
  for (const entry of conversationHistory) {
    if (typeof entry !== "object" || entry === null) {
      return "Each 'conversationHistory' entry must be an object.";
    }
    const { role, content } = entry as Record<string, unknown>;
    if (role !== "user" && role !== "model") {
      return "Each 'conversationHistory' entry needs role 'user' or 'model'.";
    }
    if (typeof content !== "string") {
      return "Each 'conversationHistory' entry needs a string 'content'.";
    }
    totalChars += content.length;
    if (totalChars > MAX_TOTAL_HISTORY_CHARS) break;
    history.push({ role, content });
  }

  return { message: trimmed, conversationHistory: history };
}

interface GeminiPart {
  text?: string;
  thought?: boolean;
}

interface GeminiChunk {
  candidates?: {
    content?: { parts?: GeminiPart[] };
    finishReason?: string;
  }[];
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    thoughtsTokenCount?: number;
  };
}

/** Transform Google's SSE stream into our own frame protocol. */
function toClientStream(
  upstream: ReadableStream<Uint8Array>,
  requestId: string,
  onUsage: (usage: ChatUsage) => void
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      let sawText = false;
      let finishReason: string | undefined;
      let usage: ChatUsage | undefined;
      let stallTimer: ReturnType<typeof setTimeout> | undefined;
      let stalled = false;

      const send = (frame: ChatStreamFrame) => controller.enqueue(encoder.encode(encodeSSE(frame)));

      const resetStall = () => {
        if (stallTimer) clearTimeout(stallTimer);
        stallTimer = setTimeout(() => {
          stalled = true;
        }, STALL_TIMEOUT_MS);
      };

      try {
        resetStall();

        for await (const payload of parseSSE(upstream)) {
          if (stalled) break;

          let chunk: GeminiChunk;
          try {
            chunk = JSON.parse(payload) as GeminiChunk;
          } catch {
            continue; // A malformed frame is not worth killing the stream over.
          }

          const candidate = chunk.candidates?.[0];
          if (candidate?.finishReason) finishReason = candidate.finishReason;

          if (chunk.usageMetadata) {
            usage = {
              input: chunk.usageMetadata.promptTokenCount ?? 0,
              output: chunk.usageMetadata.candidatesTokenCount ?? 0,
              thoughts: chunk.usageMetadata.thoughtsTokenCount ?? 0,
            };
          }

          // Thinking models emit reasoning as parts flagged thought:true.
          // Same rule the old lib/gemini-response.ts applied to buffered responses.
          const text = (candidate?.content?.parts ?? [])
            .filter((p) => p?.text && !p.thought)
            .map((p) => p.text as string)
            .join("");

          if (text) {
            sawText = true;
            resetStall();
            send({ type: "delta", text });
          }
        }

        if (stalled) {
          send({
            type: "error",
            code: "TIMEOUT",
            message: "The model stopped responding partway through.",
            retryable: true,
          });
        } else if (!sawText && finishReason === "SAFETY") {
          send({
            type: "error",
            code: "BLOCKED",
            message: "I can't answer that one. Try asking about Ahmed's work instead.",
            retryable: false,
          });
        } else if (!sawText) {
          send({
            type: "error",
            code: "EMPTY",
            message: "I couldn't generate an answer for that. Try rephrasing the question.",
            retryable: true,
          });
        } else {
          send({ type: "done", finishReason, usage });
        }

        if (usage) onUsage(usage);
        console.log("[chat] completed", { requestId, finishReason, usage, sawText });
      } catch (error) {
        console.error("[chat] stream failed", { requestId, error });
        send({
          type: "error",
          code: "UNKNOWN",
          message: "The connection dropped partway through the answer.",
          retryable: true,
        });
      } finally {
        if (stallTimer) clearTimeout(stallTimer);
        controller.close();
      }
    },
  });
}

export async function POST(request: Request): Promise<Response> {
  const requestId = crypto.randomUUID();

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return errorResponse(415, "BAD_REQUEST", "Content-Type must be application/json.");
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return errorResponse(400, "BAD_REQUEST", "Request body is not valid JSON.");
  }

  const validated = validate(raw);
  if (typeof validated === "string") {
    return errorResponse(400, "BAD_REQUEST", validated);
  }

  const limit = await checkRateLimit(clientKey(request));
  if (!limit.ok) {
    return errorResponse(429, "RATE_LIMITED", "Too many messages. Give it a moment.", {
      retryable: true,
      retryAfterMs: limit.retryAfterSec * 1000,
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("[chat] GEMINI_API_KEY is not set", { requestId });
    return errorResponse(
      500,
      "CONFIG",
      "The assistant is not configured. This has been logged."
    );
  }

  const payload = buildPayload(validated.message, validated.conversationHistory);
  const payloadChars = JSON.stringify(payload).length;

  // Refuse here, instantly and with an exact wait, when the request cannot fit
  // in this minute's free-tier budget. Calling Google anyway would only buy the
  // visitor a slower 429.
  const admission = admit(payloadChars);
  if (!admission.ok) {
    console.log("[chat] held back by quota ledger", { requestId, ...admission });
    return quotaResponse(admission.scope, admission.retryAfterMs);
  }
  const { reservation } = admission;

  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  // Cleared as soon as headers arrive, so it can never cut a stream that started.
  const firstByte = new AbortController();
  const firstByteTimer = setTimeout(() => firstByte.abort(), FIRST_BYTE_TIMEOUT_MS);
  const signal = AbortSignal.any([request.signal, timeout, firstByte.signal]);

  let upstream: Response;
  try {
    upstream = await fetchGeminiStream(payload, { signal, apiKey, requestId });
  } catch (error) {
    if (error instanceof UpstreamError) {
      // Google answered with an error, so it generated nothing. A timeout or a
      // visitor leaving keeps the reservation: Google may already be counting it.
      release(reservation);

      if (error.status === 429) {
        const { retryAfterMs, scope } = noteUpstream429(
          error.quota ?? { scope: "per-minute", metric: "unknown" }
        );
        return quotaResponse(scope, retryAfterMs, error.detail);
      }
      if (error.status === 503 || error.status === 500 || error.status === 504) {
        return errorResponse(
          503,
          "UPSTREAM_UNAVAILABLE",
          "The AI model is overloaded. Try again in a moment.",
          { retryable: true, detail: error.detail }
        );
      }
      return errorResponse(
        502,
        "UPSTREAM_ERROR",
        "The assistant is misconfigured. This has been logged.",
        { detail: error.detail }
      );
    }

    if (timeout.aborted || firstByte.signal.aborted) {
      console.error("[chat] upstream timed out", { requestId, firstByte: firstByte.signal.aborted });
      return errorResponse(504, "TIMEOUT", "The assistant took too long to respond.", {
        retryable: true,
      });
    }
    if (request.signal.aborted) {
      return new Response(null, { status: 499 });
    }

    console.error("[chat] unexpected failure", { requestId, error });
    return errorResponse(500, "UNKNOWN", "Something went wrong reaching the assistant.", {
      retryable: true,
    });
  } finally {
    clearTimeout(firstByteTimer);
  }

  const stream = toClientStream(upstream.body as ReadableStream<Uint8Array>, requestId, (usage) =>
    settle(reservation, usage.input, payloadChars)
  );

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      // no-transform and X-Accel-Buffering are load-bearing: without them a
      // proxy or CDN will buffer the whole stream into a single blob and
      // streaming silently stops working in production only.
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
