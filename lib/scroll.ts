/**
 * What scrolls a terminal tab. On larger screens each tab scrolls in its own
 * box inside the window; on a phone the page scrolls, so Safari can shrink its
 * toolbars and a tap on the status bar returns to the top, and the box just
 * grows with its content (its overflow is visible there). Code that reads or
 * sets a tab's scroll position goes through this rather than the box.
 */
export function tabScroller(box: HTMLElement | null | undefined) {
  if (!box) return null
  const page = getComputedStyle(box).overflowY === "visible"
  const el = page ? (document.scrollingElement as HTMLElement | null) ?? document.documentElement : box
  return {
    el,
    page,
    get top() {
      return el.scrollTop
    },
    set top(value: number) {
      el.scrollTop = value
    },
    /** True within `slack` px of the end, where new output is followed. */
    atBottom(slack = 80) {
      return el.scrollHeight - el.scrollTop - el.clientHeight <= slack
    },
    /**
     * The scroll position that brings `target` to the top of the view, less
     * its scroll-margin and, when the page scrolls, the pinned header (the
     * root's scroll-padding), as the browser's own jump to an anchor does.
     */
    topFor(target: HTMLElement) {
      const origin = page ? 0 : box.getBoundingClientRect().top
      const pinned = page ? parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0 : 0
      return target.getBoundingClientRect().top - origin + el.scrollTop - parseFloat(getComputedStyle(target).scrollMarginTop) - pinned
    },
    /** The furthest it can scroll down. */
    get bottom() {
      return el.scrollHeight - el.clientHeight
    },
  }
}

/**
 * The terminal transcript's command blocks, oldest first: one per command,
 * holding its output (components/terminal-output.tsx).
 */
export function transcriptBlocks(inside: Element | null | undefined): HTMLElement[] {
  const box = inside?.closest<HTMLElement>("[data-terminal-scroll]")
  return box ? Array.from(box.querySelectorAll<HTMLElement>("[data-block]")) : []
}
