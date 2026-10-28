"use client"

import React, { forwardRef } from "react"
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
 * Four chips at most, sharing the width, so all of them show on a 320px phone.
 * The row used to scroll sideways, and whatever sat past the edge (chat, help,
 * contact) went unseen; a tab bar shows everything or moves it behind "more".
 * help is in "more" for that reason: the sheet lists what help prints.
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
        ]
    : [
        { label: "terminal", onSelect: () => onTab("terminal") },
        { label: "projects", current: activeTab === "projects", onSelect: () => onTab("projects") },
        { label: "about", current: activeTab === "about", onSelect: () => onTab("about") },
        { label: "contact", current: activeTab === "contact", onSelect: () => onTab("contact") },
      ]

  const chat = onTerminal && isChatMode
  const border = chat ? "border-gray-500" : "border-green-500/50"

  return (
    <nav
      ref={ref}
      aria-label={onTerminal ? "Quick commands" : "Sections"}
      className={`terminal-dock z-30 flex items-stretch gap-2 border-t ${border} ${chat ? "bg-gray-900" : "bg-black"} pl-2 pt-2 font-mono text-sm ${className}`}
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom, 0px))" }}
    >
      {/* The chips split the width evenly. The narrowest phones get smaller
          text and padding so "projects" and "terminal" still fit whole. */}
      <div className="flex min-w-0 flex-1 gap-1.5 max-[389px]:gap-1">
        {chips.map((chip) => (
          <button
            key={chip.label}
            type="button"
            aria-current={chip.current ? "page" : undefined}
            onClick={chip.onSelect}
            className={`flex min-h-[44px] min-w-0 flex-1 basis-0 items-center justify-center rounded-md border px-1 text-[13px] transition-colors md:text-sm max-[389px]:px-0.5 max-[389px]:text-xs max-[339px]:px-0 ${
              chip.current
                ? "border-green-400 bg-green-500/15 text-green-300"
                : chat
                  ? "border-gray-600 text-gray-200 active:bg-gray-700"
                  : "border-green-500/40 text-green-400 active:bg-green-500/15"
            }`}
          >
            <span className="truncate">{chip.label}</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onMore}
        aria-haspopup="dialog"
        aria-label="All commands"
        className={`mr-2 flex min-h-[44px] w-11 shrink-0 max-[339px]:w-10 items-center justify-center rounded-md border ${
          chat ? "border-gray-600 text-gray-200 active:bg-gray-700" : "border-green-500/40 text-green-400 active:bg-green-500/15"
        }`}
      >
        <MoreHorizontal size={20} aria-hidden="true" />
      </button>
    </nav>
  )
})

export default TerminalDock
