import type { MetadataRoute } from "next"
import { links } from "@/lib/profile-data"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: links.portfolio, changeFrequency: "monthly", priority: 1 },
    { url: `${links.portfolio}/azure-certification`, changeFrequency: "yearly", priority: 0.3 },
  ]
}
