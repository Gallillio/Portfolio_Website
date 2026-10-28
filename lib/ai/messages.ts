// Visitor-facing copy for each failure code.
//
// The server keeps returning precise technical messages (visible in the network
// tab and the server logs) — this is purely presentation. Most failures are
// Ahmed's problem, not the visitor's, so they read as the assistant talking
// rather than as a red stack-trace-shaped error.

import type { ChatErrorCode } from "@/lib/ai/protocol";

export type MessageTone = "assistant" | "error";

export interface DisplayMessage {
  text: string;
  tone: MessageTone;
}

const DISPLAY: Record<ChatErrorCode, DisplayMessage> = {
  // The three limit codes normally carry retryAfterMs and are drawn by
  // components/chat-quota-notice.tsx with a live countdown. These lines are the
  // fallback for a response that lost the wait time; keep the wording in step.
  //
  // Google's per-minute limit (RPM/TPM). Clears within about a minute, so do NOT
  // tell the visitor to come back later — they'd leave when a retry would work.
  // Name the quota explicitly: otherwise this reads as the site being broken.
  UPSTREAM_RATE_LIMITED: {
    text: "Sorry, this chat runs on Google's free Gemini API, which only allows a few messages per minute across everyone visiting the site, and that limit has just been reached. Give it a minute and ask again.",
    tone: "assistant",
  },
  // Google's per-day cap (RPD), which resets at midnight Pacific. This one
  // genuinely is "come back later".
  UPSTREAM_QUOTA_EXHAUSTED: {
    text: "Sorry, this chat runs on Google's free Gemini API, and today's message allowance has been used up. It resets at midnight Pacific time. The rest of the site works as usual: try 'projects', 'experience' or 'about'.",
    tone: "assistant",
  },
  // Our own per-IP limiter: this one IS the visitor, so nudge them gently.
  RATE_LIMITED: {
    text: "Easy there — you're asking faster than I can think. Give me a few seconds and try again.",
    tone: "assistant",
  },
  UPSTREAM_UNAVAILABLE: {
    text: "My brain is a little overloaded at the moment. Give it a moment and ask me again — or have a look around 'projects' while I catch up.",
    tone: "assistant",
  },
  // Most often Google's free endpoint sending nothing at all for 15 seconds
  // (the route's first-byte timeout), so don't word it as a half-finished answer.
  TIMEOUT: {
    text: "Sorry, the free Gemini API this chat runs on didn't answer in time. That happens now and then; ask again and it usually goes through.",
    tone: "assistant",
  },
  CONFIG: {
    text: "I'm not quite plugged in right now — Gallillio has been notified. The rest of the portfolio still works: try 'projects' or 'about'.",
    tone: "assistant",
  },
  EMPTY: {
    text: "I couldn't put an answer together for that one. Try rephrasing it?",
    tone: "assistant",
  },
  BLOCKED: {
    text: "I'd rather not answer that one. Ask me about Ahmed's work instead.",
    tone: "assistant",
  },
  // The remainder are genuine bugs worth showing as errors.
  UPSTREAM_ERROR: { text: "", tone: "error" },
  BAD_REQUEST: { text: "", tone: "error" },
  UNKNOWN: { text: "", tone: "error" },
};

/** `serverMessage` is used verbatim for codes that represent real bugs. */
export function displayMessageFor(code: ChatErrorCode, serverMessage: string): DisplayMessage {
  const entry = DISPLAY[code];
  if (!entry || entry.tone === "error") {
    return { text: serverMessage || "Sorry, something went wrong. Please try again.", tone: "error" };
  }
  return entry;
}
