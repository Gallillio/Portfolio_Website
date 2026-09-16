// Wire format shared by app/api/chat/route.ts and lib/ai/chat-client.ts.
// Single source of truth so the server and the terminal UI cannot drift.

import type { ChatMessage } from "@/lib/types";

export type ChatErrorCode =
  | "BAD_REQUEST"
  | "RATE_LIMITED"
  | "UPSTREAM_RATE_LIMITED"
  | "UPSTREAM_UNAVAILABLE"
  | "UPSTREAM_ERROR"
  | "TIMEOUT"
  | "BLOCKED"
  | "EMPTY"
  | "CONFIG"
  | "UNKNOWN";

export interface ChatUsage {
  input: number;
  output: number;
  thoughts: number;
}

/**
 * BLOCKED and EMPTY are deliberately NOT "something broke" errors — the model
 * answered, it just had nothing usable to say. The UI renders them as an
 * assistant message, not as a red Chatbot Error. Conflating the two is exactly
 * what made the original bug undiagnosable.
 */
export type ChatStreamFrame =
  | { type: "delta"; text: string }
  | { type: "done"; finishReason?: string; usage?: ChatUsage }
  | { type: "error"; code: ChatErrorCode; message: string; retryable: boolean };

export interface ChatRequestBody {
  message: string;
  conversationHistory?: ChatMessage[];
}

/** Body of a non-2xx response from /api/chat. */
export interface ChatErrorBody {
  code: ChatErrorCode;
  message: string;
  retryable: boolean;
  /** Upstream detail, included outside production only. */
  detail?: string;
}

export function isChatErrorCode(value: unknown): value is ChatErrorCode {
  return (
    typeof value === "string" &&
    [
      "BAD_REQUEST",
      "RATE_LIMITED",
      "UPSTREAM_RATE_LIMITED",
      "UPSTREAM_UNAVAILABLE",
      "UPSTREAM_ERROR",
      "TIMEOUT",
      "BLOCKED",
      "EMPTY",
      "CONFIG",
      "UNKNOWN",
    ].includes(value)
  );
}
