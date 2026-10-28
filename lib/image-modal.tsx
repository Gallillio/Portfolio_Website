"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import Image, { getImageProps } from "next/image"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { getImageMeta, isGif } from "@/lib/image-meta"
import { useCloseOnBack } from "@/lib/use-close-on-back"
import type { ProjectImage } from "@/lib/types"

/*
 * Full-size image viewer for the project screenshots and case-study diagrams.
 *
 * The frame opens at the image's final size straight away: lib/image-meta.json
 * holds every image's size and a 10px blurred copy, so the blur fills the frame
 * at once and the sharp image fades in over it. The sharp copies are fetched
 * ahead of time when a pointer rests on a thumbnail and, once a slide is shown,
 * for the slides around it.
 */

// The lightbox and the preloader must build the same URL, or a preload is wasted.
// Below 768px the sizes match the card slideshow's, so a phone opens the copy
// the card has already downloaded instead of fetching a second one.
function lightboxImageProps(src: string) {
  return { src, fill: true, sizes: "(max-width: 768px) 100vw, 92vw", unoptimized: isGif(src) } as const
}

// "loaded" means the browser holds the file, so a slide can skip the blur.
const preloadStatus = new Map<string, "loading" | "loaded">()

type ConnectionInfo = { saveData?: boolean; effectiveType?: string }

function onSlowOrMeteredConnection(): boolean {
  const connection = (navigator as Navigator & { connection?: ConnectionInfo }).connection
  return Boolean(connection?.saveData || connection?.effectiveType?.includes("2g"))
}

/**
 * Starts downloading an image's lightbox copy. Guesses (`speculative`: a hover,
 * the slides next to the open one) are skipped with Save-Data on or on 2G.
 */
export function preloadLightboxImage(src: string, { speculative = false } = {}) {
  if (typeof window === "undefined" || preloadStatus.has(src)) return
  if (speculative && onSlowOrMeteredConnection()) return
  const { props } = getImageProps({ ...lightboxImageProps(src), alt: "" })
  const img = new window.Image()
  if (speculative) img.setAttribute("fetchpriority", "low")
  img.onload = () => preloadStatus.set(src, "loaded")
  img.onerror = () => preloadStatus.delete(src)
  preloadStatus.set(src, "loading")
  // sizes before srcset, or Safari picks a candidate without it; src last starts
  // the request. GIFs are served as they are and come without either.
  if (props.sizes) img.sizes = props.sizes
  if (props.srcSet) img.srcset = props.srcSet
  img.src = props.src
}

// One mouse pointer can rest on one thumbnail at a time, so one timer will do.
let hoverTimer: ReturnType<typeof setTimeout> | undefined

/**
 * Pointer handlers for a thumbnail that opens the lightbox. instant.page waits
 * 65 ms on a link before guessing a click; these targets are much larger, so a
 * pointer passing over one waits a little longer. A press is a near-certain
 * click. Touch is left out: every swipe and scroll starts with a touch.
 */
export function lightboxIntentHandlers(src: string) {
  return {
    onPointerEnter: (event: React.PointerEvent) => {
      if (event.pointerType !== "mouse") return
      clearTimeout(hoverTimer)
      hoverTimer = setTimeout(() => preloadLightboxImage(src, { speculative: true }), 150)
    },
    onPointerLeave: () => clearTimeout(hoverTimer),
    onPointerDown: (event: React.PointerEvent) => {
      if (event.pointerType === "mouse") preloadLightboxImage(src)
    },
  }
}

interface ImageModalProps {
  images: ProjectImage[]
  /** The slide on show, or null while the lightbox is closed. */
  index: number | null
  onIndexChange: (index: number) => void
  onClose: () => void
}

