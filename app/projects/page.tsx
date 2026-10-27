import Link from "next/link"
import { projectPages } from "@/lib/projects"
import { NAME, pageMetadata, breadcrumbJsonLd } from "@/lib/seo"
import StaticPage, { JsonLd, linkClass } from "@/components/static-page"

export const metadata = pageMetadata({
  title: `Projects · ${NAME}`,
  description:
    "Projects by Ahmed Galal Elzeky: SIA, an enterprise AI assistant at ISYS, the Comic Spot storefront, the Lango app, and earlier AI and web work.",
  path: "/projects",
})

export default function ProjectsPage() {
  return (
    <StaticPage path="/projects">
      <JsonLd data={breadcrumbJsonLd([{ name: "Projects", path: "/projects" }])} />

      <h1 className="text-2xl font-semibold text-white md:text-3xl">Projects</h1>
      <p className="mt-3">
        Work by {NAME}, the largest and most recent first. Each project has its own page with screenshots, and SIA
        also has a full case study.
      </p>

      <div className="mt-8 space-y-8">
        {projectPages.map((project) => (
          <article key={project.slug}>
            <h2 className="text-lg font-semibold">
              <Link href={`/projects/${project.slug}`} className={linkClass}>
                {project.title}
              </Link>
            </h2>
            {(project.role || project.period) && (
              <p className="mt-1 text-sm text-gray-400">{[project.role, project.period].filter(Boolean).join(" · ")}</p>
            )}
            <p className="mt-2">{project.description}</p>
          </article>
        ))}
      </div>
    </StaticPage>
  )
}
