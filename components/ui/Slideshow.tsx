"use client"

import React from 'react';
import { useState, useEffect, useRef, TouchEvent } from "react";
import Image from "next/image";
import { getImageMeta, isGif } from "@/lib/image-meta";
import { lightboxIntentHandlers } from "@/lib/image-modal";
import { COARSE_POINTER, REDUCED_MOTION, useMediaQuery } from "@/lib/media";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProjectImage } from "@/lib/types";

interface SlideshowProps {
  images: ProjectImage[];
  /** Opens the lightbox on this slide, with the whole slideshow to step through. */
  onImageClick: (images: ProjectImage[], index: number) => void;
}

const Slideshow: React.FC<SlideshowProps> = ({ images, onImageClick }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // Autoplay holds while a mouse rests on the slideshow, the keyboard is on it or
  // a finger is on it, so the slide someone is looking at doesn't move away.
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [touching, setTouching] = useState(false);
  // Bumped when a dot is clicked, so the chosen slide gets its full 3 seconds.
  const [cycle, setCycle] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // No autoplay for a finger or for reduced motion. On a phone there's no hover
  // to hold a slide still, so it moved on while someone was looking at it
  // (NN/g's carousel advice; WCAG 2.2.2 wants a pause control otherwise).
  // Touch gets arrows and a count instead.
  const touch = useMediaQuery(COARSE_POINTER);
  const reducedMotion = useMediaQuery(REDUCED_MOTION);
  const paused = hovered || focused || touching || touch || reducedMotion;

  const go = (by: number) => {
    setCurrentImageIndex((prevIndex) => (prevIndex + by + images.length) % images.length);
  };

  useEffect(() => {
    if (images.length < 2 || paused) return; // Only autoplay when there are multiple images
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change image every 3 seconds
    return () => clearInterval(timer);
  }, [images.length, paused, cycle]);

  const handleDotClick = (index: number) => {
    setCurrentImageIndex(index);
    setCycle((count) => count + 1);
  };

  // Touch event handlers for swipe functionality
  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setTouching(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    // Minimum swipe distance required (in pixels)
    const minSwipeDistance = 50;

    if (touchStartX.current && touchEndX.current) {
      const swipeDistance = touchEndX.current - touchStartX.current;

      if (Math.abs(swipeDistance) > minSwipeDistance) {
        // Swipe right for the previous image, left for the next.
        go(swipeDistance > 0 ? -1 : 1);
      }
    }

    // Reset touch coordinates
    touchStartX.current = null;
    touchEndX.current = null;
    setTouching(false);
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setHovered(false)}
      // Pause for keyboard focus only; a mouse click focuses the button too, and
      // the slideshow would otherwise stay frozen after the lightbox closes.
      onFocus={(e) => setFocused(e.target.matches(":focus-visible"))}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      {images.map((image, index) => {
        const meta = getImageMeta(image);
        return (
          <div
            key={index}
            // Off-screen slides stay out of the tab order and the accessibility tree.
            inert={index !== currentImageIndex}
            className={`absolute w-full h-full transition-transform duration-500 ease-in-out ${
              index === currentImageIndex ? "translate-x-0" : index < currentImageIndex ? "-translate-x-full" : "translate-x-full"
            }`}
          >
            <button
              type="button"
              aria-label={`Enlarge: ${image.alt}`}
              onClick={() => onImageClick(images, index)}
              {...lightboxIntentHandlers(image.src)}
              className="absolute inset-0 cursor-pointer overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-green-400"
            >
              {/* A screenshot narrower than the frame is fitted, not cropped; its own
                  blurred preview fills the bars beside it instead of empty space. */}
              {meta?.blurDataURL && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 scale-110 bg-cover bg-center opacity-40 blur-xl"
                  style={{ backgroundImage: `url(${meta.blurDataURL})` }}
                />
              )}
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                // A style rather than a class: next/image reads it to fit the
                // blurred preview the same way as the image.
                style={{ objectFit: "contain" }}
                placeholder={meta?.blurDataURL ? "blur" : "empty"}
                blurDataURL={meta?.blurDataURL}
                // The optimizer can't resize animated GIFs; it skipped them with a
                // warning on every request anyway, so serve them as they are.
                unoptimized={isGif(image.src)}
                priority={index === 0}
              />
            </button>
          </div>
        );
      })}
      {/* Touch: arrows big enough for a thumb and a count, since 8px dots can be
          neither read nor hit. Hidden with a mouse, which keeps the dots. */}
      {images.length > 1 && (
        <div className="hidden coarse:contents">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous image"
            className="absolute left-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-gray-900/75 text-green-300 active:bg-gray-700"
          >
            <ChevronLeft size={22} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next image"
            className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-gray-900/75 text-green-300 active:bg-gray-700"
          >
            <ChevronRight size={22} aria-hidden="true" />
          </button>
          <span aria-live="polite" className="absolute bottom-2 right-2 rounded bg-gray-900/80 px-2 py-0.5 font-mono text-xs tabular-nums text-green-300">
            {currentImageIndex + 1} / {images.length}
          </span>
        </div>
      )}
      {/* Indicator Dots with Background, only show if more than one image */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-gray-800 bg-opacity-70 p-2 rounded-md coarse:hidden">
          {images.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-1 rounded-full ${index === currentImageIndex ? "bg-green-500" : "bg-gray-500"}`}
              onClick={() => handleDotClick(index)}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Slideshow;
