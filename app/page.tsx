import type { Metadata } from "next"
import Terminal from "@/components/terminal"
import { JsonLd } from "@/components/static-page"
import { profilePageJsonLd } from "@/lib/seo"

export const metadata: Metadata = {
  alternates: { canonical: "/" },
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8 bg-black">
      <JsonLd data={profilePageJsonLd} />
      <Terminal />
    </main>
  )
}
