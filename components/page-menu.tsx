"use client"

import React, { useId, useLayoutEffect, type RefObject } from "react"
import { X } from "lucide-react"
import { useAfterClose, useCloseOnBack } from "@/lib/use-close-on-back"
import { useLockPageScroll } from "@/lib/use-lock-page-scroll"
import { useSheetMotion } from "@/lib/use-sheet-motion"

interface PageMenuProps {
  open: boolean
  onClose: () => void
  activeTab: string
  isChatMode: boolean
  /** Opens a tab. */
  onTab: (tab: string) => void
  /** What the menu drops from: the pinned header, with the section bar at its foot. */
  anchorRef: RefObject<HTMLElement | null>
}

export const PAGES = [
  { name: "terminal", description: "The command line" },
  { name: "projects", description: "My work, with screenshots and write-ups" },
  { name: "about", description: "Background, skills, experience, timeline" },
  { name: "contact", description: "Send me a message, or get my CV" },
  { name: "my-achievements", description: "Publications, awards, certifications" },
  { name: "your-achievements", description: "What you've unlocked so far" },
]

/**
 * A phone's pages, listed like a directory, dropping down from under the
 * section bar whose ☰ opens it. The commands are in a menu of their own, the
 * dock's ⋯ (components/command-sheet.tsx): going somewhere and running
 * something are different things, so they don't share one.
 *
 * A native <dialog> opened with showModal(), like the command sheet, and
 * closed by Back, Escape, the X, a tap outside it (the header too, where the
 * ☰ was) and a drag up on its handle.
 */
export default function PageMenu({ open, onClose, activeTab, isChatMode, onTab, anchorRef }: PageMenuProps) {
  const titleId = useId()
  const { dialogRef, panelRef, scrimRef, dragHandlers } = useSheetMotion(open, onClose, "top")
  const afterClose = useAfterClose(open)
  useCloseOnBack(open, onClose, "page-menu")
  useLockPageScroll(open)

  // Drop from wherever the header ends. On a phone on its side the title bar
  // has scrolled away and only the section bar is left. A layout effect, so
  // it's in place before the menu opens.
  useLayoutEffect(() => {
    if (!open) return
    const bottom = anchorRef.current?.getBoundingClientRect().bottom ?? 0
    dialogRef.current?.style.setProperty("--menu-top", `${Math.max(0, Math.round(bottom))}px`)
  }, [open, anchorRef, dialogRef])

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
        if (!panelRef.current?.contains(e.target as Node)) onClose()
      }}
      className="sheet sheet-top fixed inset-0 m-0 h-full max-h-none w-full max-w-none overflow-clip border-0 bg-transparent p-0 backdrop:bg-transparent"
    >
      {/* Only below the header, which stays in sight. */}
      <div ref={scrimRef} aria-hidden="true" className="sheet-scrim absolute inset-x-0 bottom-0 top-[var(--menu-top,0px)] bg-black/70" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[var(--menu-top,0px)] overflow-clip">
        <div
          ref={panelRef}
          className="sheet-panel pointer-events-auto flex max-h-full flex-col rounded-b-xl border border-t-0 border-green-500 bg-gray-950 font-mono text-green-400 shadow-2xl"
        >
          <div className="flex shrink-0 items-center justify-between gap-3 pl-4 pr-2 pt-1">
            <h2 id={titleId} className="text-sm text-green-500">
              ~/portfolio
            </h2>
            <button
              type="button"
              data-sheet-close
              onClick={onClose}
              aria-label="Close"
              className="flex h-11 w-11 items-center justify-center rounded-md text-green-400 active:bg-green-500/15"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2">
            {PAGES.map((page, i) => {
              const current = page.name === activeTab && !(page.name === "terminal" && isChatMode)
              return (
                <li key={page.name}>
                  <button
                    type="button"
                    onClick={() => {
                      afterClose(() => onTab(page.name))
                      onClose()
                    }}
                    aria-current={current ? "page" : undefined}
                    className={`flex min-h-[48px] w-full gap-2 rounded-md px-2 py-1.5 text-left active:bg-green-500/15 ${current ? "bg-green-500/10" : ""}`}
                  >
                    <span aria-hidden="true" className="shrink-0 text-green-800">
                      {i === PAGES.length - 1 ? "└─" : "├─"}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-green-300">
                        {page.name}
                        <span aria-hidden="true" className="text-green-600">/</span>
                        {current && (
                          <span aria-hidden="true" className="ml-2 rounded bg-green-500 px-1 text-xs text-black">
                            here
                          </span>
                        )}
                      </span>
                      <span className="block text-xs leading-snug text-gray-400">{page.description}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>

          {/* The handle: a drag up on it closes the menu. */}
          <div {...dragHandlers} aria-hidden="true" className="shrink-0 touch-none px-4 pb-3 pt-2">
            <div className="mx-auto h-1 w-10 rounded-full bg-green-500/40" />
          </div>
        </div>
      </div>
    </dialog>
  )
}
