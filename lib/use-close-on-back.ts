"use client"

import { useEffect, useRef } from "react"

const KEY = "__overlay"

/**
 * While an overlay is open (the image viewer, the command sheet), the Back
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
    const onPopState = () => {
      if (window.history.state?.[KEY] === id) return
      closedByBack = true
      onCloseRef.current()
    }
    // A tick later, so React's development double run of effects (mount,
    // unmount, mount) cancels the first push instead of stacking two entries.
    const timer = setTimeout(() => {
      window.history.pushState({ ...window.history.state, [KEY]: id }, "")
      pushed = true
      window.addEventListener("popstate", onPopState)
    }, 0)
    return () => {
      clearTimeout(timer)
      window.removeEventListener("popstate", onPopState)
      if (pushed && !closedByBack && window.history.state?.[KEY] === id) window.history.back()
    }
  }, [isOpen, id])
}
