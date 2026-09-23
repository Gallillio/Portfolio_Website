"use client"

import React from "react"

interface ChatIntroProps {
  /** Sends the question immediately, so a visitor can get an answer without typing. */
  onAsk: (question: string) => void
}

/**
 * Starter questions. Chat mode otherwise opens on a blank prompt, which NN/g
 * calls the "articulation barrier" — new users don't know what the assistant can
 * do and often leave without asking anything.
 *
 * Chosen for breadth (the current role, a ranking, recency) and grounded in the
 * generated context: the ISYS experience entry, and the Highlights section and
 * project periods in lib/ai/context.ts, so none of them can return "I don't know".
 */
const STARTERS = [
  "What does he do at ISYS?",
  "What's his most impressive project?",
  "What has he built recently?",
]

export default function ChatIntro({ onAsk }: ChatIntroProps) {
  return (
    <div className="font-mono text-sm">
      <div>
        <span className="font-semibold text-white">Gallillio</span>
        <span className="text-gray-400"> — Ahmed&apos;s AI assistant</span>
      </div>

      <div className="mt-2 text-gray-300">
        Ask me about his skills, experience or projects.
      </div>

      <div className="mt-3 flex gap-3">
        <span className="select-none text-gray-500">Try:</span>
        <div className="flex flex-col items-start gap-1">
          {STARTERS.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => onAsk(question)}
              className="cursor-pointer text-left text-blue-300 hover:text-blue-200 hover:underline"
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* Deliberately dim: not needed until the visitor is done. */}
      <div className="mt-3 text-gray-500">type exit to leave</div>
    </div>
  )
}
