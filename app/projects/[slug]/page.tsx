import type { Metadata } from "next"
import { notFound } from "next/navigation"
import TerminalPage from "@/components/terminal-page"
import { projectPages } from "@/lib/projects"
import { pageMetadata, projectTitle, summarize, projectJsonLd, breadcrumbJsonLd } from "@/lib/seo"

// One address per project, built at deploy time from lib/projects.ts: the
// terminal opened on its Projects tab with this project's write-up showing.

type Props = { params: Promise<{ slug: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return projectPages.map((project) => ({ slug: project.slug }))
}

const findProject = (slug: string) => projectPages.find((project) => project.slug === slug)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = findProject((await params).slug)
  if (!project) return {}
  const cover = project.images[0]
  return pageMetadata({
    title: projectTitle(project),
    description: summarize(project.description),
    path: `/projects/${project.slug}`,
    image: cover && { url: encodeURI(cover.src), alt: cover.alt },
  })
}

export default async function ProjectPage({ params }: Props) {
  const project = findProject((await params).slug)
  if (!project) notFound()

  return (
    <TerminalPage
      jsonLd={[
        projectJsonLd(project),
        breadcrumbJsonLd([
          { name: "Projects", path: "/projects" },
          { name: project.title, path: `/projects/${project.slug}` },
        ]),
      ]}
    />
  )
}
