"use client"

import React, { useEffect, useId, useMemo, useState } from "react"
import { Search, X } from "lucide-react"
import { availableCommands } from "@/lib/commands"
import { commandRegistry } from "@/lib/command-registry"
import { useAfterClose, useCloseOnBack } from "@/lib/use-close-on-back"
import { useLockPageScroll } from "@/lib/use-lock-page-scroll"
import { useSheetMotion } from "@/lib/use-sheet-motion"
import { PAGES } from "./page-menu"

interface CommandSheetProps {
  open: boolean
  onClose: () => void
  /** Runs a command in the terminal. */
  onRun: (command: string) => void
  /** Opens the list of pages (components/page-menu.tsx). */
  onPages: () => void
}

type Command = { name: string; description: string }

// These print a line and then open their tab, which is the page menu's job.
// They still work when typed, and help still lists them.
const OPENS_A_PAGE = ["contact", "my-achievements"]
// The rest that share a page's name print a summary here instead. Saying so
// keeps them from reading as a second way to the same page.
const PRINTS_HERE: Record<string, string> = {
  about: "Short bio, printed here",
  projects: "Top 3 projects, printed here",
  "your-achievements": "What you've unlocked, printed here",
}

// Every public command, plus cv: it is left out of help, but a visitor
// looking for the CV shouldn't have to know to type it.
const COMMANDS: Command[] = [...availableCommands, "cv"]
  .filter((name, index, all) => all.indexOf(name) === index && !OPENS_A_PAGE.includes(name))
  .sort()
  .map((name) => ({ name, description: PRINTS_HERE[name] ?? commandRegistry.getCommand(name)?.description ?? "" }))

/**
 * The terminal's commands, one tap each: on a phone it lists what is typed
 * into the prompt elsewhere, so nothing needs remembering or typing
 * ("recognition over recall"). The pages have their own menu, from the
 * section bar's ☰ (components/page-menu.tsx).
 *
 * A native <dialog> opened with showModal(): the page behind is inert, focus
 * moves in and comes back, and Escape closes it. Back, a tap on the dimmed
 * page, a drag down on the handle and the X close it too. It slides in and
 * out (lib/use-sheet-motion.ts).
 */
export default function CommandSheet({ open, onClose, onRun, onPages }: CommandSheetProps) {
  const [filter, setFilter] = useState("")
  const titleId = useId()
  const { dialogRef, panelRef, scrimRef, dragHandlers } = useSheetMotion(open, onClose, "bottom")
  const afterClose = useAfterClose(open)
  useCloseOnBack(open, onClose, "command-sheet")
  useLockPageScroll(open)

  useEffect(() => {
    if (!open) return
    setFilter("")
    dialogRef.current?.querySelector<HTMLElement>("[data-sheet-close]")?.focus({ preventScroll: true })
  }, [open, dialogRef])

  const choose = (act: () => void) => {
    afterClose(act)
    onClose()
  }

  const query = filter.trim().toLowerCase()
  const { commands, pageMatches } = useMemo(() => {
    const matches = (item: Command) =>
      !query || item.name.includes(query) || item.description.toLowerCase().includes(query)
    return { commands: COMMANDS.filter(matches), pageMatches: PAGES.filter(matches).length }
  }, [query])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(e) => {
        // Escape, or Android's back gesture: close through state like the rest.
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        // A tap on the dimmed page outside the sheet.
        if (!panelRef.current?.contains(e.target as Node)) onClose()
      }}
      className="sheet sheet-bottom fixed inset-0 m-0 h-full max-h-none w-full max-w-none overflow-clip border-0 bg-transparent p-0 backdrop:bg-transparent"
    >
      <div ref={scrimRef} aria-hidden="true" className="sheet-scrim absolute inset-0 bg-black/70" />
      <div
        ref={panelRef}
        className="sheet-panel absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col rounded-t-xl border border-b-0 border-green-500 bg-gray-950 font-mono text-green-400 shadow-2xl md:bottom-6 md:mx-auto md:max-w-xl md:rounded-xl md:border-b"
      >
        <div className="shrink-0 border-b border-green-500/40 px-4 pb-3 pt-2">
          {/* The handle and the title: a drag down on them closes the sheet. */}
          <div {...dragHandlers} className="touch-none">
            <div aria-hidden="true" className="mx-auto mb-2 h-1 w-10 rounded-full bg-green-500/40" />
            <div className="flex items-center justify-between gap-3">
              <h2 id={titleId} className="text-sm text-green-500">
                <span className="text-green-600">$</span> run a command
              </h2>
              <button
                type="button"
                data-sheet-close
                onClick={onClose}
                aria-label="Close"
                className="-mr-2 flex h-11 w-11 items-center justify-center rounded-md text-green-400 active:bg-green-500/15"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
          </div>
          <label className="mt-2 flex min-h-[44px] items-center gap-2 rounded-md border border-green-500/40 px-3 focus-within:border-green-400">
            <Search size={16} aria-hidden="true" className="shrink-0 text-green-600" />
            <span className="sr-only">Filter commands</span>
            {/* 16px, or iOS zooms in on focus. Not focused on open: that would
                bring the keyboard up over the list. */}
            <input
              type="search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="filter"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="done"
              className="min-w-0 flex-1 bg-transparent text-base text-green-300 placeholder:text-gray-500 focus:outline-none"
            />
          </label>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-[max(1rem,env(safe-area-inset-bottom))] pt-1">
          {commands.length === 0 && <p className="px-2 py-6 text-sm text-gray-400">No command matches “{filter}”.</p>}
          {commands.length > 0 && (
            <ul aria-label="Commands" className="mt-1">
              {commands.map((command) => (
                <li key={command.name}>
                  <button
                    type="button"
                    onClick={() => choose(() => onRun(command.name))}
                    className="flex min-h-[48px] w-full items-baseline gap-3 rounded-md px-2 py-2 text-left active:bg-green-500/15"
                  >
                    <span className="shrink-0 text-green-300">
                      <span aria-hidden="true" className="text-green-600">$ </span>
                      {command.name}
                    </span>
                    <span className="min-w-0 text-xs leading-snug text-gray-400">{command.description}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {/* For anyone who came here for a page. Not on an iPad, whose tabs
              stay in view along the top. */}
          {(!query || pageMatches > 0) && (
            <button
              type="button"
              onClick={() => choose(onPages)}
              className="mt-2 flex min-h-[48px] w-full items-center justify-between gap-3 rounded-md border border-dashed border-green-500/40 px-3 text-left text-sm text-gray-400 active:bg-green-500/15 md:hidden"
            >
              <span>
                {query
                  ? `${pageMatches === 1 ? "A page matches" : `${pageMatches} pages match`}. Open the page list`
                  : "Looking for a page? Open the page list"}
              </span>
              <span aria-hidden="true" className="text-green-500">
                ↑
              </span>
            </button>
          )}
        </div>
      </div>
    </dialog>
  )
}
