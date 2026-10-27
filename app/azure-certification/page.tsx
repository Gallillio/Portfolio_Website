import { personalAchievements } from "@/lib/profile-data"
import { NAME, pageMetadata } from "@/lib/seo"
import StaticPage, { linkClass } from "@/components/static-page"

// This page once said the exam was still ahead. It now reads the earned
// certification from the achievements data, so the two cannot disagree again.
const certification = personalAchievements.find((a) => a.id === "azure-ai-engineer-associate")
const [headline, ...details] = certification?.description.split("\n") ?? []
const certificationTitle = certification?.title ?? "Microsoft Certified: Azure AI Engineer Associate"

export const metadata = pageMetadata({
  title: `Azure AI Engineer Associate · ${NAME}`,
  description: `${NAME} holds the ${certificationTitle} certification. ${headline ?? ""}`.trim(),
  path: "/azure-certification",
})

export default function AzureCertificationPage() {
  return (
    <StaticPage path="/azure-certification">
      <h1 className="text-2xl font-semibold text-white md:text-3xl">{certificationTitle}</h1>
      <p className="mt-2 text-green-400">Certification status: earned</p>

      {headline && <p className="mt-6">{headline}</p>}

      <div className="mt-4 space-y-2">
        {details.map((line) => (
          <p key={line} className="border-l-2 border-green-500 py-1 pl-4">
            <span className="text-green-400">$</span> {line.replace(/^- /, "")}
          </p>
        ))}
      </div>

      {certification?.link && (
        <p className="mt-6">
          <a href={certification.link} target="_blank" rel="noopener noreferrer" className={linkClass}>
            {certification.linkText ?? "View Certification"}
          </a>
        </p>
      )}
    </StaticPage>
  )
}
