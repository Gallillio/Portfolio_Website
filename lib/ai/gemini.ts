// Upstream client for the Google Generative Language API.
//
// The critical ordering guarantee lives here: fetch() resolves on RESPONSE
// HEADERS, not the body. Google's 429/503/400 arrives in those headers. So every
// retry happens, and every upstream failure is detected, BEFORE the route builds
// its own Response — which is what lets those failures carry a real HTTP status
// code instead of having to be smuggled in-band through an already-200 stream.

import type { ChatMessage } from "@/lib/types";
import {
  GEMINI_MODEL,
  GENERATION_CONFIG,
  MAX_HISTORY_TURNS,
  SUPPORTS_SYSTEM_INSTRUCTION,
  SYSTEM_INSTRUCTION,
} from "@/lib/ai/config";
import { PORTFOLIO_CONTEXT } from "@/lib/ai/context";
import { parseQuotaError, type QuotaInfo } from "@/lib/ai/quota";

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

/**
 * Retrying a 400/401/403 only triples the latency of an error you were always
 * going to show. A 429 is not retried either: the free-tier caps do not clear in
 * the few seconds a retry could wait, and each retry spends a request of its own.
 * The route turns the 429 into a countdown instead.
 */
const RETRYABLE_STATUS = new Set([500, 502, 503, 504]);
const MAX_ATTEMPTS = 3;

export class UpstreamError extends Error {
  constructor(
    readonly status: number,
    readonly googleStatus: string | undefined,
    readonly detail: string,
    /** Present on a 429: which cap was hit and how long Google says to wait. */
    readonly quota?: QuotaInfo
  ) {
    super(`Gemini API request failed with ${status}: ${detail.slice(0, 300)}`);
    this.name = "UpstreamError";
  }
}

function systemText(): string {
  return `${SYSTEM_INSTRUCTION}\n\n<portfolio_data>\n${PORTFOLIO_CONTEXT}\n</portfolio_data>`;
}

export function buildPayload(message: string, history: ChatMessage[]): unknown {
  const recent = history.slice(-MAX_HISTORY_TURNS);
  const historyContents = recent.map((m) => ({
    role: m.role,
    parts: [{ text: m.content }],
  }));
  const userContent = { role: "user", parts: [{ text: message }] };

  if (SUPPORTS_SYSTEM_INSTRUCTION) {
    return {
      systemInstruction: { parts: [{ text: systemText() }] },
      contents: [...historyContents, userContent],
      generationConfig: GENERATION_CONFIG,
    };
  }

  // Fallback for a model without systemInstruction support: prepend the context
  // as a leading user turn plus a canned model acknowledgement.
  return {
    contents: [
      { role: "user", parts: [{ text: systemText() }] },
      {
        role: "model",
        parts: [
          {
            text: "Understood. I am Ahmed Galal Elzeky's portfolio assistant. How can I help you learn about Ahmed?",
          },
        ],
      },
      ...historyContents,
      userContent,
    ],
    generationConfig: GENERATION_CONFIG,
  };
}

function parseGoogleError(body: string): { status?: string; message?: string } {
  try {
    const parsed = JSON.parse(body) as { error?: { status?: string; message?: string } };
    return { status: parsed.error?.status, message: parsed.error?.message };
  } catch {
    return {};
  }
}

function backoffMs(attempt: number, retryAfter: string | null): number {
  if (retryAfter) {
    const seconds = Number(retryAfter);
    // If the server says wait 60s, don't — fail fast and tell the user.
    if (Number.isFinite(seconds) && seconds > 0) return Math.min(seconds * 1000, 8_000);
  }
  return Math.min(500 * 2 ** attempt, 4_000) + Math.random() * 250;
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(signal.reason);
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    function onAbort() {
      clearTimeout(timer);
      reject(signal.reason);
    }
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

/**
 * Resolves ONLY with an ok response whose body has not been consumed.
 * Throws UpstreamError otherwise.
 */
export async function fetchGeminiStream(
  payload: unknown,
  opts: { signal: AbortSignal; apiKey: string; requestId: string }
): Promise<Response> {
  const url = `${ENDPOINT}/${GEMINI_MODEL}:streamGenerateContent?alt=sse`;
  let lastError: UpstreamError | undefined;

  for (let attempt = 0; ; attempt++) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Header rather than a query param, so the key stays out of upstream
        // access logs and out of error strings.
        "x-goog-api-key": opts.apiKey,
      },
      body: JSON.stringify(payload),
      signal: opts.signal,
    });

    if (response.ok) {
      if (!response.body) {
        throw new UpstreamError(502, undefined, "Upstream returned no response body");
      }
      return response;
    }

    // Must drain the body or the socket leaks.
    const body = await response.text();
    const googleError = parseGoogleError(body);

    const quota = response.status === 429 ? parseQuotaError(body) : undefined;

    console.error("[chat] upstream error", {
      requestId: opts.requestId,
      attempt,
      httpStatus: response.status,
      googleStatus: googleError.status,
      googleMessage: googleError.message,
      quota,
      model: GEMINI_MODEL,
    });

    lastError = new UpstreamError(
      response.status,
      googleError.status,
      googleError.message ?? body.slice(0, 1000),
      quota
    );

    if (!RETRYABLE_STATUS.has(response.status) || attempt >= MAX_ATTEMPTS - 1) {
      throw lastError;
    }

    await sleep(backoffMs(attempt, response.headers.get("retry-after")), opts.signal);
  }
}
