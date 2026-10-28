"use client"

import { useEffect, type RefObject } from "react"

/**
 * Keeps a CSS variable on the root equal to an element's height, so things
 * placed around a pinned bar (toasts, the scroll-to-top button, the "new
 * reply" button) clear it at every size: --terminal-header-h above, the dock
 * and prompt below. 0 while the element is hidden or gone. Pass `key` when the
 * element mounts and unmounts with something (a tab), so it's picked up again.
 */
export function usePublishHeight(ref: RefObject<HTMLElement | null>, variable: string, key?: unknown) {
  useEffect(() => {
    const el = ref.current
    const root = document.documentElement
    if (!el) return
    const publish = () => root.style.setProperty(variable, `${el.offsetHeight}px`)
    publish()
    const observer = new ResizeObserver(publish)
    observer.observe(el)
    return () => {
      observer.disconnect()
      root.style.setProperty(variable, "0px")
    }
  }, [ref, variable, key])
}
