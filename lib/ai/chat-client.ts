// Browser-side client for /api/chat.

import type { ChatMessage } from "@/lib/types";
import type { ChatErrorBody, ChatErrorCode, ChatStreamFrame } from "@/lib/ai/protocol";
import { isChatErrorCode } from "@/lib/ai/protocol";
import { parseSSE } from "@/lib/ai/sse";

export class ChatError extends Error {
  constructor(
    readonly code: ChatErrorCode,
    message: string,
    readonly retryable: boolean = false,
    /** Set for the limit codes: how long until the chat can answer again. */
    readonly retryAfterMs?: number
  ) {
    super(message);
    this.name = "ChatError";
  }
}

export interface StreamChatHandlers {
  onDelta: (text: string) => void;
  /** May be async: the UI awaits its typewriter buffer draining before committing. */
  onDone: (full: string, meta?: { finishReason?: string }) => void | Promise<void>;
  /** `partial` carries whatever text had already streamed before the failure. */
  onError: (error: {
    code: ChatErrorCode;
    message: string;
    retryable: boolean;
    partial: string;
    retryAfterMs?: number;
  }) => void | Promise<void>;
}

export async function streamChat(
  args: { message: string; history: ChatMessage[]; signal?: AbortSignal },
  handlers: StreamChatHandlers
): Promise<void> {
  let full = "";

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: args.message, conversationHistory: args.history }),
      signal: args.signal,
    });

    if (!res.ok) {
      // The single most important change in the rebuild. The old code did
      // `if (!res.ok) throw new Error('Failed to get response from bot')` and
      // never read the body, so every cause collapsed into one opaque string.
      const raw = await res.text();
      let parsed: Partial<ChatErrorBody> | undefined;
      try {
        parsed = JSON.parse(raw) as Partial<ChatErrorBody>;
      } catch {
        // Not JSON — e.g. a proxy's HTML error page.
      }
      // The header is the fallback for a body that lost the field (a proxy page).
      const headerSec = Number(res.headers.get("retry-after"));
      const retryAfterMs =
        typeof parsed?.retryAfterMs === "number" && parsed.retryAfterMs > 0
          ? parsed.retryAfterMs
          : Number.isFinite(headerSec) && headerSec > 0
            ? headerSec * 1000
            : undefined;
      throw new ChatError(
        isChatErrorCode(parsed?.code) ? parsed.code : "UNKNOWN",
        parsed?.message || raw.slice(0, 300) || res.statusText || "Request failed.",
        parsed?.retryable ?? false,
        retryAfterMs
      );
    }

    if (!res.body) throw new ChatError("UNKNOWN", "The server sent an empty response.", true);

    let finishReason: string | undefined;

    for await (const payload of parseSSE(res.body)) {
      let frame: ChatStreamFrame;
      try {
        frame = JSON.parse(payload) as ChatStreamFrame;
      } catch {
        continue;
      }

      if (frame.type === "delta") {
        full += frame.text;
        handlers.onDelta(frame.text);
      } else if (frame.type === "error") {
        throw new ChatError(frame.code, frame.message, frame.retryable);
      } else if (frame.type === "done") {
        finishReason = frame.finishReason;
      }
    }

    await handlers.onDone(full, { finishReason });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return;

    if (error instanceof ChatError) {
      await handlers.onError({
        code: error.code,
        message: error.message,
        retryable: error.retryable,
        partial: full,
        retryAfterMs: error.retryAfterMs,
      });
      return;
    }

    await handlers.onError({
      code: "UNKNOWN",
      message: error instanceof Error ? error.message : "Something went wrong.",
      retryable: true,
      partial: full,
    });
  }
}
