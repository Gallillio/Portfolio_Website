"use client"

import React, { useState, useRef, useEffect, useImperativeHandle } from "react"
import { ArrowRight } from "lucide-react"
import { useAchievements } from "@/lib/achievements-context"
import { availableCommands } from "@/lib/commands"

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
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionContainerRef = useRef<HTMLDivElement>(null)
  const { executeCommand: trackCommand, markCommandExecuted, visitTab, executeSecretCommand } = useAchievements()
  const [hasMarkedVisit, setHasMarkedVisit] = useState(false)

  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
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
    inputRef.current?.focus()
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

  const focusInput = () => {
    inputRef.current?.focus()
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
            className={`w-full bg-transparent border-none outline-none font-mono ${isChatMode ? "text-blue-300" : "text-green-500"} ${isBotResponding ? "opacity-50 cursor-not-allowed" : ""}`}
            autoFocus
            aria-label="Terminal input"
            placeholder={isChatMode ? (isBotResponding ? "Gallillio Assistant is thinking..." : "Type your message...") : ""}
            disabled={isBotResponding}
          />
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

