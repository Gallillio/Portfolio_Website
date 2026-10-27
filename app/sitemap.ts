import type { MetadataRoute } from "next"
import { links } from "@/lib/profile-data"
import { contentUpdated } from "@/lib/profile-extras"
import { projectPages } from "@/lib/projects"

// No priority or changefreq: Google ignores both. lastModified is the date the
// content last changed, not the build date (see contentUpdated).
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "/about",
    "/projects",
    ...projectPages.map((project) => `/projects/${project.slug}`),
    "/azure-certification",
  ]
  return paths.map((path) => ({ url: `${links.portfolio}${path}`, lastModified: contentUpdated }))
}
