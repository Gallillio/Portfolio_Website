import type { Metadata } from "next"
import TerminalPage from "@/components/terminal-page"
import { profilePageJsonLd } from "@/lib/seo"

export const metadata: Metadata = {
  alternates: { canonical: "/" },
}

export default function Home() {
  return <TerminalPage jsonLd={[profilePageJsonLd]} />
}
