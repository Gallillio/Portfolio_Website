"use client"

import React, { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo, useImperativeHandle } from "react"
import { ArrowRight } from "lucide-react"
import { useAchievements } from "@/lib/achievements-context"
import { availableCommands } from "@/lib/commands"
import { hasTextSelection } from "@/lib/utils"
import { isCoarsePointer, prefersReducedMotion } from "@/lib/media"

interface TerminalInputProps {
  onCommand: (command: string) => void
  /** Stops the answer being written, keeping what has arrived. */
  onStop?: () => void
  isChatMode?: boolean
  isBotResponding?: boolean
}

export interface TerminalInputRef {
  setValue: (value: string) => void;
  focus: () => void;
  /**
   * Types a command into the prompt and runs it, as if the visitor had typed it
   * and pressed Enter, so the achievements count it the same way. On a touch
   * screen the prompt is left unfocused: a tapped command shouldn't open the
   * keyboard.
   */
  run: (command: string) => void;
}

// A tapped command types itself out quickly, then runs: fast enough that no one
// waits for it, slow enough to read as typing. Long chat questions type faster
// so the whole line still takes TYPING_MAX_MS.
const TYPING_CHAR_MS = 35
const TYPING_MAX_MS = 400
const TYPING_PAUSE_MS = 80

