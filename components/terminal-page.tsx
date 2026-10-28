import Terminal from "@/components/terminal"
import { JsonLd } from "@/components/static-page"

/**
 * Every address the terminal can show (/, /projects, /projects/<slug>, /about,
 * /achievements) renders this same page. The terminal opens on the tab and
 * project the address names, so that content is in the server HTML for search
 * engines and AI assistants, and clicks inside it change the address without
 * loading another page. Each route adds its own metadata and structured data.
 */
export default function TerminalPage({ jsonLd }: { jsonLd: object[] }) {
  return (
    // No padding on a phone, where the terminal is the page.
    <main className="flex min-h-screen flex-col items-center justify-between max-md:p-0 md:p-8 bg-black">
      {jsonLd.map((data, index) => (
        <JsonLd key={index} data={data} />
      ))}
      <Terminal />
    </main>
  )
}
