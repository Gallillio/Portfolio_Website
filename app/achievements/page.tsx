import TerminalPage from "@/components/terminal-page"
import { ACHIEVEMENTS_TITLE, pageMetadata, breadcrumbJsonLd } from "@/lib/seo"

// The terminal opened on its My Achievements tab: the paper, the awards and the
// certifications.

export const metadata = pageMetadata({
  title: ACHIEVEMENTS_TITLE,
  description:
    "Ahmed Galal Elzeky's paper in Procedia Computer Science (Elsevier), his Times Higher Education Awards Arab World 2024 win, hackathon awards and his Microsoft Azure AI Engineer and IBM watsonx certifications.",
  path: "/achievements",
})

export default function AchievementsPage() {
  return (
    <TerminalPage
      jsonLd={[breadcrumbJsonLd([{ name: "Publications, awards and certifications", path: "/achievements" }])]}
    />
  )
}
