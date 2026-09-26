"use client"

import React, { useState, useRef, useEffect, useLayoutEffect, useCallback, useImperativeHandle } from "react"
import { ArrowRight } from "lucide-react"
import { useAchievements } from "@/lib/achievements-context"
import { availableCommands } from "@/lib/commands"
import { hasTextSelection } from "@/lib/utils"

interface TerminalInputProps {
  onCommand: (command: string) => void
  isChatMode?: boolean
  isBotResponding?: boolean
}

export interface TerminalInputRef {
  setValue: (value: string) => void;
  focus: () => void;
}

const TerminalInput = React.forwardRef<TerminalInputRef, TerminalInputProps>(({ onCommand, isChatMode = false, isBotResponding = false }, ref) => {
  const [input, setInput] = useState("")
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [suggestion, setSuggestion] = useState("")
  const [isSwiping, setIsSwiping] = useState(false)
  const [touchStartX, setTouchStartX] = useState(0)
  const [animateArrow, setAnimateArrow] = useState(false)
  const [caret, setCaret] = useState({ index: 0, hasRange: false, scroll: 0 })
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionContainerRef = useRef<HTMLDivElement>(null)
  const { executeCommand: trackCommand, markCommandExecuted, visitTab, executeSecretCommand } = useAchievements()
  const [hasMarkedVisit, setHasMarkedVisit] = useState(false)

  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    // preventScroll matters: the input sits at the bottom of the output, so the
    // browser's default "scroll the focused element into view" turns any focus
    // into a jump to the bottom. Callers that genuinely want to move the view
    // there scroll explicitly.
    focus: () => inputRef.current?.focus({ preventScroll: true }),
    setValue: (value: string) => setInput(value)
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

  // Update suggestion when input changes
  useEffect(() => {
    if (!input.trim()) {
      setSuggestion("")
      return
    }

    const inputLower = input.toLowerCase()
    const matchingCommand = availableCommands.find(cmd => 
      cmd.toLowerCase().startsWith(inputLower) && cmd.toLowerCase() !== inputLower
    )

    if (matchingCommand) {
      setSuggestion(matchingCommand.slice(input.length))
    } else {
      setSuggestion("")
    }
  }, [input])

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    // Ignore submits while a response streams. We gate here rather than on the
    // input's `disabled` attribute, because a disabled input fires no keydown —
    // which silently swallowed the Ctrl+C cancel below for the whole response.
    if (isBotResponding) return

    const trimmedInput = input.trim()
    
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
    setSuggestion("")
    
    // Ensure the input is visible after command execution
    setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, 100)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle up/down arrows for command history
    if (e.key === "ArrowUp") {
      e.preventDefault()
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setInput(commandHistory[commandHistory.length - 1 - newIndex])
      }
    } else if (e.key === "ArrowDown") {
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
      setSuggestion("")
    } else if (e.ctrlKey && e.key === "c") {
      // Exit chatbot mode when Ctrl + C is pressed
      if (isChatMode) {
        onCommand("exit") // Call the onCommand function with "exit"
      }
    }
  }

  // We draw the cursor ourselves and keep the native caret transparent, rather
  // than swapping between the two on focus. Focus state can't be trusted here:
  // the SSR autofocus lands before hydration, so onFocus never fires, and iOS
  // keeps a programmatically focused input "focused" with no caret on screen.
  // Any rule keyed on focus ends up showing two cursors, or none.
  const syncCaret = useCallback(() => {
    const el = inputRef.current
    if (!el) return
    const start = el.selectionStart ?? el.value.length
    const end = el.selectionEnd ?? start
    const next = { index: start, hasRange: start !== end, scroll: el.scrollLeft }
    setCaret(prev =>
      prev.index === next.index && prev.hasRange === next.hasRange && prev.scroll === next.scroll ? prev : next
    )
  }, [])

  // Value changes made in code (history, Tab completion, setValue, clearing on
  // submit) move the caret without a selection event.
  useLayoutEffect(syncCaret, [input, syncCaret])

  // Caret moves (arrows, taps, selecting) arrive as selectionchange. Not
  // React's onSelect: it only fires once React has seen the input gain focus,
  // which the SSR autofocus never gives it.
  useEffect(() => {
    document.addEventListener("selectionchange", syncCaret)
    return () => document.removeEventListener("selectionchange", syncCaret)
  }, [syncCaret])

  const focusInput = () => {
    // Don't steal focus out from under a selection the user is making.
    if (hasTextSelection()) return
    inputRef.current?.focus({ preventScroll: true })
  }

  // Handle touch events for swipe gesture
  const handleTouchStart = (e: React.TouchEvent) => {
    if (suggestion) {
      setTouchStartX(e.touches[0].clientX)
      setIsSwiping(true)
      // Prevent default to stop screen movement
      e.preventDefault()
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping || !suggestion) return
    
    // Prevent default scrolling behavior when swiping on suggestion
    e.preventDefault()
    e.stopPropagation()
    
    const currentX = e.touches[0].clientX
    const diff = currentX - touchStartX
    
    // If swiped right more than 50px, complete the suggestion
    if (diff > 50) {
      setInput(prev => prev + suggestion)
      setSuggestion("")
      setIsSwiping(false)
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isSwiping) {
      // Prevent default behavior to stop screen movement
      e.preventDefault()
      e.stopPropagation()
    }
    setIsSwiping(false)
  }

  return (
    <div onClick={focusInput} className="cursor-text">
      <form onSubmit={handleSubmit} className="flex items-center mt-2">
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
        <div 
          className="flex-1 relative"
          ref={suggestionContainerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          style={{ touchAction: suggestion ? 'none' : 'auto' }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onScroll={syncCaret}
            // pr-2 is the block's width: the browser only scrolls long text far
            // enough for a 1px caret, which would clip the block at the edge.
            className={`w-full pr-2 bg-transparent border-none outline-none font-mono caret-transparent ${isChatMode ? "text-blue-300 placeholder-shown:pl-3" : "text-green-500"} ${isBotResponding ? "opacity-50 cursor-not-allowed" : ""}`}
            autoFocus
            aria-label="Terminal input"
            placeholder={isChatMode ? (isBotResponding ? "Gallillio Assistant is thinking... (Ctrl+C to stop)" : "Type your message...") : ""}
            readOnly={isBotResponding}
          />
          {!isBotResponding && !caret.hasRange && (
            // Invisible copy of the text up to the caret pushes the block to
            // where the next character goes; the translate follows the input's
            // own horizontal scroll once the text outgrows it. !-prefixed
            // because .terminal-cursor in globals.css sits after the utilities
            // and would otherwise win.
            <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
              <div
                className="flex h-full items-center font-mono whitespace-pre"
                style={{ transform: `translateX(-${caret.scroll}px)` }}
              >
                <span className="invisible">{input.slice(0, caret.index)}</span>
                {/* Remounting restarts the blink, so the block stays solid
                    while typing instead of vanishing mid-keystroke. */}
                <span
                  key={`${caret.index}:${input.length}`}
                  className={`terminal-cursor shrink-0 !ml-0 ${isChatMode ? "!bg-blue-300" : ""}`}
                />
              </div>
            </div>
          )}
          {suggestion && !isChatMode && (
            <div className="absolute left-0 top-0 flex items-center pointer-events-none">
              <span className="text-green-500/30 font-mono">
                {input}
                {suggestion}
              </span>
              <span className={`ml-2 text-green-500/60 transition-all duration-700 ${
                animateArrow ? 'translate-x-3 text-green-400' : ''
              }`}>
                <ArrowRight size={16} className="animate-pulse" />
              </span>
            </div>
          )}
        </div>
      </form>
    </div>
  )
})

TerminalInput.displayName = 'TerminalInput'

export default TerminalInput

