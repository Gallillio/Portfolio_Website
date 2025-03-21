export interface Command {
  command: string
  timestamp: Date
}

export interface CommandResponse {
  output: React.ReactNode[]
  timestamp: Date
  isError?: boolean
  specialAction?: "switchTab" | "none" | "clear" | "downloadCV"
  tabName?: string
}

export interface Project {
  title: string
  description: string
  technologies: string[]
  images: { src: string; alt: string }[]
  github?: string
  demo?: string
  demo_available?: boolean
  codeAvailable?: boolean
}

