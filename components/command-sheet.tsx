"use client"

import React, { useEffect, useId, useMemo, useRef, useState } from "react"
import { Search, X } from "lucide-react"
import { availableCommands } from "@/lib/commands"
import { commandRegistry } from "@/lib/command-registry"
import { useCloseOnBack } from "@/lib/use-close-on-back"

interface CommandSheetProps {
  open: boolean
  onClose: () => void
  activeTab: string
  isChatMode: boolean
  /** Opens a tab. */
  onTab: (tab: string) => void
  /** Runs a command in the terminal. */
  onRun: (command: string) => void
}

type Item = { name: string; description: string; kind: "tab" | "run" }

const TABS: Item[] = [
  { name: "terminal", description: "The command line", kind: "tab" },
  { name: "projects", description: "My work, with screenshots and write-ups", kind: "tab" },
  { name: "about", description: "Background, skills, experience, timeline", kind: "tab" },
  { name: "contact", description: "Send me a message, or get my CV", kind: "tab" },
  { name: "my-achievements", description: "Publications, awards, certifications", kind: "tab" },
  { name: "your-achievements", description: "What you've unlocked so far", kind: "tab" },
]

// Every public command, plus cv: it is left out of help, but a visitor
// looking for the CV shouldn't have to know to type it.
const COMMANDS: Item[] = [...availableCommands, "cv"]
  .filter((name, index, all) => all.indexOf(name) === index)
  .sort()
  .map((name) => ({ name, description: commandRegistry.getCommand(name)?.description ?? "", kind: "run" as const }))

/**
 * Everything the terminal can do, one tap each: on a phone it replaces the
 * menu and lists the commands typed into the prompt elsewhere, so nothing
 * needs remembering or typing ("recognition over recall").
 *
 * A native <dialog> opened with showModal(): the page behind is inert, focus
 * moves in and comes back, and Escape closes it. Back, a tap on the dimmed
 * page, a swipe down on the handle and the X close it too.
 */
export default function CommandSheet({ open, onClose, activeTab, isChatMode, onTab, onRun }: CommandSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [filter, setFilter] = useState("")
  const titleId = useId()
  // The chosen item, run once the sheet's history entry is gone (see below).
  const pendingRef = useRef<(() => void) | null>(null)
  const dragStart = useRef<number | null>(null)

  useCloseOnBack(open, onClose, "command-sheet")

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      setFilter("")
      dialog.showModal()
      dialog.querySelector<HTMLElement>("[data-sheet-close]")?.focus()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  // iOS still scrolls the page behind a modal dialog; pin it in place while
  // the sheet is up and put it back where it was.
  useEffect(() => {
    if (!open) return
    const y = window.scrollY
    const body = document.body.style
    const saved = { position: body.position, top: body.top, width: body.width }
    body.position = "fixed"
    body.top = `-${y}px`
    body.width = "100%"
    return () => {
      body.position = saved.position
      body.top = saved.top
      body.width = saved.width
      window.scrollTo(0, y)
    }
  }, [open])

  // Closing takes the sheet's history entry back off, and that Back lands a
  // moment later. A tab change made before it would be undone by it, so the
  // chosen item waits for it.
  useEffect(() => {
    if (open || !pendingRef.current) return
    const act = pendingRef.current
    pendingRef.current = null
    if (!window.history.state?.__overlay) {
      act()
      return
    }
    let done = false
    const run = () => {
      if (done) return
      done = true
      window.removeEventListener("popstate", run)
      act()
    }
    window.addEventListener("popstate", run)
    const fallback = setTimeout(run, 400)
    return () => {
      clearTimeout(fallback)
      window.removeEventListener("popstate", run)
    }
  }, [open])

  const choose = (item: Item) => {
    pendingRef.current = () => (item.kind === "tab" ? onTab(item.name) : onRun(item.name))
    onClose()
  }

  const query = filter.trim().toLowerCase()
  const groups = useMemo(() => {
    const matches = (item: Item) =>
      !query || item.name.includes(query) || item.description.toLowerCase().includes(query)
    return [
      { title: "Go to", items: TABS.filter(matches) },
      { title: "Run in the terminal", items: COMMANDS.filter(matches) },
    ].filter((group) => group.items.length > 0)
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
        // A tap on the dimmed page outside the sheet lands on the dialog itself.
        if (e.target === e.currentTarget) onClose()
      }}
      className="command-sheet m-0 mt-auto max-h-[85dvh] w-full max-w-none overflow-hidden rounded-t-xl border border-b-0 border-green-500 bg-gray-950 p-0 text-green-400 shadow-2xl backdrop:bg-black/70 md:mx-auto md:mb-6 md:max-w-xl md:rounded-xl md:border-b"
    >
      <div className="flex max-h-[85dvh] flex-col font-mono">
        {/* The handle: a swipe down on it closes the sheet. */}
        <div
          className="shrink-0 touch-none border-b border-green-500/40 px-4 pb-3 pt-2"
          onPointerDown={(e) => {
            dragStart.current = e.clientY
          }}
          onPointerUp={(e) => {
            if (dragStart.current !== null && e.clientY - dragStart.current > 60) onClose()
            dragStart.current = null
          }}
        >
          <div aria-hidden="true" className="mx-auto mb-2 h-1 w-10 rounded-full bg-green-500/40" />
          <div className="flex items-center justify-between gap-3">
            <h2 id={titleId} className="text-sm text-green-500">
              <span className="text-green-600">~ $</span> ls /commands
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
          {groups.length === 0 && <p className="px-2 py-6 text-sm text-gray-400">No command matches “{filter}”.</p>}
          {groups.map((group) => (
            <section key={group.title} aria-label={group.title} className="mt-2">
              <h3 className="px-2 py-1 text-xs uppercase tracking-wider text-gray-500">{group.title}</h3>
              <ul>
                {group.items.map((item) => {
                  const current = item.kind === "tab" && item.name === activeTab && !(item.name === "terminal" && isChatMode)
                  return (
                    <li key={`${item.kind}-${item.name}`}>
                      <button
                        type="button"
                        onClick={() => choose(item)}
                        aria-current={current ? "page" : undefined}
                        className={`flex min-h-[48px] w-full items-baseline gap-3 rounded-md px-2 py-2 text-left active:bg-green-500/15 ${current ? "bg-green-500/10" : ""}`}
                      >
                        <span className="shrink-0 text-green-300">
                          <span aria-hidden="true" className="text-green-600">{item.kind === "tab" ? "cd /" : "$ "}</span>
                          {item.name}
                        </span>
                        <span className="min-w-0 text-xs leading-snug text-gray-400">{item.description}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </dialog>
  )
}
