export interface Command {
  command: string
  timestamp: Date
}

export interface CommandResponse {
  output: React.ReactNode[]
  timestamp: Date
  isError?: boolean
  specialAction?: "switchTab" | "none" | "clear" | "downloadCV" | "chatMode"
  tabName?: string
  timelineSection?: string
  chatMode?: boolean
}

export interface Project {
  title: string
  description: string
  /**
   * Fuller write-up used only for the AI assistant's context (lib/ai/context.ts).
   * The UI keeps rendering `description`; this preserves detail that used to live
   * solely in the old hand-written chatbot context.
   */
  detailedDescription?: string
  /**
   * When the work happened, e.g. "Jul. 2026 - Present". Read only by the AI context
   * so the assistant can answer "what has he built recently"; nothing in the UI
   * parses it, so year-only values are fine here (unlike timeline dates).
   */
  period?: string
  technologies: string[]
  images: { src: string; alt: string }[]
  github?: string
  demo?: string
  demo_available?: boolean
  code_available?: boolean
  inDevelopment?: boolean
  /**
   * Text for the status pill and image badge while `inDevelopment` is set, e.g.
   * "Pre-launch". The card falls back to "In Development".
   */
  statusLabel?: string
  /** Where the project runs, e.g. ["iOS", "Android", "iPadOS"]; shown under the title. */
  platforms?: string[]
  /** Replace the disabled Demo button's label and tooltip, e.g. for an app not yet in a store. */
  demoLabel?: string
  demoTooltip?: string
}


export interface ChatMessage {
  role: "user" | "model"
  content: string
}
