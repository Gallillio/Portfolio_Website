"use client"

import { useCallback, useEffect, useRef } from "react"

const KEY = "__overlay"

/**
 * While an overlay is open (the image viewer, the phone's menus), the Back
 * button, Android's back gesture and iOS's edge swipe close it instead of
 * leaving the page under it.
 *
 * Opening adds a history entry for the same address; Back pops it and closes
 * the overlay. Closing any other way (the X, Escape, a tap outside) takes the
 * entry back off with history.back(), so the next Back isn't spent on nothing.
 *
 * The current state is spread into the new entry: Next.js keeps its router
 * state there and reloads the whole page on Back to an entry without it.
 */
export function useCloseOnBack(isOpen: boolean, onClose: () => void, id: string) {
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!isOpen) return
    let pushed = false
    let closedByBack = false
    let restoration: ScrollRestoration = "auto"
    // A tick after the Back has landed: WebKit restores the scroll position
    // just after popstate, so switching back during it still moves the page.
    const restoreScrolling = () => {
      setTimeout(() => {
        window.history.scrollRestoration = restoration
      }, 0)
    }
    const onPopState = () => {
      if (window.history.state?.[KEY] === id) return
      closedByBack = true
      restoreScrolling()
      onCloseRef.current()
    }
    // A tick later, so React's development double run of effects (mount,
    // unmount, mount) cancels the first push instead of stacking two entries.
    const timer = setTimeout(() => {
      // Coming back off this entry mustn't scroll the page. The browser noted
      // where the page was when the entry was added, which is while a menu
      // held it still at the top (lib/use-lock-page-scroll.ts), and the menu
      // puts it back where it was itself.
      restoration = window.history.scrollRestoration
      window.history.scrollRestoration = "manual"
      window.history.pushState({ ...window.history.state, [KEY]: id }, "")
      pushed = true
      window.addEventListener("popstate", onPopState)
    }, 0)
    return () => {
      clearTimeout(timer)
      window.removeEventListener("popstate", onPopState)
      if (!pushed || closedByBack) return
      if (window.history.state?.[KEY] === id) {
        window.addEventListener("popstate", restoreScrolling, { once: true })
        window.history.back()
      } else {
        restoreScrolling()
      }
    }
  }, [isOpen, id])
}

/**
 * For an item chosen in an overlay that closes as it's chosen: returns a
 * function that keeps the item's action until the overlay's history entry
 * is gone. Closing takes the entry back off, and that Back lands a moment
 * later; a tab change made before it would be undone by it.
 */
export function useAfterClose(isOpen: boolean) {
  const pendingRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (isOpen || !pendingRef.current) return
    const act = pendingRef.current
    pendingRef.current = null
    if (!window.history.state?.[KEY]) {
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
  }, [isOpen])

  return useCallback((act: () => void) => {
    pendingRef.current = act
  }, [])
}
