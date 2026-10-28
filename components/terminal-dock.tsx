"use client"

import React, { forwardRef, useEffect, useRef, useState } from "react"
import { MoreHorizontal } from "lucide-react"

interface TerminalDockProps {
  activeTab: string
  isChatMode: boolean
  /** Types a command into the prompt and runs it. */
  onRun: (command: string) => void
  /** Opens a tab. */
  onTab: (tab: string) => void
  /** Opens the list of commands (components/command-sheet.tsx). */
  onMore: () => void
  /** Focuses the prompt, which opens the keyboard: for asking a question. */
  onType: () => void
}

type Chip = { label: string; current?: boolean; onSelect: () => void }

/**
 * The bar along the bottom of a phone, where a thumb reaches: the sections a
 * visitor wants most, one tap each, and "more" for everything else. On the
 * terminal tab it sits under the prompt and its chips run commands there, so
 * the terminal still answers; elsewhere it moves between tabs.
 *
 * Hidden while the on-screen keyboard is up (the root's data-kb-open, set in
 * components/terminal.tsx), which leaves the room to the conversation.
 */
const TerminalDock = forwardRef<HTMLElement, TerminalDockProps & { className?: string }>(function TerminalDock(
  { activeTab, isChatMode, onRun, onTab, onMore, onType, className = "" },
  ref
) {
  const onTerminal = activeTab === "terminal"

  const chips: Chip[] = onTerminal
    ? isChatMode
      ? [
          { label: "type a question", onSelect: onType },
          { label: "exit chat", onSelect: () => onRun("exit") },
        ]
      : [
          { label: "projects", onSelect: () => onRun("projects") },
          { label: "about", onSelect: () => onRun("about") },
          { label: "contact", onSelect: () => onRun("contact") },
          { label: "chat", onSelect: () => onRun("chat") },
          { label: "help", onSelect: () => onRun("help") },
        ]
    : [
        { label: "terminal", onSelect: () => onTab("terminal") },
        { label: "projects", current: activeTab === "projects", onSelect: () => onTab("projects") },
        { label: "about", current: activeTab === "about", onSelect: () => onTab("about") },
        { label: "contact", current: activeTab === "contact", onSelect: () => onTab("contact") },
      ]

  const chat = onTerminal && isChatMode
  const border = chat ? "border-gray-500" : "border-green-500/50"

  // Which side has chips scrolled out of sight, for the fade in globals.css.
  const chipsRef = useRef<HTMLDivElement>(null)
  const [more, setMore] = useState<"start" | "end" | "both" | undefined>()
  useEffect(() => {
    const row = chipsRef.current
    if (!row) return
    const measure = () => {
      const start = row.scrollLeft > 2
      const end = row.scrollLeft + row.clientWidth < row.scrollWidth - 2
      setMore(start && end ? "both" : start ? "start" : end ? "end" : undefined)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(row)
    row.addEventListener("scroll", measure, { passive: true })
    return () => {
      observer.disconnect()
      row.removeEventListener("scroll", measure)
    }
  }, [chips.length, activeTab, isChatMode])

  return (
    <nav
      ref={ref}
      aria-label={onTerminal ? "Quick commands" : "Sections"}
      className={`terminal-dock z-30 flex items-stretch gap-2 border-t ${border} ${chat ? "bg-gray-900" : "bg-black"} pl-2 pt-2 font-mono text-sm ${className}`}
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom, 0px))" }}
    >
      {/* Scrolls sideways when the chips outgrow a small phone, with the edges
          faded so the cut-off reads as "more this way". */}
      <div ref={chipsRef} data-more={more} className="dock-chips flex min-w-0 flex-1 gap-2 overflow-x-auto overscroll-x-contain">
        {chips.map((chip) => (
          <button
            key={chip.label}
            type="button"
            aria-current={chip.current ? "page" : undefined}
            onClick={chip.onSelect}
            className={`flex min-h-[44px] shrink-0 items-center rounded-md border px-3 transition-colors ${
              chip.current
                ? "border-green-400 bg-green-500/15 text-green-300"
                : chat
                  ? "border-gray-600 text-gray-200 active:bg-gray-700"
                  : "border-green-500/40 text-green-400 active:bg-green-500/15"
            }`}
          >
            {onTerminal && !chat && <span aria-hidden="true" className="mr-1 text-green-600">$</span>}
            {chip.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onMore}
        aria-haspopup="dialog"
        aria-label="All commands"
        className={`mr-2 flex min-h-[44px] w-11 shrink-0 items-center justify-center rounded-md border ${
          chat ? "border-gray-600 text-gray-200 active:bg-gray-700" : "border-green-500/40 text-green-400 active:bg-green-500/15"
        }`}
      >
        <MoreHorizontal size={20} aria-hidden="true" />
      </button>
    </nav>
  )
})

export default TerminalDock
