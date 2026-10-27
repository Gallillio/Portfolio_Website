import type { Metadata } from "next"
import Link from "next/link"
import Terminal from "@/components/terminal"
import { JsonLd } from "@/components/static-page"
import { projectPages } from "@/lib/projects"
import { links } from "@/lib/profile-data"
import { cv } from "@/lib/profile-extras"
import { profilePageJsonLd } from "@/lib/seo"

export const metadata: Metadata = {
  alternates: { canonical: "/" },
}

const caseStudy = projectPages.find((project) => project.caseStudy)

const LINK = "underline-offset-4 hover:text-green-300 hover:underline"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8 bg-black">
      <JsonLd data={profilePageJsonLd} />
      <Terminal />
      {/* Plain links under the terminal. Its tabs are buttons, which crawlers never
          click, so these are how search engines and AI assistants reach the About
          and project pages. On phones the fullscreen terminal covers them. */}
      <nav aria-label="Pages" className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 font-mono text-xs text-green-500">
        <Link href="/about" className={LINK}>About</Link>
        <Link href="/projects" className={LINK}>Projects</Link>
        {caseStudy && (
          <Link href={`/projects/${caseStudy.slug}`} className={LINK}>{caseStudy.title} case study</Link>
        )}
        <a href={cv.path} download={cv.downloadName} className={LINK}>CV</a>
        <a href={links.linkedin} target="_blank" rel="noopener noreferrer me" className={LINK}>LinkedIn</a>
        <a href={links.github} target="_blank" rel="noopener noreferrer me" className={LINK}>GitHub</a>
      </nav>
    </main>
  )
}
