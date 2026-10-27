"use client"

import type { ReactNode, Ref, MouseEvent } from "react"
import Image from "next/image"
import { ArrowLeft, ArrowRight, ExternalLink, Github } from "lucide-react"
import { useAchievements } from "@/lib/achievements-context"
import { getImageMeta } from "@/lib/image-meta"
import { lightboxIntentHandlers } from "@/lib/image-modal"
import { pathForTab, projectPath } from "@/lib/routes"
import type { Project, ProjectImage } from "@/lib/types"

type ProjectPage = Project & { slug: string }

interface ProjectDetailProps {
  project: ProjectPage
  previous: ProjectPage
  next: ProjectPage
  /** The title, focused when the write-up opens so keyboard and screen reader users start there. */
  headingRef: Ref<HTMLHeadingElement>
  onBack: (event: MouseEvent<HTMLAnchorElement>) => void
  onOpenProject: (event: MouseEvent<HTMLAnchorElement>, slug: string) => void
  onImageClick: (images: ProjectImage[], index: number) => void
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

/**
 * A project's full write-up, shown in the Projects tab in place of the cards at
 * /projects/<slug>. The server renders it for that address too, so search engines
 * and AI assistants read the same text a visitor does. SIA's case study, once a
 * pop-up, is the #case-study part of its write-up.
 */
export default function ProjectDetail({
  project,
  previous,
  next,
  headingRef,
  onBack,
  onOpenProject,
  onImageClick,
}: ProjectDetailProps) {
  const { clickProjectDemo, clickProjectCode } = useAchievements()
  const study = project.caseStudy
  const facts = [
    project.role,
    project.period,
    project.platforms?.join(", "),
    project.inDevelopment ? project.statusLabel ?? "In development" : undefined,
  ].filter(Boolean)
  // The same placeholder rules as the cards: "#" and joke strings are not links.
  const demo = project.demo_available && project.demo?.startsWith("http") ? project.demo : undefined
  const code = project.code_available && project.github?.startsWith("http") ? project.github : undefined
  // SIA lists its diagrams among the screenshots too; show each image once.
  const images = [...project.images, ...(study?.diagrams ?? [])].filter(
    (image, index, all) => image.src !== "/in-development.png" && all.findIndex((other) => other.src === image.src) === index
  )

  return (
    <>
      {/* Pinned to the top of the tab, across its full width, while the write-up
          scrolls beneath it. -top-2 cancels the tab's own top padding (pt-2 in
          components/terminal.tsx), which would otherwise show text above the bar. */}
      <nav aria-label="Breadcrumb" className="sticky -top-2 z-10 -mx-6 -mt-6 mb-6 border-b border-green-500/40 bg-black px-6 py-3">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <a
            href={pathForTab("projects")}
            onClick={onBack}
            className="inline-flex shrink-0 items-center gap-1.5 rounded border border-green-500/60 px-2.5 py-1 text-sm text-green-400 transition-colors hover:bg-green-500/10 hover:text-green-300"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Projects
          </a>
          <span aria-hidden="true" className="text-green-500/50">/</span>
          <span aria-current="page" className="min-w-0 truncate text-sm text-green-300/70">
            {project.title}
          </span>
        </div>
      </nav>

      <article className="mx-auto max-w-3xl text-sm leading-relaxed text-green-100/85 md:text-base">
        <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold text-green-400 outline-none md:text-3xl">
          {project.title}
        </h1>
        {project.tagline && <p className="mt-1 text-green-300">{capitalize(project.tagline)}</p>}
        {facts.length > 0 && <p className="mt-2 text-xs text-green-300/60 md:text-sm">{facts.join(" · ")}</p>}

        <p className="mt-6 whitespace-pre-line">{project.description}</p>

        {(demo || code) && (
          <p className="mt-5 flex flex-wrap gap-3">
            {demo && (
              <a href={demo} target="_blank" rel="noopener noreferrer" onClick={() => clickProjectDemo()} className={buttonClass}>
                <ExternalLink size={16} aria-hidden="true" />
                Live site
              </a>
            )}
            {code && (
              <a href={code} target="_blank" rel="noopener noreferrer" onClick={() => clickProjectCode(project.title)} className={buttonClass}>
                <Github size={16} aria-hidden="true" />
                Source code
              </a>
            )}
          </p>
        )}

        {study ? (
          <div id="case-study" className="scroll-mt-20">
            {/* scroll-mt clears the pinned bar when a link jumps here, the browser's own
                jump on a direct visit included (components/projects.tsx reads it too). */}
            <Section title="My role">
              <p>{study.role}</p>
            </Section>
            <Section title="The problem">
              <p>{study.problem}</p>
            </Section>
            <Section title="Key decisions">
              <div className="space-y-4">
                {study.decisions.map((decision) => (
                  <div key={decision.title}>
                    <h3 className="font-semibold text-green-300">{decision.title}</h3>
                    <p className="mt-1">{decision.detail}</p>
                  </div>
                ))}
              </div>
            </Section>
            <Section title="Results">
              <ul className="space-y-1.5">
                {study.results.map((result) => (
                  <li key={result} className="flex gap-2">
                    <span aria-hidden="true" className="select-none text-green-500">›</span>
                    <span>{result}</span>
                  </li>
                ))}
              </ul>
            </Section>
            {study.limitations && (
              <Section title="Limitations and next steps">
                <p>{study.limitations}</p>
              </Section>
            )}
          </div>
        ) : (
          project.detailedDescription && (
            <Section title="In detail">
              <p>{project.detailedDescription}</p>
            </Section>
          )
        )}

        {images.length > 0 && (
          <Section title="Screenshots">
            <div className="grid gap-6 sm:grid-cols-2">
              {images.map((image, index) => {
                // The real size reserves the right box before the screenshot loads,
                // so the text below never jumps; the blur fills that box meanwhile.
                const meta = getImageMeta(image)
                return (
                  <figure key={image.src}>
                    <button
                      type="button"
                      onClick={() => onImageClick(images, index)}
                      {...lightboxIntentHandlers(image.src)}
                      aria-label={`Enlarge: ${image.alt}`}
                      className="block w-full overflow-hidden rounded border border-green-500/30 transition-colors hover:border-green-500"
                    >
                      <Image
                        src={image.src}
                        alt={image.alt}
                        width={meta?.width ?? 1600}
                        height={meta?.height ?? 900}
                        placeholder={meta?.blurDataURL ? "blur" : "empty"}
                        blurDataURL={meta?.blurDataURL}
                        sizes="(min-width: 640px) 370px, 100vw"
                        className="h-auto w-full"
                      />
                    </button>
                    <figcaption className="mt-2 text-xs text-green-300/60">{image.alt}</figcaption>
                  </figure>
                )
              })}
            </div>
          </Section>
        )}

        <Section title="Technologies">
          <ul className="flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <li key={tech} className="rounded-md border border-green-500 px-2.5 py-0.5 text-xs font-semibold text-green-400">
                {tech}
              </li>
            ))}
          </ul>
        </Section>

        {study?.note && <p className="mt-8 border-t border-green-500/20 pt-4 text-xs text-green-300/60">{study.note}</p>}

        <nav aria-label="More projects" className="mt-12 grid gap-3 border-t border-green-500/30 pt-6 sm:grid-cols-2">
          <SiblingLink project={previous} direction="previous" onOpenProject={onOpenProject} />
          <SiblingLink project={next} direction="next" onOpenProject={onOpenProject} />
        </nav>
      </article>
    </>
  )
}

