"use client"

import React from "react"
import { title } from "@/lib/profile-extras"

interface WelcomeBannerProps {
  /** Puts a command into the input, matching what command links elsewhere do. */
  onRun: (command: string) => void
}

const ENTRIES: { command: string; description: string }[] = [
  { command: "chat", description: "Ask my AI assistant anything about me" },
  { command: "help", description: "See all commands" },
]

/**
 * Opening banner. Replaces seven lines of undifferentiated prose with a command
 * list: the two actions that matter first, the explanation dim and secondary.
 *
 * Rendered as JSX rather than strings because TerminalOutput.renderLine applies
 * mutually exclusive, early-returning rules — a <status> tag used to dim the
 * description would suppress the command linkification on the same line, so
 * "bright clickable command + dim description" is not expressible as a string.
 */
export default function WelcomeBanner({ onRun }: WelcomeBannerProps) {
  return (
    <div className="font-mono text-sm">
      <div>
        <span className="font-semibold text-white">Ahmed Galal Elzeky</span>
        <span className="text-gray-500"> · {title}</span>
      </div>

      {/* Grid rather than space-padded columns: padding wraps raggedly on narrow screens. */}
      <div className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
        {ENTRIES.map(({ command, description }) => (
          <React.Fragment key={command}>
            <button
              type="button"
              onClick={() => onRun(command)}
              className="cursor-pointer text-left text-green-300 hover:text-green-200 hover:underline"
            >
              {command}
            </button>
            <span className="text-gray-500">{description}</span>
          </React.Fragment>
        ))}
      </div>

      <div className="mt-3 text-gray-500">or pick a tab above ↑</div>
    </div>
  )
}
