import type { Metadata } from "next"
import Link from "next/link"
import { personalAchievements } from "@/lib/profile-data"

// This page once said the exam was still ahead. It now reads the earned
// certification from the achievements data, so the two cannot disagree again.
const certification = personalAchievements.find((a) => a.id === "azure-ai-engineer-associate")

export const metadata: Metadata = {
  title: "Azure AI Engineer Associate · Ahmed Galal Elzeky",
  description: certification?.description.split("\n")[0],
}

export default function AzureCertificationPage() {
  const [headline, ...details] = certification?.description.split("\n") ?? []

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4 font-mono text-green-400">
      <div className="mx-auto max-w-2xl space-y-8 text-center">
        <h1 className="mb-6 text-3xl font-bold">{certification?.title ?? "Azure AI Engineer Associate"}</h1>

        <div className="rounded-lg border-2 border-green-500 bg-black p-6">
          <div className="mb-4 text-xl text-green-300">CERTIFICATION STATUS: EARNED</div>

          {headline && <p className="mb-4 text-lg">{headline}</p>}

          <div className="mb-6 space-y-2 text-left">
            {details.map((line) => (
              <p key={line} className="border-l-2 border-green-500 py-1 pl-4">
                <span className="text-green-400">$</span> {line.replace(/^- /, "")}
              </p>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {certification?.link && (
              <a
                href={certification.link}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-green-500 px-6 py-3 font-bold text-black transition-colors duration-300 hover:bg-green-600"
              >
                {certification.linkText ?? "View Certification"}
              </a>
            )}
            <Link
              href="/"
              className="rounded-md border border-green-500 px-6 py-3 font-bold text-green-400 transition-colors duration-300 hover:bg-green-500/20"
            >
              Back to the portfolio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