const buttonClass =
  "inline-flex items-center gap-2 rounded-md border border-green-500 bg-black px-3 py-1.5 text-sm text-green-400 transition-colors hover:bg-green-500/20"

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      {/* The "## " is drawn by CSS, so the heading's text, and what crawlers read, stays the title alone. */}
      <h2 className="mb-3 text-xs uppercase tracking-wider text-green-500 before:content-['##_'] md:text-sm">{title}</h2>
      {children}
    </section>
  )
}

function SiblingLink({
  project,
  direction,
  onOpenProject,
}: {
  project: ProjectPage
  direction: "previous" | "next"
  onOpenProject: ProjectDetailProps["onOpenProject"]
}) {
  const isNext = direction === "next"
  return (
    <a
      href={projectPath(project.slug)}
      onClick={(event) => onOpenProject(event, project.slug)}
      className={`group block rounded-md border border-green-500/40 p-4 transition-colors hover:border-green-500 hover:bg-green-500/5 ${isNext ? "sm:text-right" : ""}`}
    >
      <span className={`flex items-center gap-1.5 text-xs text-green-300/60 ${isNext ? "sm:justify-end" : ""}`}>
        {!isNext && <ArrowLeft size={12} aria-hidden="true" />}
        {isNext ? "Next project" : "Previous project"}
        {isNext && <ArrowRight size={12} aria-hidden="true" />}
      </span>
      <span className="mt-1 block font-semibold text-green-400 group-hover:text-green-300">{project.title}</span>
      {project.tagline && <span className="block text-xs text-green-300/60">{capitalize(project.tagline)}</span>}
    </a>
  )
}
