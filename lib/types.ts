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
  technologies: string[]
  images: { src: string; alt: string }[]
  github?: string
  demo?: string
  demo_available?: boolean
  code_available?: boolean
  inDevelopment?: boolean
}


export interface ChatMessage {
  role: "user" | "model"
  content: string
}
