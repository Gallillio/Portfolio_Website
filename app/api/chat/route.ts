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
import {
  buildPayload,
  fetchGeminiStream,
  FirstByteTimeoutError,
  promptTextChars,
  systemTextChars,
  UpstreamError,
} from "@/lib/ai/gemini";
import { admit, noteUpstream429, release, settle, unattribute, type QuotaScope } from "@/lib/ai/quota";
import { MAX_HISTORY_TURNS, MAX_MESSAGE_CHARS, MAX_TOTAL_HISTORY_CHARS } from "@/lib/ai/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Whole-request budget. */
const REQUEST_TIMEOUT_MS = 45_000;
/** Idle-between-deltas budget. Catches a hung upstream that the overall timeout would sit on. */
const STALL_TIMEOUT_MS = 20_000;
/**
 * The client sends at most MAX_HISTORY_TURNS turns, each at most one answer
 * long, so a legitimate body is well under this. The platform's own cap is far
 * larger, and parsing is the first work an anonymous request costs.
 */
const MAX_BODY_BYTES = 256_000;

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

  // Only the last few turns are ever sent upstream, so only those are read.
  // Walking back from the newest keeps the most recent turns when the
  // character budget runs out, rather than the oldest ones.
  const history: ChatMessage[] = [];
  let totalChars = 0;
  for (const entry of conversationHistory.slice(-MAX_HISTORY_TURNS).reverse()) {
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

  return { message: trimmed, conversationHistory: history.reverse() };
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
  onUsage: (usage: ChatUsage) => void,
  onCancel: () => void
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  // Set when the visitor goes away. Enqueueing after that throws, so every
  // write checks it, and the upstream read is aborted rather than left running.
  let closed = false;

  return new ReadableStream<Uint8Array>({
    cancel() {
      closed = true;
      onCancel();
    },
    async start(controller) {
      let sawText = false;
      let finishReason: string | undefined;
      let usage: ChatUsage | undefined;
      let stallTimer: ReturnType<typeof setTimeout> | undefined;
      let stalled = false;

      const send = (frame: ChatStreamFrame) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(encodeSSE(frame)));
        } catch {
          closed = true;
        }
      };

      const resetStall = () => {
        if (stallTimer) clearTimeout(stallTimer);
        stallTimer = setTimeout(() => {
          stalled = true;
        }, STALL_TIMEOUT_MS);
      };

      try {
        resetStall();

        for await (const payload of parseSSE(upstream)) {
          if (stalled || closed) break;

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
        if (closed) return; // The visitor left; the aborted upstream read is expected.
        console.error("[chat] stream failed", { requestId, error });
        send({
          type: "error",
          code: "UNKNOWN",
          message: "The connection dropped partway through the answer.",
          retryable: true,
        });
      } finally {
        if (stallTimer) clearTimeout(stallTimer);
        if (!closed) {
          closed = true;
          controller.close();
        }
      }
    },
  });
}

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }
  return originHost === request.headers.get("host") || originHost === request.headers.get("x-forwarded-host");
}

/** The body as text, or null once it passes `maxBytes`, without reading the rest. */
async function readBodyCapped(request: Request, maxBytes: number): Promise<string | null> {
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) return null;
  if (!request.body) return "";

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  return new TextDecoder().decode(Buffer.concat(chunks));
}

export async function POST(request: Request): Promise<Response> {
  const requestId = crypto.randomUUID();

  // The media type itself, not a substring: "text/plain;application/json"
  // contains the words but is a type a cross-site form may send unannounced.
  const contentType = request.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase();
  if (contentType !== "application/json") {
    return errorResponse(415, "BAD_REQUEST", "Content-Type must be application/json.");
  }

  // Browsers send Origin on every POST. Only this site's own pages may use the
  // chat; a request with no Origin (curl, a server) is not a browser being
  // borrowed by another site, and the per-client limits below still apply.
  if (!isSameOrigin(request)) {
    return errorResponse(403, "BAD_REQUEST", "Cross-site requests are not accepted.");
  }

  // Rate limit before reading the body, so a refused client costs no parsing.
  const client = clientKey(request);
  const limit = await checkRateLimit(client);
  if (!limit.ok) {
    return errorResponse(429, "RATE_LIMITED", "Too many messages. Give it a moment.", {
      retryable: true,
      retryAfterMs: limit.retryAfterSec * 1000,
    });
  }

  const text = await readBodyCapped(request, MAX_BODY_BYTES);
  if (text === null) {
    return errorResponse(413, "BAD_REQUEST", "Request body is too large.");
  }

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return errorResponse(400, "BAD_REQUEST", "Request body is not valid JSON.");
  }

  const validated = validate(raw);
  if (typeof validated === "string") {
    return errorResponse(400, "BAD_REQUEST", validated);
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
  const textChars = promptTextChars(validated.message, validated.conversationHistory);
  const floorChars = systemTextChars();

  // Refuse here, instantly and with an exact wait, when the request cannot fit
  // in this minute's free-tier budget. Calling Google anyway would only buy the
  // visitor a slower 429.
  const admission = admit(textChars, client, floorChars);
  if (!admission.ok) {
    console.log("[chat] held back by quota ledger", { requestId, ...admission });
    return quotaResponse(admission.scope, admission.retryAfterMs);
  }
  // One per attempt. A retry resends the full prompt, so it has to fit in the
  // minute's budget too, and it is only made when it does.
  const reservations = [admission.reservation];
  const beforeRetry = () => {
    const retry = admit(textChars, client, floorChars);
    if (retry.ok) reservations.push(retry.reservation);
    return retry.ok;
  };

  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  // Aborted when the visitor stops reading the answer, so the upstream read stops too.
  const streamAbort = new AbortController();
  const signal = AbortSignal.any([request.signal, timeout, streamAbort.signal]);

  let upstream: Response;
  try {
    upstream = await fetchGeminiStream(payload, { signal, apiKey, requestId, beforeRetry });
  } catch (error) {
    if (error instanceof UpstreamError) {
      if (error.status === 429) {
        // Refused outright, so nothing was counted. Every other failure keeps
        // its reservations: a 500, a hang or a visitor leaving may still have
        // been charged against the minute by Google.
        reservations.forEach(release);
        const { retryAfterMs, scope } = noteUpstream429(
          error.quota ?? { scope: "per-minute", metric: "unknown" }
        );
        return quotaResponse(scope, retryAfterMs, error.detail);
      }
      if (error.status === 503 || error.status === 500 || error.status === 504) {
        reservations.forEach(unattribute);
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

    if (timeout.aborted || error instanceof FirstByteTimeoutError) {
      reservations.forEach(unattribute);
      console.error("[chat] upstream timed out", { requestId, firstByte: error instanceof FirstByteTimeoutError });
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
  }

  const stream = toClientStream(
    upstream.body as ReadableStream<Uint8Array>,
    requestId,
    (usage) => settle(reservations[reservations.length - 1], usage.input, textChars),
    () => streamAbort.abort()
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
