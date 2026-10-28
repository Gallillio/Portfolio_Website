"use client"

import { useEffect, useRef, type PointerEvent } from "react"
import { prefersReducedMotion } from "@/lib/media"

/** The screen edge a sheet slides in from and back out to. */
export type SheetEdge = "top" | "bottom"

// How far a press on the handle moves before it becomes a drag, so a tap
// stays a tap.
const SLOP = 6
// A release moving toward the edge faster than this (px/ms) closes the sheet,
const FLICK = 0.45
// and so does one past this share of the sheet's height.
const DISTANCE = 0.3
// The slide's length in app/globals.css (.sheet-panel), for the fallback.
const SLIDE_MS = 380

type Drag = {
  id: number
  startY: number
  /** Where the panel was when the drag began. */
  from: number
  /** Where it is now. */
  at: number
  moved: boolean
  /** The last 100ms of positions, for the speed at release. */
  samples: { y: number; t: number }[]
}

/**
 * The motion of a sheet (components/command-sheet.tsx, components/page-menu.tsx):
 * it slides in from its edge as it opens and back out before it closes, and
 * follows a finger on its handle, closing on a flick or a long enough drag
 * and springing back otherwise.
 *
 * The sheet is a native <dialog> that fills the screen and holds a dimmed
 * scrim and the panel. app/globals.css draws the states: [data-closed] is
 * off-screen, where it opens from and closes to, and [data-dragging] stops the
 * transitions while a finger holds it. The dialog closes only once the panel
 * has slid away, because Safari and Firefox take a closed dialog off the
 * screen at once, so a CSS exit transition would never show there.
 */
export function useSheetMotion(open: boolean, onClose: () => void, edge: SheetEdge) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const scrimRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<Drag | null>(null)
  const openRef = useRef(open)
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    openRef.current = open
    onCloseRef.current = onClose
  })

  // +1 when closing moves the panel down, -1 when it moves up.
  const toward = edge === "bottom" ? 1 : -1

  useEffect(() => {
    const dialog = dialogRef.current
    const panel = panelRef.current
    if (!dialog || !panel) return
    if (open) {
      if (!dialog.open) {
        dialog.dataset.closed = ""
        dialog.showModal()
        // Lay it out off-screen first, so there is somewhere to slide in from.
        void panel.offsetHeight
      }
      // This also turns around a slide out that hasn't finished.
      delete dialog.dataset.closed
      return
    }
    if (!dialog.open) return

    dialog.dataset.closed = ""
    // After a drag, slide on from where the finger let go. With reduced
    // motion it fades out where it is instead.
    delete dialog.dataset.dragging
    if (!prefersReducedMotion()) panel.style.transform = ""
    if (scrimRef.current) scrimRef.current.style.opacity = ""

    let done = false
    const finish = () => {
      if (done) return
      done = true
      dialog.close()
      panel.style.transform = ""
      panel.style.transitionDuration = ""
      if (scrimRef.current) scrimRef.current.style.transitionDuration = ""
    }
    const onEnd = (e: TransitionEvent) => {
      if (e.target === panel) finish()
    }
    panel.addEventListener("transitionend", onEnd)
    const fallback = setTimeout(finish, (parseFloat(panel.style.transitionDuration) || SLIDE_MS) + 150)
    return () => {
      panel.removeEventListener("transitionend", onEnd)
      clearTimeout(fallback)
    }
  }, [open])

  // A second Back or Escape with no tap in between closes a dialog without a
  // cancel event, so keep the state in step with it.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const onNativeClose = () => {
      if (openRef.current) onCloseRef.current()
    }
    dialog.addEventListener("close", onNativeClose)
    return () => dialog.removeEventListener("close", onNativeClose)
  }, [])

  const offset = () => {
    const transform = panelRef.current ? getComputedStyle(panelRef.current).transform : "none"
    return transform === "none" ? 0 : new DOMMatrixReadOnly(transform).m42
  }

  const release = (e: PointerEvent<HTMLElement>, cancelled: boolean) => {
    const drag = dragRef.current
    if (!drag || drag.id !== e.pointerId) return
    dragRef.current = null
    const dialog = dialogRef.current
    const panel = panelRef.current
    if (!drag.moved || !dialog || !panel) return

    const first = drag.samples[0]
    const last = drag.samples[drag.samples.length - 1]
    const elapsed = last.t - first.t
    // Speed toward the edge; negative when heading back.
    const speed = elapsed > 8 ? ((last.y - first.y) / elapsed) * toward : 0
    const gone = drag.at * toward
    const height = panel.offsetHeight
    if (!cancelled && (speed > FLICK || (gone > height * DISTANCE && speed > -0.2))) {
      // Keep the finger's speed for the rest of the way, within reason.
      if (speed > 0.3 && !prefersReducedMotion()) {
        const ms = `${Math.round(Math.min(320, Math.max(140, ((height - gone) / speed) * 1.6)))}ms`
        panel.style.transitionDuration = ms
        if (scrimRef.current) scrimRef.current.style.transitionDuration = ms
      }
      // The panel holds still where it was let go until closing takes it on.
      onCloseRef.current()
      return
    }
    delete dialog.dataset.dragging
    panel.style.transform = ""
    if (scrimRef.current) scrimRef.current.style.opacity = ""
  }

  /** For the sheet's handle, or the header around it: the part a finger drags. */
  const dragHandlers = {
    onPointerDown(e: PointerEvent<HTMLElement>) {
      // The X keeps its tap. The filter can start a drag too, so the sheet
      // isn't held by one thin strip; a tap on it still focuses it.
      if (e.button !== 0 || (e.target as HTMLElement).closest("button, a")) return
      // A second finger mustn't take over a drag, or the first one's release
      // would be ignored and leave the sheet where it was let go.
      if (dragRef.current?.moved) return
      dragRef.current = { id: e.pointerId, startY: e.clientY, from: 0, at: 0, moved: false, samples: [] }
    },
    onPointerMove(e: PointerEvent<HTMLElement>) {
      const drag = dragRef.current
      const dialog = dialogRef.current
      const panel = panelRef.current
      if (!drag || drag.id !== e.pointerId || !dialog || !panel) return
      if (!drag.moved) {
        if (Math.abs(e.clientY - drag.startY) < SLOP) return
        drag.moved = true
        // Only now, so a tap is left alone. A finger stays with what it
        // pressed by itself; a mouse has to be told.
        e.currentTarget.setPointerCapture(e.pointerId)
        // Pick it up where it is, even mid-slide. Read that before
        // [data-dragging] stops the slide and snaps it to the end.
        drag.from = offset()
        drag.startY = e.clientY
        dialog.dataset.dragging = ""
      }
      let y = drag.from + e.clientY - drag.startY
      // Pulled away from its edge it gives a little, then stops.
      if (y * toward < 0) y = -toward * 40 * (1 - Math.exp(-Math.abs(y) / 90))
      drag.at = y
      panel.style.transform = `translateY(${y}px)`
      if (scrimRef.current) scrimRef.current.style.opacity = String(Math.max(0, 1 - Math.abs(y) / panel.offsetHeight))
      drag.samples.push({ y, t: e.timeStamp })
      while (drag.samples.length > 2 && e.timeStamp - drag.samples[0].t > 100) drag.samples.shift()
    },
    onPointerUp(e: PointerEvent<HTMLElement>) {
      release(e, false)
    },
    // The browser took the touch over: put the sheet back.
    onPointerCancel(e: PointerEvent<HTMLElement>) {
      release(e, true)
    },
  }

  return { dialogRef, panelRef, scrimRef, dragHandlers }
}
