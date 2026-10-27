import { links } from "@/lib/profile-data"
import { introduction, headline, availability, contact, cv } from "@/lib/profile-extras"
import { projectPages } from "@/lib/projects"
import { NAME, summarize, publicUrl } from "@/lib/seo"

// /llms.txt (llmstxt.org): a short Markdown index of the site for AI agents and
// coding tools. Google says its search does not read it, so this is a cheap
// extra, not a ranking fix; the real content is on the pages it links to.

export const dynamic = "force-static"

export function GET() {
  const site = links.portfolio
  const body = [
    `# ${NAME}`,
    "",
    `> ${introduction.join(" ")}`,
    "",
    `${headline}. ${availability}.`,
    "",
    "## Pages",
    "",
    `- [About](${site}/about): experience, education, publications, awards, certifications and skills`,
    `- [Projects](${site}/projects): every project, with screenshots`,
    ...projectPages.map((project) => `- [${project.title}](${site}/projects/${project.slug}): ${summarize(project.description)}`),
    `- [CV (PDF)](${publicUrl(cv.path)})`,
    "",
    "## Profiles",
    "",
    `- [LinkedIn](${links.linkedin})`,
    `- [GitHub](${links.github})`,
    `- [ORCID](${links.orcid})`,
    `- [Google Scholar](${links.scholar})`,
    `- [Credly](${links.credly})`,
    `- [TikTok](${links.tiktok})`,
    "",
    "## Contact",
    "",
    `- Email: ${contact.email}`,
    "",
  ].join("\n")

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } })
}
