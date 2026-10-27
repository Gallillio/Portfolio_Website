import type { MouseEvent } from "react"

// The terminal tabs that have a page of their own. The address decides which tab
// is open, so a shared link, a refresh or the Back button lands on the same view
// (components/terminal.tsx). Crawlers reach each one through a real link.
const TAB_PATHS: Record<string, string> = {
  projects: "/projects",
  about: "/about",
  "my-achievements": "/achievements",
}

/** The tab an address opens, or null for an address no tab owns (such as /). */
export function tabForPath(pathname: string): string | null {
  if (pathname === "/projects" || pathname.startsWith("/projects/")) return "projects"
  return Object.keys(TAB_PATHS).find((tab) => TAB_PATHS[tab] === pathname) ?? null
}

/** The address of a tab; tabs without a page of their own live at /. */
export const pathForTab = (tab: string): string => TAB_PATHS[tab] ?? "/"

/** The slug in /projects/<slug>, or null. */
export function projectSlugForPath(pathname: string): string | null {
  const match = pathname.match(/^\/projects\/([^/]+)\/?$/)
  return match ? decodeURIComponent(match[1]) : null
}

export const projectPath = (slug: string): string => `/projects/${slug}`

/**
 * A cmd, ctrl or shift click: the visitor asked for a new tab or window, so the
 * link should do what links do instead of switching the view in place. Middle
 * clicks never reach onClick, so they open a new tab on their own.
 */
export const opensNewTab = (event: MouseEvent): boolean => event.metaKey || event.ctrlKey || event.shiftKey

/**
 * Follows a link to another view of the terminal without loading a page: the
 * address changes, and the terminal and its tabs follow it. A cmd, ctrl or shift
 * click is left to open the link in a new tab.
 */
export function followInPlace(event: MouseEvent<HTMLAnchorElement>): void {
  if (opensNewTab(event)) return
  event.preventDefault()
  window.history.pushState(null, "", event.currentTarget.href)
}

/**
 * Back to the project cards from a project's write-up. When the visitor came
 * from the cards, step back through history to them, which also restores their
 * scroll position; when the visit started on a project, open the cards as a new
 * entry. Used by the write-up's "Projects" link and by re-clicking the open
 * Projects tab.
 */
export function returnToProjectList(): void {
  const depth = window.history.state?.projectDepth ?? 0
  if (depth > 0) window.history.go(-depth)
  else window.history.pushState(null, "", pathForTab("projects"))
}
