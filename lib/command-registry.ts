import type { CommandResponse } from "./types"

/**
 * Edits between two words, counting a swap of neighbouring letters as one
 * ("porjects"): the optimal string alignment form of Damerau-Levenshtein.
 */
function editDistance(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array<number>(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1)
      }
    }
  }
  return d[a.length][b.length]
}

// Command handler type
type CommandHandler = (args: string[]) => Promise<CommandResponse>

// Command metadata type
interface CommandMetadata {
  description: string
  handler: CommandHandler
  isSecret?: boolean
  aliases?: string[]
}

// Command registry
class CommandRegistry {
  private static instance: CommandRegistry
  private commands: Map<string, CommandMetadata> = new Map()
  private aliases: Map<string, string> = new Map()

  private constructor() {}

  static getInstance(): CommandRegistry {
    if (!CommandRegistry.instance) {
      CommandRegistry.instance = new CommandRegistry()
    }
    return CommandRegistry.instance
  }

  // Register a new command
  register(command: string, description: string, handler: CommandHandler, isSecret: boolean = false, aliases: string[] = []) {
    // Register the main command
    this.commands.set(command.toLowerCase(), { description, handler, isSecret, aliases })
    
    // Register aliases
    aliases.forEach(alias => {
      this.aliases.set(alias.toLowerCase(), command.toLowerCase())
    })
  }

  // Get all registered commands (excluding secret ones)
  getAvailableCommands(): string[] {
    return Array.from(this.commands.entries())
      .filter(([, metadata]) => !metadata.isSecret)
      .map(([command]) => command)
  }

  // Get all commands including secret ones
  getAllCommands(): string[] {
    return Array.from(this.commands.keys())
  }

  // Get command metadata
  getCommand(command: string): CommandMetadata | undefined {
    const normalizedCommand = command.toLowerCase()
    // Check if it's an alias
    const mainCommand = this.aliases.get(normalizedCommand) || normalizedCommand
    return this.commands.get(mainCommand)
  }

  // Execute a command
  async executeCommand(input: string): Promise<CommandResponse> {
    const command = input.trim().toLowerCase()
    const args = command.split(" ")
    const primaryCommand = args[0]

    // Handle empty command
    if (!command) {
      return {
        output: ['Please enter a command. Type "help" for available commands.'],
        isError: true,
        timestamp: new Date(),
      }
    }

    // Get command handler
    const commandData = this.getCommand(primaryCommand)
    if (!commandData) {
      // The suggestion and "help" stand alone between spaces, so the output
      // turns them into commands to tap or click.
      const closest = this.closestCommand(primaryCommand)
      return {
        output: [
          `Command not found: ${command}`,
          ...(closest ? [`Did you mean: ${closest}`] : []),
          "Type help to see all commands.",
        ],
        isError: true,
        timestamp: new Date(),
      }
    }

    // Execute command handler
    return commandData.handler(args)
  }

  /**
   * The public command a mistyped one most likely meant: a unique prefix
   * ("proj"), else the nearest by edit distance with a swapped pair counting as
   * one edit. One edit for words of four letters or fewer, two above, so short
   * input doesn't match everything. Secret commands are never suggested.
   */
  closestCommand(typed: string): string | null {
    if (!typed) return null
    const commands = this.getAvailableCommands()
    const prefixed = commands.filter((cmd) => cmd.startsWith(typed))
    if (prefixed.length === 1) return prefixed[0]

    const limit = typed.length <= 4 ? 1 : 2
    let best: string | null = null
    let bestDistance = limit + 1
    for (const cmd of commands) {
      const distance = editDistance(typed, cmd)
      if (distance < bestDistance) {
        best = cmd
        bestDistance = distance
      }
    }
    return best
  }

  // Get help text for all commands (excluding secret ones)
  getHelpText(): string[] {
    const helpText = ["Available commands \n(type one, or tap or click it to run it):"]
    
    // Sort commands alphabetically (excluding secret ones)
    const sortedCommands = this.getAvailableCommands().sort()
    
    // Check if we're on a mobile device
    const isMobile = typeof window !== 'undefined' && 
      (('ontouchstart' in window) || 
      (navigator.maxTouchPoints > 0) || 
      window.innerWidth < 768 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    
    // Add each command and its description
    sortedCommands.forEach(cmd => {
      const metadata = this.getCommand(cmd)
      if (metadata) {
        if (isMobile) {
          // On mobile, display command and description on separate lines with indentation
          helpText.push(` - ${cmd}`)
          helpText.push(`    ${metadata.description}`)
          helpText.push("")  // Add empty line for spacing
        } else {
          // On desktop, keep the original format with padding
          helpText.push(`  ${cmd.padEnd(20)} - ${metadata.description}`)
        }
      }
    })

    helpText.push("Type any command to see more information.")
    return helpText
  }
}

export const commandRegistry = CommandRegistry.getInstance() 