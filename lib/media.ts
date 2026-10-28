"use client"

import { useSyncExternalStore } from "react"

/** A finger is the main pointer: phones, and iPads without a trackpad. */
export const COARSE_POINTER = "(pointer: coarse)"
export const REDUCED_MOTION = "(prefers-reduced-motion: reduce)"
/** The phone layout. The same 768px break as Tailwind's md. */
export const PHONE_WIDTH = "(max-width: 767px)"

export function matchesMedia(query: string): boolean {
  return typeof window !== "undefined" && window.matchMedia(query).matches
}

export const isCoarsePointer = () => matchesMedia(COARSE_POINTER)
export const prefersReducedMotion = () => matchesMedia(REDUCED_MOTION)

/**
 * Whether a media query matches, kept current as it changes. False during
 * server rendering and hydration, so anything that changes the layout should
 * use a CSS media query (or the coarse: variant) instead, and keep this for
 * behaviour.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query)
      list.addEventListener("change", onChange)
      return () => list.removeEventListener("change", onChange)
    },
    () => window.matchMedia(query).matches,
    () => false
  )
}
