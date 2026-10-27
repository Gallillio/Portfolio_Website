import Link from "next/link"
import type { ReactNode } from "react"
import { format, parseISO } from "date-fns"
import { cv, contentUpdated } from "@/lib/profile-extras"

const NAV = [
  { href: "/", label: "Terminal" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
]

export const linkClass = "text-green-400 underline-offset-4 hover:text-green-300 hover:underline"
// For a link inside a sentence or next to plain text: colour alone does not set
// it apart from the grey text around it, so it is underlined too.
export const inlineLinkClass = "text-green-400 underline decoration-green-500/60 underline-offset-4 hover:text-green-300"

/**
 * Frame for the plain pages: About, Projects, each project and the Azure
 * certificate. They exist because search engines and AI assistants read HTML and
 * never click the terminal's tabs, and because a shared link should open on the
 * content. Server-rendered, no client JavaScript of their own, and drawn as the
 * same terminal window so they read as part of one site.
 */
export default function StaticPage({ path, children }: { path: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-black p-4 font-mono md:p-8">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-md border border-green-500 shadow-xl shadow-green-500/30">
        <div className="flex items-center gap-4 border-b border-green-500 bg-gray-900 px-4 py-2 text-sm text-green-500">
          <span aria-hidden="true" className="flex shrink-0 gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500" />
            <span className="h-3 w-3 rounded-full bg-yellow-500" />
            <span className="h-3 w-3 rounded-full bg-green-500" />
          </span>
          <span className="min-w-0 truncate">portfolio@Gallillio:~{path}</span>
        </div>

        <nav aria-label="Site" className="flex flex-wrap gap-x-5 gap-y-1 border-b border-green-500/40 bg-gray-900 px-4 py-2 text-sm">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass}>
              {item.label}
            </Link>
          ))}
          <a href={cv.path} download={cv.downloadName} className={linkClass}>
            CV
          </a>
        </nav>

        <main className="bg-black px-4 py-6 text-sm leading-relaxed text-gray-300 md:px-8 md:py-8 md:text-base">
          {children}
          <p className="mt-12 text-xs text-gray-400">
            Last updated <time dateTime={contentUpdated}>{format(parseISO(contentUpdated), "d MMMM yyyy")}</time>
          </p>
        </main>
      </div>
    </div>
  )
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="mb-3 text-lg font-semibold text-green-400">{title}</h2>
      {children}
    </section>
  )
}

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}