const TerminalInput = React.forwardRef<TerminalInputRef, TerminalInputProps>(({ onCommand, onStop, isChatMode = false, isBotResponding = false }, ref) => {
  const [input, setInput] = useState("")
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  // The rest of the command the input is a prefix of. Derived rather than kept
  // in state: an effect that stored it queued an extra render on every
  // keystroke, and once the grown box made keystrokes costlier, fast typing
  // outran those renders until React bailed with "Maximum update depth".
  const suggestion = useMemo(() => {
    if (!input.trim()) return ""
    const inputLower = input.toLowerCase()
    const matchingCommand = availableCommands.find(cmd =>
      cmd.toLowerCase().startsWith(inputLower) && cmd.toLowerCase() !== inputLower
    )
    return matchingCommand ? matchingCommand.slice(input.length) : ""
  }, [input])
  const [animateArrow, setAnimateArrow] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { executeCommand: trackCommand, markCommandExecuted, visitTab, executeSecretCommand } = useAchievements()
  const [hasMarkedVisit, setHasMarkedVisit] = useState(false)
  // The next step of a command typing itself out. A new tap or a key press
  // cancels it, so the latest choice wins.
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cancelTyping = () => {
    if (typingTimer.current) clearTimeout(typingTimer.current)
    typingTimer.current = null
  }
  useEffect(() => cancelTyping, [])

  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    // preventScroll matters: the input sits at the bottom of the output, so the
    // browser's default "scroll the focused element into view" turns any focus
    // into a jump to the bottom. Callers that genuinely want to move the view
    // there scroll explicitly.
    focus: () => inputRef.current?.focus({ preventScroll: true }),
    setValue: (value: string) => setInput(value),
    run: (command: string) => {
      cancelTyping()
      if (prefersReducedMotion() || !command) {
        submitRef.current(command, { fromTap: true })
        return
      }
      const step = Math.min(TYPING_CHAR_MS, TYPING_MAX_MS / command.length)
      let typed = 0
      const tick = () => {
        typed++
        setInput(command.slice(0, typed))
        typingTimer.current = typed < command.length
          ? setTimeout(tick, step)
          : setTimeout(() => {
              typingTimer.current = null
              submitRef.current(command, { fromTap: true })
            }, TYPING_PAUSE_MS)
      }
      tick()
    },
  }))

  // Mark this tab as visited for the site explorer achievement - only once
  useEffect(() => {
    if (!hasMarkedVisit) {
      visitTab("terminal")
      setHasMarkedVisit(true)
    }
  }, [visitTab, hasMarkedVisit])

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus({ preventScroll: true })
  }, [])

  // A terminal opens on its prompt. When the output is taller than the panel
  // (a phone in landscape on first load, or coming back to a long conversation
  // from another tab, which remounts the panel), start scrolled to the bottom
  // instead of the top, where the prompt was out of sight.
  useEffect(() => {
    const el = inputRef.current
    const scroller = el?.closest<HTMLElement>("[data-terminal-scroll]")
    if (!el || !scroller) return
    const reveal = () => {
      if (el.getBoundingClientRect().bottom > scroller.getBoundingClientRect().bottom) {
        scroller.scrollTop = scroller.scrollHeight
      }
    }
    reveal()
    // Again once the ASCII art has settled its scaled height, a frame later.
    let second = 0
    const first = requestAnimationFrame(() => { second = requestAnimationFrame(reveal) })
    return () => { cancelAnimationFrame(first); cancelAnimationFrame(second) }
  }, [])

  // Pulse the arrow animation periodically when suggestion is present
  useEffect(() => {
    if (suggestion) {
      // Initial animation when suggestion appears
      setAnimateArrow(true)
      setTimeout(() => setAnimateArrow(false), 1000)
      
      const interval = setInterval(() => {
        setAnimateArrow(true)
        setTimeout(() => setAnimateArrow(false), 1000)
      }, 3000)
      
      return () => clearInterval(interval)
    }
  }, [suggestion])

  // Scroll to view when input receives focus or a new command is input
  useEffect(() => {
    const currentInputRef = inputRef.current; // Capture the current ref value
    const handleFocus = () => {
      // Mobile only, on purpose. This exists so the on-screen keyboard does not
      // cover the input. On desktop there is no keyboard to avoid, and it was
      // the reason clicking anywhere in the output yanked the view to the
      // bottom — every other mobile path in this file is gated the same way.
      if (window.innerWidth >= 768) return
      setTimeout(() => {
        if (currentInputRef) {
          // Scroll the terminal input into view
          currentInputRef.scrollIntoView({ behavior: 'smooth', block: 'end' })
        }
      }, 100)
    }
    
    if (currentInputRef) {
      currentInputRef.addEventListener('focus', handleFocus)
      return () => {
        currentInputRef.removeEventListener('focus', handleFocus)
      }
    }
  }, [])

  // Shared by the form's submit and Enter in the textarea (a textarea, unlike
  // an input, doesn't submit its form on Enter).
  // run() also lands here, with the text it typed out.
  const submit = (text: string = input, { fromTap = false } = {}) => {
    if (!text.trim()) return
    // Ignore submits while a response streams. We gate here rather than on the
    // input's `disabled` attribute, because a disabled input fires no keydown —
    // which silently swallowed the Ctrl+C cancel below for the whole response.
    if (isBotResponding) {
      if (fromTap) setInput("")
      return
    }

    const trimmedInput = text.trim()
    
    // Process command for achievements
    markCommandExecuted() // Count total commands
    trackCommand(trimmedInput) // Track unique commands

    // Check for secret commands
    const command = trimmedInput.toLowerCase()
    if (command === "hello" || command === "hi" || command === "hey") {
      executeSecretCommand("hello")
    } else if (command === "this-site-is-cool") {
      // Track this as a secret command, but the actual unlocking happens in terminal.tsx
      executeSecretCommand("this-site-is-cool")
    } else if (command === "enable-night-owl") {
      // Track this as a secret command, but the actual unlocking happens in terminal.tsx
      executeSecretCommand("enable-night-owl")
    }

    // Execute the command
    onCommand(trimmedInput)

    // Add to command history
    setCommandHistory((prev) => [...prev, trimmedInput])
    setHistoryIndex(-1)
    setInput("")

    // Keep typing where the visitor was typing. A tapped command leaves the
    // keyboard closed on a touch screen; the terminal scrolls to its output.
    if (fromTap && isCoarsePointer()) return
    setTimeout(() => {
      inputRef.current?.focus({ preventScroll: true })
    }, 100)
  }
  // The typing timers outlive the render that started them; they call the
  // latest submit, which sees the current chat mode and streaming state.
  const submitRef = useRef(submit)
  useEffect(() => {
    submitRef.current = submit
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submit()
  }

  // Once the text wraps, the arrows belong to the caret, not to history.
  const isSingleLine = () => {
    const el = inputRef.current
    if (!el) return true
    return el.scrollHeight <= parseFloat(getComputedStyle(el).lineHeight) * 1.5
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends. Shift+Enter is a newline, but only in chat: commands are one
    // line. isComposing leaves Enter to IME users confirming a word.
    if (e.key === "Enter" && !e.nativeEvent.isComposing && !(isChatMode && e.shiftKey)) {
      e.preventDefault()
      submit()
      return
    }

    // Handle up/down arrows for command history
    if (e.key === "ArrowUp" && isSingleLine()) {
      e.preventDefault()
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setInput(commandHistory[commandHistory.length - 1 - newIndex])
      }
    } else if (e.key === "ArrowDown" && isSingleLine()) {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setInput(commandHistory[commandHistory.length - 1 - newIndex])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setInput("")
      }
    } else if (e.key === "Tab" && suggestion) {
      e.preventDefault()
      setInput(prev => prev + suggestion)
    } else if (e.ctrlKey && e.key === "c") {
      // Exit chatbot mode when Ctrl + C is pressed
      if (isChatMode) {
        onCommand("exit") // Call the onCommand function with "exit"
      }
    }
  }

  // Grow with the text up to the CSS max-height, then scroll, like a chat box.
  // Measured in JS rather than with field-sizing: content, which iOS Safari
  // only gained in 26.2.
  const fitHeight = useCallback(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
  }, [])

  useLayoutEffect(fitHeight, [input, isChatMode, isBotResponding, fitHeight])

  // Width changes (rotation, fullscreen) re-wrap the text.
  useEffect(() => {
    window.addEventListener("resize", fitHeight)
    return () => window.removeEventListener("resize", fitHeight)
  }, [fitHeight])

  // An empty box shows a block cursor and a hint, so the prompt reads as
  // somewhere to type before anything has focus. The native caret is hidden
  // meanwhile, or the two would sit side by side. This keys off the value, not
  // focus: the SSR autofocus lands before hydration (no focus event), and iOS
  // reports a programmatically focused field as focused with no caret drawn.
  const showBlock = input === "" && !isBotResponding
  const caretClass = showBlock ? "caret-transparent" : isChatMode ? "caret-blue-300" : "caret-green-500"

  const focusInput = () => {
    // Don't steal focus out from under a selection the user is making.
    if (hasTextSelection()) return
    inputRef.current?.focus({ preventScroll: true })
  }

  // Tab completes on a keyboard; on a touch screen the completion is a button
  // beside the prompt. Pointer down is prevented so the tap doesn't take focus
  // from the prompt and close the keyboard mid-word.
  const completeButton = suggestion && !isChatMode && (
    <button
      type="button"
      onPointerDown={(e) => e.preventDefault()}
      onClick={(e) => {
        e.stopPropagation()
        setInput((prev) => prev + suggestion)
      }}
      className="hidden coarse:inline-flex shrink-0 items-center gap-1 self-center rounded border border-green-500/50 px-2.5 min-h-[36px] ml-2 font-mono text-sm text-green-300 active:bg-green-500/20"
      aria-label={`Complete to ${input}${suggestion}`}
    >
      {input}{suggestion}
      <ArrowRight size={14} aria-hidden="true" />
    </button>
  )

  return (
    // The whole row takes a tap, so the prompt is easy to hit with a finger.
    <div onClick={focusInput} className="cursor-text coarse:min-h-[44px] coarse:py-1">
      <form onSubmit={handleSubmit} className="flex items-start mt-2">
        <div className="flex items-center text-green-500 mr-2">
          {isChatMode ? (
            <span className="text-blue-400 font-bold flex items-center">
              <span className="animate-pulse mr-1">•</span>
              <span>You:</span>
            </span>
          ) : (
            <>
              <span className="mr-1">$</span>
              <ArrowRight size={14} />
            </>
          )}
        </div>
        <div className="flex-1 relative min-w-0">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            // Commands are one line; a pasted newline would break the match.
            onChange={(e) => {
              cancelTyping()
              setInput(isChatMode ? e.target.value : e.target.value.replace(/\n/g, " "))
            }}
            onKeyDown={handleKeyDown}
            // Arabic lines up right-to-left, with the caret where the phone puts it.
            dir="auto"
            enterKeyHint={isChatMode ? "send" : "go"}
            // Commands aren't prose: stop phones turning "help" into "Help".
            autoCapitalize={isChatMode ? "sentences" : "off"}
            autoCorrect={isChatMode ? "on" : "off"}
            spellCheck={isChatMode}
            className={`block w-full resize-none overflow-y-auto max-h-[7.5rem] bg-transparent border-none outline-none font-mono ${caretClass} ${showBlock ? "pl-3" : ""} ${isChatMode ? "text-blue-300" : "text-green-500 placeholder:text-gray-500"} ${isBotResponding ? "opacity-50 cursor-not-allowed" : ""}`}
            autoFocus
            aria-label="Terminal input"
            placeholder={isChatMode ? (isBotResponding ? "Gallillio Assistant is thinking..." : "Type your message...") : "Type a command..."}
            readOnly={isBotResponding}
          />
          {showBlock && (
            // !-prefixed because .terminal-cursor in globals.css sits after the
            // utilities and would otherwise win.
            <span
              aria-hidden="true"
              className={`terminal-cursor absolute left-0 top-1 !ml-0 pointer-events-none ${isChatMode ? "!bg-blue-300" : ""}`}
            />
          )}
          {suggestion && !isChatMode && (
            <div className="absolute left-0 top-0 flex items-center pointer-events-none">
              <span className="text-green-500/30 font-mono">
                {input}
                {suggestion}
              </span>
              <span className={`ml-2 text-green-500/60 transition-all duration-700 coarse:hidden ${
                animateArrow ? 'translate-x-3 text-green-400' : ''
              }`}>
                <ArrowRight size={16} className="animate-pulse" />
              </span>
            </div>
          )}
        </div>
        {completeButton}
        {/* Ctrl+C leaves chat on a keyboard; this stops just the answer, and is
            the only way to on a touch screen. */}
        {isChatMode && isBotResponding && onStop && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onStop()
            }}
            className="ml-2 inline-flex shrink-0 items-center gap-1.5 self-center rounded border border-gray-500 px-2.5 py-1 coarse:min-h-[40px] font-mono text-sm text-gray-200 hover:bg-gray-700 active:bg-gray-700"
          >
            <span aria-hidden="true" className="inline-block h-2.5 w-2.5 bg-current" />
            Stop
          </button>
        )}
      </form>
    </div>
  )
})

TerminalInput.displayName = 'TerminalInput'

export default TerminalInput

