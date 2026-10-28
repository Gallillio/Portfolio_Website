"use client"

import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import { renderTerminalMarkdown } from "@/lib/ai/markdown"

export interface StreamingMessageRef {
  append: (chunk: string) => void
  /** Signals no more input; resolves once the buffer has finished drawing. */
  finish: () => Promise<void>
  getText: () => string
  reset: () => void
}

interface StreamingMessageProps {
  active: boolean
  /** Called after each repaint so the terminal can follow the growing text. */
  onGrow?: () => void
}

// Gemini emits large multi-sentence chunks and gives no way to shrink them, so
// arrival is decoupled from display: text lands in a buffer and is drawn at a
// controlled rate. Without this, one chunk = one jarring visual jump.
const BASE_CHARS_PER_SEC = 200
const MAX_CHARS_PER_SEC = 3000
// How hard to hurry when text is queued. Tuned by simulating the loop at 60fps:
// keeps the tail after the model finishes near 0.9s for a typical long answer
// and under 1.3s for a very long one, while short answers still type calmly.
const CATCHUP = 2
// If no animation frame lands within this long while text is waiting, the tab is
// throttled (backgrounded, or an unfocused window in some browsers). Draw the
// rest immediately rather than leave finish() pending and the input locked.
const FRAME_STALL_MS = 1000

/**
 * Drain rate scales with how much text is waiting. Short answers type at a
 * relaxed pace; long ones visibly hurry so the drawing never lags far behind
 * the model. Keeps the worst-case tail near a second.
 */
function rateFor(backlog: number): number {
  return Math.min(MAX_CHARS_PER_SEC, BASE_CHARS_PER_SEC + backlog * CATCHUP)
}

const StreamingMessage = React.forwardRef<StreamingMessageRef, StreamingMessageProps>(
  function StreamingMessage({ active, onGrow }, ref) {
    const [text, setText] = useState("")

    const shownRef = useRef("")
    const pendingRef = useRef("")
    const rafRef = useRef<number | null>(null)
    const lastTickRef = useRef(0)
    // Fractional characters carried between frames, so slow rates still advance.
    const creditRef = useRef(0)
    const finishedRef = useRef(false)
    const drainedResolveRef = useRef<(() => void) | null>(null)
    const watchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const clearWatchdog = useCallback(() => {
      if (watchdogRef.current !== null) {
        clearTimeout(watchdogRef.current)
        watchdogRef.current = null
      }
    }, [])

    const stopLoop = useCallback(() => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      clearWatchdog()
    }, [clearWatchdog])

    const settleIfDrained = useCallback(() => {
      if (pendingRef.current.length === 0 && finishedRef.current) {
        stopLoop()
        drainedResolveRef.current?.()
        drainedResolveRef.current = null
        return true
      }
      return false
    }, [stopLoop])

    /** Draw everything at once — used when the tab is hidden or on teardown. */
    const flushAll = useCallback(() => {
      if (pendingRef.current) {
        shownRef.current += pendingRef.current
        pendingRef.current = ""
        setText(shownRef.current)
      }
      settleIfDrained()
    }, [settleIfDrained])

    const tick = useCallback(
      (now: number) => {
        const dt = Math.min((now - lastTickRef.current) / 1000, 0.25)
        lastTickRef.current = now

        const backlog = pendingRef.current.length
        if (backlog === 0) {
          rafRef.current = null
          if (!settleIfDrained()) creditRef.current = 0
          return
        }

        const budget = creditRef.current + rateFor(backlog) * dt
        const take = Math.floor(budget)
        creditRef.current = budget - take

        if (take > 0) {
          shownRef.current += pendingRef.current.slice(0, take)
          pendingRef.current = pendingRef.current.slice(take)
          setText(shownRef.current)
        }

        if (pendingRef.current.length === 0 && settleIfDrained()) return
        if (watchdogRef.current !== null) clearTimeout(watchdogRef.current)
        watchdogRef.current = setTimeout(() => {
          watchdogRef.current = null
          if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current)
            rafRef.current = null
          }
          flushAll()
        }, FRAME_STALL_MS)
        rafRef.current = requestAnimationFrame(tick)
      },
      [flushAll, settleIfDrained]
    )

    const armWatchdog = useCallback(() => {
      clearWatchdog()
      watchdogRef.current = setTimeout(() => {
        watchdogRef.current = null
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current)
          rafRef.current = null
        }
        flushAll()
      }, FRAME_STALL_MS)
    }, [clearWatchdog, flushAll])

    const startLoop = useCallback(() => {
      armWatchdog()
      if (rafRef.current !== null) return
      lastTickRef.current = performance.now()
      rafRef.current = requestAnimationFrame(tick)
    }, [armWatchdog, tick])

    // requestAnimationFrame is paused in background tabs, which would stall the
    // drain and leave finish() hanging forever. Nobody is watching the animation
    // there anyway, so just draw it all.
    useEffect(() => {
      const onVisibility = () => {
        if (document.hidden) {
          stopLoop()
          flushAll()
        } else if (pendingRef.current) {
          startLoop()
        }
      }
      document.addEventListener("visibilitychange", onVisibility)
      return () => document.removeEventListener("visibilitychange", onVisibility)
    }, [flushAll, startLoop, stopLoop])

    useLayoutEffect(() => {
      if (text) onGrow?.()
    }, [text, onGrow])

    useEffect(() => stopLoop, [stopLoop])

    useImperativeHandle(ref, () => ({
      append: (chunk: string) => {
        if (!chunk) return
        pendingRef.current += chunk
        if (document.hidden) {
          flushAll()
          return
        }
        startLoop()
      },

      finish: () => {
        finishedRef.current = true
        if (pendingRef.current.length === 0) {
          stopLoop()
          return Promise.resolve()
        }
        if (document.hidden) {
          flushAll()
          return Promise.resolve()
        }
        startLoop()
        return new Promise<void>((resolve) => {
          drainedResolveRef.current = resolve
        })
      },

      getText: () => shownRef.current + pendingRef.current,

      reset: () => {
        stopLoop()
        clearWatchdog()
        // Never leave a pending finish() unresolved — that would lock the input.
        drainedResolveRef.current?.()
        drainedResolveRef.current = null
        finishedRef.current = false
        creditRef.current = 0
        shownRef.current = ""
        pendingRef.current = ""
        setText("")
      },
    }))

    if (!active && !text) return null

    return (
      <div className="font-mono mt-4">
        <div className="whitespace-pre-wrap [overflow-wrap:anywhere] font-normal text-sm">
          {renderTerminalMarkdown(
            text,
            <span className="text-purple-400">Gallillio Assistant: </span>
          )}
          {active && <span className="terminal-cursor ml-0.5">▋</span>}
        </div>
      </div>
    )
  }
)

export default StreamingMessage
