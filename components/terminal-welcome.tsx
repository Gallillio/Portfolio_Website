"use client"

import React from "react"
import { Download, Github, Linkedin, Mail } from "lucide-react"
import { title, summary, availability, cv, contact } from "@/lib/profile-extras"
import { links } from "@/lib/profile-data"
import { useAchievements } from "@/lib/achievements-context"

interface WelcomeBannerProps {
  /** Puts a command into the input, matching what command links elsewhere do. */
  onRun: (command: string) => void
}

const ENTRIES: { command: string; description: string }[] = [
  { command: "chat", description: "Ask my AI assistant anything about me" },
  { command: "help", description: "See all commands" },
]

const LINK_CLASS =
  "inline-flex items-center gap-1.5 rounded border border-green-500/40 px-2 py-0.5 text-green-300 transition-colors hover:border-green-400 hover:bg-green-500/10 hover:text-green-200"

/**
 * Opening banner. Replaces seven lines of undifferentiated prose with a command
 * list: the two actions that matter first, the explanation dim and secondary.
 *
 * Above the commands sits what a recruiter looks for in the first few seconds:
 * the role, one line of proof, location and work mode, and the CV and profile
 * links, so none of it is hidden behind a tab or a command.
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
      <div className="mt-1 max-w-3xl text-gray-300">{summary}</div>
      <div className="mt-1 text-gray-400">{availability}</div>

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
            <span className="text-gray-400">{description}</span>
          </React.Fragment>
        ))}
      </div>

      <div className="mt-3 text-gray-400">or pick a tab above ↑</div>
    </div>
  )
}