const ImageModal: React.FC<ImageModalProps> = ({ images, index, onIndexChange, onClose }) => {
  const isOpen = index !== null && index < images.length
  const dialogRef = useRef<HTMLDivElement>(null)

  const step = useCallback(
    (by: number) => {
      if (index !== null) onIndexChange((index + by + images.length) % images.length)
    },
    [index, images.length, onIndexChange]
  )

  // Escape closes, arrows step through the slides, like the buttons.
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (images.length < 2) return
      if (e.key === "ArrowLeft") step(-1)
      if (e.key === "ArrowRight") step(1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isOpen, images.length, onClose, step])

  // Back closes the viewer rather than leaving the project under it.
  useCloseOnBack(isOpen, onClose, "image-viewer")

  // A finger swipes between slides and swipes down to close. Read from touch
  // events without preventing anything, so pinch-zoom still works; a gesture
  // that ever had two fingers on the glass is a pinch and is ignored.
  const swipe = useRef<{ x: number; y: number; pinch: boolean } | null>(null)
  const swipeHandlers = {
    onTouchStart: (e: React.TouchEvent) => {
      if (e.touches.length > 1) {
        if (swipe.current) swipe.current.pinch = true
        return
      }
      swipe.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, pinch: false }
    },
    onTouchMove: (e: React.TouchEvent) => {
      if (e.touches.length > 1 && swipe.current) swipe.current.pinch = true
    },
    onTouchEnd: (e: React.TouchEvent) => {
      const start = swipe.current
      if (!start || e.touches.length > 0) return
      swipe.current = null
      // Zoomed in, a drag pans the picture; it isn't a swipe.
      if (start.pinch || (window.visualViewport?.scale ?? 1) > 1.05) return
      const dx = e.changedTouches[0].clientX - start.x
      const dy = e.changedTouches[0].clientY - start.y
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) && images.length > 1) step(dx < 0 ? 1 : -1)
      else if (dy > 80 && dy > Math.abs(dx)) onClose()
    },
  }

  // Hold the page still and take focus while open; hand focus back on close.
  // Only opening and closing re-run this, so stepping slides leaves it alone.
  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    document.body.style.overflow = "hidden"
    dialogRef.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [isOpen])

  // Once a slide is sharp, fetch its neighbours: one back and two ahead, as
  // PhotoSwipe does. Waiting keeps them from slowing the slide being looked at.
  const preloadNeighbours = useCallback(() => {
    if (index === null || images.length < 2) return
    for (const offset of [-1, 1, 2]) {
      preloadLightboxImage(images[(index + offset + images.length) % images.length].src, { speculative: true })
    }
  }, [images, index])

  if (!isOpen) return null

  const image = images[index]
  // No recorded size (an image added without `npm run images:meta`): assume 16:9.
  const { width, height } = getImageMeta(image) ?? { width: 1600, height: 900 }
  const ratio = width / height
  // The image's exact shape, as large as the window allows but never past its
  // own pixel size. CSS recomputes it on resize and rotation, and animates it
  // when the next slide has a different shape.
  const frameSize = {
    width: `min(${width}px, var(--lb-max-w), calc(var(--lb-max-h) * ${ratio}))`,
    height: `min(${height}px, var(--lb-max-h), calc(var(--lb-max-w) / ${ratio}))`,
  }

  // Portal to <body>, so the lightbox covers the viewport instead of the transformed terminal window.
  return createPortal(
    // The frame limits leave room for the paddings (4rem across, the borders 2px)
    // and for the header (7rem down in all), so phones in landscape fit too.
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm [--lb-max-h:calc(100svh-7rem)] [--lb-max-w:calc(100vw-4rem-2px)] md:[--lb-max-w:calc(92vw-2rem-2px)]"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Image viewer"
        tabIndex={-1}
        className="relative rounded-md bg-gray-900/95 outline-none"
        onClick={(e) => e.stopPropagation()}
        {...swipeHandlers}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between bg-black/50 px-4 py-1 border-b border-green-500/50 rounded-t-md">
          <div className="flex space-x-2">
            {/* Close Button */}
            <button
              className="touch-hit w-3 h-3 rounded-full bg-red-500 border border-red-600 hover:bg-red-600 transition-colors"
              onClick={onClose}
              aria-label="Close"
            ></button>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80 border border-yellow-600"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80 border border-green-600"></div>
          </div>
          {/* Where you are in the set: dots alone are too small to read on a phone. */}
          {images.length > 1 && (
            <span className="font-mono text-xs text-green-400/80 tabular-nums" aria-live="polite">
              {index + 1} / {images.length}
            </span>
          )}
          {/* 44px to hit with a finger; the icon stays small. */}
          <button className="-mr-3 flex h-11 w-11 items-center justify-center text-green-500 hover:text-green-400 transition-colors" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Image Container */}
        <div className="relative p-4 border border-green-500/20 rounded-b-md">
          <div
            // Arbitrary properties for the timing: tailwindcss-animate also has duration
            // and ease utilities, and Tailwind skips an arbitrary value two plugins claim.
            className="relative overflow-hidden rounded-sm transition-[width,height] [transition-duration:333ms] [transition-timing-function:cubic-bezier(.4,0,.22,1)] motion-reduce:transition-none"
            style={frameSize}
          >
            <LightboxSlide key={image.src} image={image} onLoaded={preloadNeighbours} />
          </div>
          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => step(-1)}
                aria-label="Previous image"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-gray-800 text-white p-2 coarse:p-2.5 rounded-full hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => step(1)}
                aria-label="Next image"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-800 text-white p-2 coarse:p-2.5 rounded-full hover:bg-gray-700 transition-colors"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
          {/* Indicator Dots, for a mouse; a finger swipes, and the header counts. */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2 bg-gray-800 bg-opacity-70 p-2 rounded-md coarse:hidden">
              {images.map((_, dot) => (
                <button
                  key={dot}
                  className={`w-2 h-1 rounded-full ${dot === index ? "bg-green-500" : "bg-gray-500"}`}
                  onClick={() => onIndexChange(dot)}
                  aria-label={`Slide ${dot + 1}`}
                  aria-current={dot === index}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

/**
 * One slide: the blurred preview at once, the sharp image faded in over it.
 * Keyed by src, so the next slide starts from its own blur instead of leaving
 * the previous picture on screen while it loads.
 */
function LightboxSlide({ image, onLoaded }: { image: ProjectImage; onLoaded: () => void }) {
  const blurDataURL = getImageMeta(image)?.blurDataURL
  const [status, setStatus] = useState<"loading" | "loaded" | "failed">(() =>
    preloadStatus.get(image.src) === "loaded" ? "loaded" : "loading"
  )
  const [slow, setSlow] = useState(false)

  // The blur already shows something is coming; spell it out only once the
  // wait passes a second, the point where people start to notice a delay.
  useEffect(() => {
    if (status !== "loading") return
    const timer = setTimeout(() => setSlow(true), 1000)
    return () => clearTimeout(timer)
  }, [status])

  useEffect(() => {
    if (status === "loaded") onLoaded()
  }, [status, onLoaded])

  const loaded = status === "loaded"
  const message =
    status === "failed" ? "Couldn't load this image" : status === "loading" && slow ? "loading" : null

  return (
    <>
      {blurDataURL ? (
        <div
          aria-hidden="true"
          className={`absolute inset-0 scale-110 bg-cover bg-center blur-xl transition-opacity duration-300 motion-reduce:transition-none ${loaded ? "opacity-0" : "opacity-100"}`}
          style={{ backgroundImage: `url("${blurDataURL}")` }}
        />
      ) : (
        !loaded && <div aria-hidden="true" className="absolute inset-0 animate-pulse bg-green-500/5 motion-reduce:animate-none" />
      )}
      <Image
        {...lightboxImageProps(image.src)}
        alt={image.alt}
        loading="eager"
        className={`object-contain transition-opacity duration-300 motion-reduce:transition-none ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => {
          preloadStatus.set(image.src, "loaded")
          setStatus("loaded")
        }}
        onError={() => setStatus("failed")}
      />
      {/* Always in the page, so screen readers announce the text when it appears. */}
      <div role="status" className="absolute left-3 top-3">
        {message && (
          <span className="flex items-center rounded bg-black/70 px-2 py-1 font-mono text-xs text-green-400">
            {message}
            {status === "loading" && <span className="terminal-cursor motion-reduce:!animate-none" />}
          </span>
        )}
      </div>
    </>
  )
}

export default ImageModal
