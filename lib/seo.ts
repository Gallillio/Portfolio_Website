import type { Metadata } from "next"
import { links, education, personalAchievements } from "./profile-data"
import { title, headline, introduction, contact, contentUpdated } from "./profile-extras"
import { projectPages } from "./projects"
import { projectSlugForPath, tabForPath } from "./routes"
import type { Project } from "./types"

// Search and share metadata, and the schema.org structured data, built from the
// profile data so neither can drift from what the pages say.

export const NAME = "Ahmed Galal Elzeky"

// The name leads the title: it is what a recruiter searches for and what shows
// in a browser tab or a shared link.
export const SITE_TITLE = `${NAME} · ${title}`
export const SITE_DESCRIPTION =
  "AI Engineer in Cairo building enterprise LLM systems: RAG, agents and model routing. Founding engineer on SIA at ISYS, an IBM partner."

// New filename on purpose: social networks cache preview images by URL.
export const OG_IMAGE = { url: "/og-2026.png", width: 1200, height: 630, alt: SITE_TITLE }

// Page titles. Each route's metadata uses them, and so does the terminal when it
// changes the address in the browser without loading a new page, so the browser
// tab always shows the title a direct visit to that address would.
export const HOME_TITLE = `${SITE_TITLE} | portfolio@Gallillio:~`
export const ABOUT_TITLE = `About ${NAME} · AI Engineer in Cairo`
export const PROJECTS_TITLE = `Projects · ${NAME}`
export const ACHIEVEMENTS_TITLE = `Publications, awards and certifications · ${NAME}`

export function projectTitle(project: Pick<Project, "title" | "tagline">): string {
  const heading = project.tagline ? `${project.title}: ${project.tagline}` : project.title
  return `${heading} · ${NAME}`
}

/** The title of the page at an address the terminal can show. */
export function titleForPath(pathname: string): string {
  const slug = projectSlugForPath(pathname)
  const project = slug && projectPages.find((p) => p.slug === slug)
  if (project) return projectTitle(project)
  switch (tabForPath(pathname)) {
    case "projects":
      return PROJECTS_TITLE
    case "about":
      return ABOUT_TITLE
    case "my-achievements":
      return ACHIEVEMENTS_TITLE
    default:
      return HOME_TITLE
  }
}

/** Public URL of a file in public/. Several folders have spaces in their names. */
export const publicUrl = (src: string) => `${links.portfolio}${encodeURI(src)}`

/**
 * The opening sentences of `text`, kept under `max` characters, for meta
 * descriptions and link lists. A first sentence that is already too long is cut
 * at a word boundary.
 */
export function summarize(text: string, max = 160): string {
  // Split only where punctuation is followed by a space, so the dot in a domain
  // such as "comicspot.co" does not end a sentence.
  let result = ""
  for (const sentence of text.split(/(?<=[.!?])\s+/)) {
    const next = result ? `${result} ${sentence}` : sentence
    if (next.length > max) break
    result = next
  }
  return result || `${text.slice(0, max - 1).replace(/\s+\S*$/, "").replace(/[,;:]$/, "")}…`
}

/**
 * Metadata for every page except the home page, which keeps the layout's. Next
 * replaces a parent's openGraph and twitter objects rather than merging them, so
 * each page states the full set; leaving one out loses the share image. The
 * canonical is set per page because one inherited from the layout pointed the
 * Azure page at the home page and told Google not to index it.
 */
export function pageMetadata({
  title,
  description,
  path,
  image,
}: {
  title: string
  description: string
  path: string
  image?: { url: string; alt: string }
}): Metadata {
  const images = image ? [image] : [OG_IMAGE]
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", title, description, url: path, siteName: NAME, images },
    twitter: { card: "summary_large_image", title, description, images: images.map((i) => i.url) },
  }
}

const PERSON_ID = `${links.portfolio}/#person`
const WEBSITE_ID = `${links.portfolio}/#website`

// contentUpdated as a full date and time: Google reads dateModified as a DateTime
// and reports a bare date as "Invalid datetime value". Midday UTC keeps the same
// calendar date in Cairo and wherever else the page is read.
const DATE_MODIFIED = `${contentUpdated}T12:00:00Z`

// Enough for a page that only points at the person to name them on its own.
const personRef = { "@type": "Person", "@id": PERSON_ID, name: NAME, url: links.portfolio }

const person = {
  ...personRef,
  alternateName: ["Gallillio", "Ahmed Galal"],
  jobTitle: title,
  // Third person, from the About page: "I build..." names nobody once quoted alone.
  description: introduction[0],
  image: publicUrl("/Me.jpg"),
  email: `mailto:${contact.email}`,
  worksFor: { "@type": "Organization", name: "Intelligent Systems (ISYS)" },
  address: { "@type": "PostalAddress", addressLocality: "Cairo", addressCountry: "EG" },
  // The headline after the role: "LLMs | RAG | Agentic Systems | Arabic NLP".
  knowsAbout: headline.split(" | ").slice(1),
  alumniOf: education.map((e) => ({ "@type": "EducationalOrganization", name: e.institution })),
  hasCredential: personalAchievements
    .filter((a) => a.category === "Certification")
    .map((a) => ({
      "@type": "EducationalOccupationalCredential",
      name: a.title,
      credentialCategory: "certification",
      url: a.link,
    })),
  // Lets search engines tie the site to these profiles, so "Ahmed Galal Elzeky"
  // resolves to one person rather than to his namesakes.
  sameAs: [links.linkedin, links.github, links.orcid, links.scholar, links.credly, links.tiktok],
}

const website = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: links.portfolio,
  name: NAME,
  inLanguage: "en",
  publisher: { "@id": PERSON_ID },
}

/** On every page, from the root layout: the site and the person it is about. */
export const siteJsonLd = { "@context": "https://schema.org", "@graph": [website, person] }

/** The home page is the person's profile page. */
export const profilePageJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  url: links.portfolio,
  name: SITE_TITLE,
  dateModified: DATE_MODIFIED,
  isPartOf: { "@id": WEBSITE_ID },
  mainEntity: personRef,
}

export const aboutPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  url: `${links.portfolio}/about`,
  name: `About ${NAME}`,
  dateModified: DATE_MODIFIED,
  isPartOf: { "@id": WEBSITE_ID },
  mainEntity: personRef,
}

/** Breadcrumb trail from the home page, e.g. Home › Projects › SIA. */
export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "" }, ...trail].map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${links.portfolio}${item.path}`,
    })),
  }
}

/**
 * A project page. CreativeWork rather than SoftwareApplication on purpose:
 * Google's SoftwareApplication rich result requires a price and ratings these
 * projects do not have, and reports the page as broken without them.
 */
export function projectJsonLd(project: Project & { slug: string }) {
  const path = `/projects/${project.slug}`
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    headline: project.tagline ? `${project.title}: ${project.tagline}` : project.title,
    description: project.description,
    url: `${links.portfolio}${path}`,
    image: project.images.map((image) => publicUrl(image.src)),
    keywords: project.technologies.join(", "),
    author: personRef,
    dateModified: DATE_MODIFIED,
    isPartOf: { "@id": WEBSITE_ID },
  }
}
