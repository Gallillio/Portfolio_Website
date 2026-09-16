// Minimal markdown renderer for the terminal.
//
// The model emits markdown (**bold**, *italic*, `code`, bullets, ### headings)
// and the terminal used to print it literally, asterisks and all. This turns it
// into styled spans instead.
//
// Deliberately hand-rolled rather than pulling in a markdown library: the
// surface is tiny, it must tolerate PARTIAL input (mid-stream, a "**" may not be
// closed yet), and it must never produce raw HTML. Everything below builds React
// elements, so there is no injection surface.

import React from "react"

const INLINE = /(\*\*[^*\n]+\*\*|(?<![*\w])\*[^*\n]+\*(?!\w)|`[^`\n]+`)/g

/** Bold / italic / code within a single line. Unmatched markers stay literal. */
function renderInline(line: string, keyPrefix: string): React.ReactNode[] {
  const out: React.ReactNode[] = []
  let last = 0
  let i = 0

  for (const match of line.matchAll(INLINE)) {
    const token = match[0]
    const at = match.index ?? 0

    if (at > last) out.push(line.slice(last, at))

    if (token.startsWith("**")) {
      out.push(
        <span key={`${keyPrefix}-b${i}`} className="font-semibold text-white">
          {token.slice(2, -2)}
        </span>
      )
    } else if (token.startsWith("`")) {
      out.push(
        <span key={`${keyPrefix}-c${i}`} className="rounded bg-gray-700/70 px-1 text-cyan-300">
          {token.slice(1, -1)}
        </span>
      )
    } else {
      out.push(
        <span key={`${keyPrefix}-i${i}`} className="italic opacity-80">
          {token.slice(1, -1)}
        </span>
      )
    }

    last = at + token.length
    i++
  }

  if (last < line.length) out.push(line.slice(last))
  return out
}

/**
 * Render markdown-ish assistant text as terminal-styled React nodes.
 * Safe to call on partial text while streaming.
 *
 * `leading` (the "Gallillio Assistant:" label) is folded into the first line so
 * it stays inline with the opening words, as it did before markdown rendering.
 */
export function renderTerminalMarkdown(text: string, leading?: React.ReactNode): React.ReactNode {
  const lines = text.split("\n")

  return lines.map((line, index) => {
    const key = `l${index}`
    const lead = index === 0 ? leading : undefined

    // ### Heading
    const heading = /^(#{1,6})\s+(.*)$/.exec(line)
    if (heading) {
      return (
        <div key={key}>
          {lead}
          <span className="font-semibold text-white">{renderInline(heading[2], key)}</span>
        </div>
      )
    }

    // - bullet  /  * bullet
    const bullet = /^(\s*)[-*]\s+(.*)$/.exec(line)
    if (bullet) {
      return (
        <div key={key}>
          {lead}
          <span className="select-none text-purple-400" style={{ paddingLeft: bullet[1].length * 8 }}>
            •&nbsp;
          </span>
          <span>{renderInline(bullet[2], key)}</span>
        </div>
      )
    }

    // Preserve blank lines as real vertical space.
    if (!line) return <div key={key}>{lead}&nbsp;</div>

    return (
      <div key={key}>
        {lead}
        {renderInline(line, key)}
      </div>
    )
  })
}
