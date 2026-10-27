import type { MetadataRoute } from "next"
import { links } from "@/lib/profile-data"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${links.portfolio}/sitemap.xml`,
  }
}
