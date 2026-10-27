"use client"

import React, { useEffect } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { X } from "lucide-react"
import type { Project } from "@/lib/types"

interface CaseStudyModalProps {
  project: Project | null
  onClose: () => void
  /** Opens a diagram in the shared image lightbox. */
  onImageClick: (src: string) => void
  /** True while that lightbox is open on top, so Escape closes it and not this. */
  suspended?: boolean
}

/**
 * Long-form write-up behind a project card's "Case study" button. Styled as the
 * same terminal window as the image lightbox (lib/image-modal.tsx) so the two
 * read as one family. The card itself stays short; recruiters who want the
 * problem, the decisions and the measured results open this.
 */
export default function CaseStudyModal({ project, onClose, onImageClick, suspended = false }: CaseStudyModalProps) {
  const study = project?.caseStudy

  useEffect(() => {
    if (!study) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !suspended) onClose()
    }
    // Stop the page behind the modal from scrolling along with it.
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [study, onClose, suspended])

  if (!project || !study) return null

  // Portal to <body>: the terminal window is `transform-gpu`, which turns it into
  // the containing block for fixed elements and would clip the modal to its frame.
  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-3 backdrop-blur-sm md:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="case-study-title"
        className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-md border border-green-500/50 bg-gray-900/95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between rounded-t-md border-b border-green-500/50 bg-black/50 px-4 py-2">
          <div className="flex space-x-2">
            <button
              className="h-3 w-3 rounded-full border border-red-600 bg-red-500 transition-colors hover:bg-red-600"
              onClick={onClose}
              aria-label="Close"
            ></button>
            <div className="h-3 w-3 rounded-full border border-yellow-600 bg-yellow-500/80"></div>
            <div className="h-3 w-3 rounded-full border border-green-600 bg-green-500/80"></div>
          </div>
          <span className="truncate px-3 font-mono text-xs text-green-300/60">
            ~/projects/{project.title.toLowerCase().replace(/\s+/g, "-")}/case-study.md
          </span>
          <button className="text-green-500 transition-colors hover:text-green-400" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5 text-sm leading-relaxed text-green-100/85 md:px-7">
          <h2 id="case-study-title" className="text-xl font-semibold text-green-400">
            {project.title}: case study
          </h2>
          {project.role && <p className="mt-1 text-xs text-green-300/60">{project.role}</p>}

          <Section title="My role">
            <p>{study.role}</p>
          </Section>

          <Section title="The problem">
            <p>{study.problem}</p>
          </Section>

          <Section title="Key decisions">
            <ul className="space-y-3">
              {study.decisions.map((decision) => (
                <li key={decision.title}>
                  <span className="font-semibold text-green-300">{decision.title}.</span> {decision.detail}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Results">
            <ul className="space-y-1.5">
              {study.results.map((result) => (
                <li key={result} className="flex gap-2">
                  <span className="select-none text-green-500">›</span>
                  <span>{result}</span>
                </li>
              ))}
            </ul>
          </Section>

          {study.limitations && (
            <Section title="Known gap and next step">
              <p>{study.limitations}</p>
            </Section>
          )}

          {study.diagrams && study.diagrams.length > 0 && (
            <Section title="Architecture">
              <div className="space-y-3">
                {study.diagrams.map((diagram) => (
                  <button
                    key={diagram.src}
                    type="button"
                    onClick={() => onImageClick(diagram.src)}
                    className="block w-full overflow-hidden rounded-md border border-green-500/20 transition-colors hover:border-green-500/60"
                    aria-label={`Enlarge: ${diagram.alt}`}
                  >
                    <Image
                      src={diagram.src}
                      alt={diagram.alt}
                      width={1800}
                      height={900}
                      sizes="(max-width: 768px) 100vw, 720px"
                      className="h-auto w-full"
                    />
                  </button>
                ))}
              </div>
            </Section>
          )}

          {study.note && <p className="mt-6 border-t border-green-500/20 pt-4 text-xs text-green-300/50">{study.note}</p>}
        </div>
      </div>
    </div>,
    document.body
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h3 className="mb-2 font-mono text-xs uppercase tracking-wider text-green-500">## {title}</h3>
      {children}
    </section>
  )
}
