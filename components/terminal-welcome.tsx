"use client"

import React from "react"
import { Download, Github, Linkedin, Mail } from "lucide-react"
import { title, cv, contact } from "@/lib/profile-extras"
import { links } from "@/lib/profile-data"
import { useAchievements } from "@/lib/achievements-context"

interface WelcomeBannerProps {
  /** Types a command into the prompt and runs it, as command links elsewhere do. */
  onRun: (command: string) => void
}

const ENTRIES: { command: string; description: string }[] = [
  { command: "chat", description: "Ask my AI assistant anything about me" },
  { command: "help", description: "See all commands" },
]

// Finger-sized on touch screens (Apple's 44pt), the slim terminal look with a mouse.
const LINK_CLASS =
  "inline-flex items-center gap-1.5 rounded border border-green-500/40 px-2 py-0.5 text-green-300 transition-colors hover:border-green-400 hover:bg-green-500/10 hover:text-green-200 coarse:min-h-[44px] coarse:px-3 coarse:text-sm active:bg-green-500/10"

/**
 * Opening banner. Replaces seven lines of undifferentiated prose with a command
 * list: the two actions that matter first, the explanation dim and secondary.
 *
 * Above the commands sits what a recruiter looks for in the first few seconds:
 * the role and the CV and profile links, so none of it is hidden behind a tab
 * or a command.
 *
 * Rendered as JSX rather than strings because TerminalOutput.renderLine applies
 * mutually exclusive, early-returning rules — a <status> tag used to dim the
 * description would suppress the command linkification on the same line, so
 * "bright clickable command + dim description" is not expressible as a string.
 */
export default function WelcomeBanner({ onRun }: WelcomeBannerProps) {
  const { downloadCV } = useAchievements()

  return (
    <div className="font-mono text-sm">
      {/* The page's only h1: the name and role are what search engines should read first. */}
      <h1>
        <span className="font-semibold text-white">Ahmed Galal Elzeky</span>
        <span className="text-gray-400"> · {title}</span>
      </h1>

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <a
          href={cv.path}
          target="_blank"
          rel="noopener noreferrer"
          download={cv.downloadName}
          onClick={() => downloadCV()}
          className={LINK_CLASS}
        >
          <Download size={13} aria-hidden="true" />
          CV
        </a>
        <a href={links.linkedin} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
          <Linkedin size={13} aria-hidden="true" />
          LinkedIn
        </a>
        <a href={links.github} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
          <Github size={13} aria-hidden="true" />
          GitHub
        </a>
        <a href={`mailto:${contact.email}`} className={LINK_CLASS}>
          <Mail size={13} aria-hidden="true" />
          Email
        </a>
      </div>

      {/* Grid rather than space-padded columns: padding wraps raggedly on narrow screens. */}
      {/* On touch screens each row is one 44px button, command and description
          together, so the whole line takes the tap. */}
      <div className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 coarse:gap-y-0">
        {ENTRIES.map(({ command, description }) => (
          <button
            key={command}
            type="button"
            onClick={(event) => {
              // Not up to the output, whose click focuses the prompt.
              event.stopPropagation()
              onRun(command)
            }}
            className="group col-span-2 grid cursor-pointer grid-cols-subgrid items-center text-left coarse:min-h-[44px] coarse:active:bg-green-500/10"
          >
            <span className="text-green-300 group-hover:text-green-200 group-hover:underline coarse:underline coarse:decoration-green-500/50 underline-offset-4">{command}</span>
            <span className="text-gray-400">{description}</span>
          </button>
        ))}
      </div>

      {/* Phones have the sections in the bar along the bottom; larger screens in the tabs. */}
      <div className="mt-3 text-gray-400">
        <span className="md:hidden">or pick a section below ↓</span>
        <span className="hidden md:inline">or pick a tab above ↑</span>
      </div>
    </div>
  )
}
