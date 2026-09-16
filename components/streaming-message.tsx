"use client"

import React, { useImperativeHandle, useRef, useState } from "react"

export interface StreamingMessageRef {
  append: (chunk: string) => void
  getText: () => string
  reset: () => void
}

interface StreamingMessageProps {
  active: boolean
  /** Called after each paint so the terminal can follow the growing text. */
  onGrow?: () => void
}

/**
 * Renders the in-flight assistant response as a leaf node, deliberately OUTSIDE
 * the terminal's `history` array.
 *
 * Appending tokens into `history` instead would re-run TerminalOutput's
 * renderLine() over the entire transcript on every token — six regexes plus a
 * per-word command lookup per line — and would re-trigger the smooth-scroll
 * effect keyed on `history`. Keeping it here means TerminalContent re-renders
 * twice per message rather than once per token.
 *
 * Markup is kept byte-identical to the committed version in terminal.tsx so the
 * handoff at completion produces no visual jump.
 */
const StreamingMessage = React.forwardRef<StreamingMessageRef, StreamingMessageProps>(
  function StreamingMessage({ active, onGrow }, ref) {
    const [text, setText] = useState("")
    const textRef = useRef("")
    const frameRef = useRef<number | null>(null)

    const flush = () => {
      frameRef.current = null
      setText(textRef.current)
      onGrow?.()
    }

    useImperativeHandle(ref, () => ({
      append: (chunk: string) => {
        textRef.current += chunk
        // Coalesce bursts of tokens into one paint per animation frame.
        if (frameRef.current === null) {
          frameRef.current = requestAnimationFrame(flush)
        }
      },
      getText: () => textRef.current,
      reset: () => {
        if (frameRef.current !== null) {
          cancelAnimationFrame(frameRef.current)
          frameRef.current = null
        }
        textRef.current = ""
        setText("")
      },
    }))

    if (!active && !text) return null

    return (
      <div className="font-mono mt-4">
        <div className="whitespace-pre-wrap font-normal text-sm">
          <span className="text-purple-400">Gallillio Assistant:</span> {text}
          {active && <span className="terminal-cursor ml-0.5">▋</span>}
        </div>
      </div>
    )
  }
)

export default StreamingMessage
