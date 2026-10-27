import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { projectPages } from "@/lib/projects"
import { NAME, pageMetadata, summarise, projectJsonLd, breadcrumbJsonLd } from "@/lib/seo"
import { getImageMeta } from "@/lib/image-meta"
import StaticPage, { Section, JsonLd, linkClass, inlineLinkClass } from "@/components/static-page"

// One page per project, built at deploy time from lib/projects.ts. The terminal's
// Projects tab and case-study modal hold the same content, but nothing behind a
// tab or a button reaches search engines or AI assistants.

type Props = { params: Promise<{ slug: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return projectPages.map((project) => ({ slug: project.slug }))
}

const findProject = (slug: string) => projectPages.find((project) => project.slug === slug)

const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = findProject((await params).slug)
  if (!project) return {}
  const heading = project.tagline ? `${project.title}: ${project.tagline}` : project.title
  const cover = project.images[0]
  return pageMetadata({
    title: `${heading} · ${NAME}`,
    description: summarise(project.description),
    path: `/projects/${project.slug}`,
    image: cover && { url: encodeURI(cover.src), alt: cover.alt },
  })
}

export default async function ProjectPage({ params }: Props) {
  const project = findProject((await params).slug)
  if (!project) notFound()

  const study = project.caseStudy
  const facts = [
    project.role,
    project.period,
    project.platforms?.join(", "),
    project.inDevelopment ? project.statusLabel ?? "In development" : undefined,
  ].filter(Boolean)
  // The same placeholder rules as the cards: "#" and joke strings are not links.
  const externalLinks = [
    project.demo_available && project.demo?.startsWith("http") && { href: project.demo, label: "Live site" },
    project.code_available && project.github?.startsWith("http") && { href: project.github, label: "Source code" },
  ].filter((link): link is { href: string; label: string } => Boolean(link))
  // SIA lists its diagrams among the screenshots too; show each image once.
  const images = [...project.images, ...(study?.diagrams ?? [])].filter(
    (image, index, all) => all.findIndex((other) => other.src === image.src) === index
  )
  const otherProjects = projectPages.filter((other) => other.slug !== project.slug)

  return (
    <StaticPage path={`/projects/${project.slug}`}>
      <JsonLd data={projectJsonLd(project)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Projects", path: "/projects" },
          { name: project.title, path: `/projects/${project.slug}` },
        ])}
      />

      <nav aria-label="Breadcrumb" className="text-xs text-gray-400">
        <Link href="/projects" className={inlineLinkClass}>
          Projects
        </Link>{" "}
        / {project.title}
      </nav>

      <h1 className="mt-3 text-2xl font-semibold text-white md:text-3xl">{project.title}</h1>
      {project.tagline && <p className="mt-1 text-green-400">{capitalise(project.tagline)}</p>}
      {facts.length > 0 && <p className="mt-2 text-sm text-gray-400">{facts.join(" · ")}</p>}

      <p className="mt-6">{project.description}</p>

      {externalLinks.length > 0 && (
        <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1">
          {externalLinks.map((link) => (
            <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
              {link.label}
            </a>
          ))}
        </p>
      )}

      {study ? (
        <>
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
                  <h3 className="font-semibold text-gray-100">{decision.title}</h3>
                  <p className="mt-1">{decision.detail}</p>
                </div>
              ))}
            </div>
          </Section>
          <Section title="Results">
            <ul className="list-disc space-y-1 pl-5">
              {study.results.map((result) => (
                <li key={result}>{result}</li>
              ))}
            </ul>
          </Section>
          {study.limitations && (
            <Section title="Limitations and next steps">
              <p>{study.limitations}</p>
            </Section>
          )}
        </>
      ) : (
        project.detailedDescription && (
          <Section title="In detail">
            <p>{project.detailedDescription}</p>
          </Section>
        )
      )}

      {images.length > 0 && (
        <Section title="Screenshots">
          <div className="space-y-8">
            {images.map((image) => {
              // The real size reserves the right box before the screenshot loads,
              // so the text below never jumps; the blur fills that box meanwhile.
              const meta = getImageMeta(image)
              if (!meta) throw new Error(`No size for ${image.src}: is it in a public/ subfolder?`)
              return (
                <figure key={image.src}>
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={meta.width}
                    height={meta.height}
                    placeholder={meta.blurDataURL ? "blur" : "empty"}
                    blurDataURL={meta.blurDataURL}
                    sizes="(min-width: 896px) 830px, 100vw"
                    className="h-auto w-full rounded border border-green-500/30"
                  />
                  <figcaption className="mt-2 text-xs text-gray-400">{image.alt}</figcaption>
                </figure>
              )
            })}
          </div>
        </Section>
      )}

      <Section title="Technologies">
        <ul className="flex flex-wrap gap-2">
          {project.technologies.map((tech) => (
            <li key={tech} className="rounded border border-green-500/60 px-2 py-0.5 text-xs text-green-400">
              {tech}
            </li>
          ))}
        </ul>
      </Section>

      {study?.note && <p className="mt-8 text-sm text-gray-400">{study.note}</p>}

      <Section title="More projects">
        <ul className="space-y-1">
          {otherProjects.map((other) => (
            <li key={other.slug}>
              <Link href={`/projects/${other.slug}`} className={inlineLinkClass}>
                {other.title}
              </Link>
              {other.tagline && <span className="text-gray-400">: {other.tagline}</span>}
            </li>
          ))}
        </ul>
      </Section>
    </StaticPage>
  )
}
