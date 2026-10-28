"use client"

import React, { useEffect, useId, type ReactNode } from "react"
import { X } from "lucide-react"
import { useCloseOnBack } from "@/lib/use-close-on-back"
import { useLockPageScroll } from "@/lib/use-lock-page-scroll"
import { useSheetMotion } from "@/lib/use-sheet-motion"

interface FilterSheetProps {
  open: boolean
  onClose: () => void
  title: string
  /** Above the options, in the part that drags: a search box, say. */
  toolbar?: ReactNode
  /** The options. */
  children: ReactNode
}

/**
 * A phone's filter options (Projects' technologies, About's timeline), in a
 * sheet from the bottom like the command sheet (components/command-sheet.tsx).
 *
 * These used to be centered popups whose only sure way out was a 20px X: a
 * tap outside listened for mousedown, which iOS doesn't always send, and
 * Back left the page. Now Back, Escape, a tap on the dimmed page, a drag down
 * on the header, the X and Done all close it, and the page behind holds still.
 * Filters apply as they're tapped, so closing never loses a choice.
 */
export default function FilterSheet({ open, onClose, title, toolbar, children }: FilterSheetProps) {
  const titleId = useId()
  const { dialogRef, panelRef, scrimRef, dragHandlers } = useSheetMotion(open, onClose, "bottom")
  useCloseOnBack(open, onClose, "filter-sheet")
  useLockPageScroll(open)

  useEffect(() => {
    if (!open) return
    dialogRef.current?.querySelector<HTMLElement>("[data-sheet-close]")?.focus({ preventScroll: true })
  }, [open, dialogRef])

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
        <div {...dragHandlers} className="sheet-grip shrink-0 touch-none border-b border-green-500/40 px-4 pb-3 pt-2">
          <div aria-hidden="true" className="mx-auto mb-2 h-1 w-10 rounded-full bg-green-500/40" />
          <div className="flex items-center justify-between gap-3">
            <h2 id={titleId} className="font-bold text-green-400">
              {title}
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
          {toolbar}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">{children}</div>

        <div className="shrink-0 border-t border-green-500/40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-[44px] w-full items-center justify-center rounded-md bg-green-500/20 text-green-400 active:bg-green-500/30"
          >
            Done
          </button>
        </div>
      </div>
    </dialog>
  )
}
