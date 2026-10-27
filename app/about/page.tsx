import TerminalPage from "@/components/terminal-page"
import { introduction } from "@/lib/profile-extras"
import { ABOUT_TITLE, pageMetadata, summarize, aboutPageJsonLd, breadcrumbJsonLd } from "@/lib/seo"

// The terminal opened on its About tab: bio, skills, timeline, experience,
// education, freelance work, languages and courses.

export const metadata = pageMetadata({
  title: ABOUT_TITLE,
  description: summarize(introduction[0]),
  path: "/about",
})

export default function AboutPage() {
  return <TerminalPage jsonLd={[aboutPageJsonLd, breadcrumbJsonLd([{ name: "About", path: "/about" }])]} />
}
