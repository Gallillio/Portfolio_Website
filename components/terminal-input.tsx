"use client"

import React, { useState, useRef, useEffect, useImperativeHandle } from "react"
import { ArrowRight } from "lucide-react"
import { useAchievements } from "@/lib/achievements-context"
import { availableCommands } from "@/lib/commands"

interface TerminalInputProps {
  onCommand: (command: string) => void
}

export interface TerminalInputRef {
  setValue: (value: string) => void;
  focus: () => void;
}

const TerminalInput = React.forwardRef<TerminalInputRef, TerminalInputProps>(({ onCommand }, ref) => {
  const [input, setInput] = useState("")
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [suggestion, setSuggestion] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const { executeCommand, visitTab } = useAchievements()
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    onCommand(input)

    // Track command execution for achievement
    executeCommand(input)

    // Add to command history
    setCommandHistory((prev) => [...prev, input])
    setHistoryIndex(-1)
    setInput("")
    setSuggestion("")
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
    }
  }

  const focusInput = () => {
    inputRef.current?.focus()
  }

  return (
    <div onClick={focusInput} className="cursor-text">
      <form onSubmit={handleSubmit} className="flex items-center mt-2">
        <div className="flex items-center text-green-500 mr-2">
          <span className="mr-1">$</span>
          <ArrowRight size={14} />
        </div>
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent border-none outline-none text-green-500 font-mono"
            autoFocus
            aria-label="Terminal input"
          />
          {suggestion && (
            <span className="absolute left-0 top-0 text-green-500/30 font-mono pointer-events-none">
              {input}
              {suggestion}
            </span>
          )}
        </div>
      </form>
    </div>
  )
})

TerminalInput.displayName = 'TerminalInput'

export default TerminalInput

