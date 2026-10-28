"use client"

import React from "react"

interface ChatFollowUpsProps {
  /** The question the answer above replied to; never offered again. */
  question: string
  answer: string
  /** Asks the question as if it had been typed. */
  onAsk: (question: string) => void
}

/**
 * Two or three questions to ask next, after each answer. Without them every
 * turn means typing, which on a phone means the keyboard; NN/g's "related
 * prompts" advice for AI chat.
 *
 * A fixed list by topic rather than suggestions from the model: they appear
 * at once, cost nothing, and each is answerable from the generated context in
 * lib/ai/context.ts (Highlights, experience, skills, projects, achievements,
 * contact), so none of them leads to "I don't know".
 */
const TOPICS: { match: RegExp; questions: string[] }[] = [
  {
    match: /\b(sia|isys|intelligent systems|watsonx|enterprise)\b/i,
    questions: ["What did he build at ISYS?", "Which AI providers does SIA use?", "What are his other projects?"],
  },
  {
    match: /\b(project|built|build|app|comic spot|lango|gptube|swipelabs)\b/i,
    questions: ["Which of his projects are live?", "What tech stack does he use most?", "What did he build at ISYS?"],
  },
  {
    match: /\b(skill|stack|language|python|typescript|framework|llm|rag)\b/i,
    questions: ["Which projects show his LLM work?", "What has he published?", "What did he build at ISYS?"],
  },
  {
    match: /\b(paper|publish|research|award|certif|education|degree|university)\b/i,
    questions: ["What was his paper about?", "What awards has he won?", "What certifications does he have?"],
  },
  {
    match: /\b(contact|email|phone|hire|reach)\b/i,
    questions: ["What is SIA and what did he build?", "What has he built recently?", "What are his strongest skills?"],
  },
]

const FALLBACK = ["What's his most impressive project?", "What are his strongest skills?", "How can I contact him?"]

export function followUpsFor(question: string, answer: string): string[] {
  const asked = question.trim().toLowerCase()
  // The question decides the topic; the answer only when the question names none.
  const topic = TOPICS.find(({ match }) => match.test(question)) ?? TOPICS.find(({ match }) => match.test(answer))
  return (topic?.questions ?? FALLBACK).filter((q) => q.toLowerCase() !== asked).slice(0, 3)
}

export default function ChatFollowUps({ question, answer, onAsk }: ChatFollowUpsProps) {
  const questions = followUpsFor(question, answer)
  if (questions.length === 0) return null

  return (
    <div className="mt-3 flex gap-3 font-mono text-sm" role="group" aria-label="Suggested questions">
      <span className="select-none text-gray-500">Next:</span>
      <div className="flex flex-col items-start gap-1 coarse:gap-2">
        {questions.map((q) => (
          <button
            key={q}
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onAsk(q)
            }}
            className="touch-hit cursor-pointer text-left text-blue-300 hover:text-blue-200 hover:underline coarse:underline coarse:decoration-blue-300/40 underline-offset-4"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}
