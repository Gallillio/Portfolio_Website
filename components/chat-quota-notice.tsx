"use client"

import React, { useEffect, useState } from "react"
import type { ChatErrorCode } from "@/lib/ai/protocol"

/**
 * per-minute and per-day are Google's free-tier caps, shared by every visitor;
 * visitor is our own per-IP limiter in lib/ai/rate-limit.ts.
 */
export type QuotaKind = "per-minute" | "per-day" | "visitor"

const KIND_BY_CODE: Partial<Record<ChatErrorCode, QuotaKind>> = {
  UPSTREAM_RATE_LIMITED: "per-minute",
  UPSTREAM_QUOTA_EXHAUSTED: "per-day",
  RATE_LIMITED: "visitor",
}

export function quotaKindFor(code: ChatErrorCode): QuotaKind | undefined {
  return KIND_BY_CODE[code]
}

/** "0:42", or "7h 12m" once the wait is an hour or more. */
export function formatWait(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  if (total >= 3600) {
    return `${Math.floor(total / 3600)}h ${Math.floor((total % 3600) / 60)}m`
  }
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`
}

/** Plain-language wait for screen readers, which would read "0:42" as a time of day. */
function spokenWait(ms: number): string {
  const total = Math.max(1, Math.ceil(ms / 1000))
  if (total >= 3600) return `about ${Math.round(total / 3600)} hours`
  if (total >= 90) return `about ${Math.round(total / 60)} minutes`
  return `${total} seconds`
}

/** `wait` is the sentence holding the countdown; it is dropped once the wait is over. */
const COPY: Record<QuotaKind, { reason: string; wait: [string, string]; tail?: string }> = {
  "per-minute": {
    reason:
      "Sorry, this chat runs on Google's free Gemini API, which only allows a few messages per minute across everyone visiting the site, and that limit has just been reached.",
    wait: ["It'll be back in ", "."],
  },
  "per-day": {
    reason:
      "Sorry, this chat runs on Google's free Gemini API, and today's message allowance has been used up.",
    wait: ["It resets at midnight Pacific time, in ", "."],
    tail: "The rest of the site works as usual: try 'projects', 'experience' or 'about'.",
  },
  visitor: {
    reason: "You're sending messages faster than this free chat allows.",
    wait: ["You can send the next one in ", "."],
  },
}

interface ChatQuotaNoticeProps {
  kind: QuotaKind
  /** Epoch ms when the chat can answer again, computed on the visitor's clock. */
  retryAt: number
  /** The question that was held back, offered again once the wait is over. */
  question: string
  /** Asks the question as if it had been typed. */
  onAsk: (question: string) => void
}

/**
 * Shown instead of an answer when a free-tier limit is reached. It is committed
 * into the transcript like ChatFollowUps, so it keeps ticking after it lands.
 *
 * The remaining time is derived from Date.now() on every tick rather than
 * counted down, so a background tab that throttles the interval still shows the
 * right number the moment it is looked at again.
 */
export default function ChatQuotaNotice({ kind, retryAt, question, onAsk }: ChatQuotaNoticeProps) {
  const [now, setNow] = useState(() => Date.now())
  // Frozen at arrival: a status text that changed every tick would be read out every tick.
  const [arrival] = useState(() => `Chat paused. It will be back in ${spokenWait(retryAt - Date.now())}.`)
  const remaining = retryAt - now
  const back = remaining <= 0

  useEffect(() => {
    if (back) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [back])

  const { reason, wait, tail } = COPY[kind]

  return (
    <div className="whitespace-pre-wrap [overflow-wrap:anywhere] font-normal text-sm">
      {/* Announced twice only, on arrival and when the chat is back, never per tick. */}
      <span className="sr-only" role="status">
        {back ? "The chat is back." : arrival}
      </span>
      <div className="text-amber-300">
        <span className="text-purple-400">Gallillio Assistant: </span>
        {reason}
        {!back && (
          <>
            {" "}
            {wait[0]}
            <span className="font-semibold tabular-nums text-amber-200">{formatWait(remaining)}</span>
            {wait[1]}
          </>
        )}
        {tail && ` ${tail}`}
      </div>
      {back && (
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 font-mono text-sm">
          <span className="select-none whitespace-nowrap text-green-400">The chat is back.</span>
          {question && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onAsk(question)
              }}
              className="touch-hit cursor-pointer text-left text-blue-300 hover:text-blue-200 hover:underline coarse:underline coarse:decoration-blue-300/40 underline-offset-4"
            >
              Ask again: &ldquo;{question}&rdquo;
            </button>
          )}
        </div>
      )}
    </div>
  )
}
