"use client"

import { useEffect } from "react"

/**
 * Holds the page still behind an open menu (components/command-sheet.tsx,
 * components/page-menu.tsx). iOS still scrolls the page behind a modal dialog,
 * so this pins it in place while the menu is up and puts it back where it was.
 */
export function useLockPageScroll(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return
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
  }, [isLocked])
}
