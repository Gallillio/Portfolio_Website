import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * True when the user currently has text selected (a real range, not a collapsed
 * caret).
 *
 * Focusing an input collapses the document selection, so anything that claims
 * focus implicitly — clicking the terminal body, for instance — has to check
 * this first or it destroys a selection the user is in the middle of making.
 *
 * Tests isCollapsed rather than just a non-empty string: an ordinary click
 * leaves a collapsed range behind, and treating that as "selecting" would stop
 * the input ever taking focus.
 */
export function hasTextSelection(): boolean {
  if (typeof window === "undefined") return false
  const selection = window.getSelection()
  return !!selection && !selection.isCollapsed && selection.toString().trim().length > 0
}
