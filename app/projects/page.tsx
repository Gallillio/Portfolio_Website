import TerminalPage from "@/components/terminal-page"
import { PROJECTS_TITLE, pageMetadata, breadcrumbJsonLd } from "@/lib/seo"

// The terminal opened on its Projects tab.

export const metadata = pageMetadata({
  title: PROJECTS_TITLE,
  description:
    "Projects by Ahmed Galal Elzeky: SIA, an enterprise AI assistant at ISYS, the Comic Spot storefront, the Lango app, and earlier AI and web work.",
  path: "/projects",
})

export default function ProjectsPage() {
  return <TerminalPage jsonLd={[breadcrumbJsonLd([{ name: "Projects", path: "/projects" }])]} />
}
