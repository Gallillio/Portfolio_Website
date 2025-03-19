import type { CommandResponse } from "./types"

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
      return {
        output: [`Command not found: ${command}`, 'Type "help" to see available commands.'],
        isError: true,
        timestamp: new Date(),
      }
    }

    // Execute command handler
    return commandData.handler(args)
  }

  // Get help text for all commands (excluding secret ones)
  getHelpText(): string[] {
    const helpText = ["Available commands:"]
    
    // Sort commands alphabetically (excluding secret ones)
    const sortedCommands = this.getAvailableCommands().sort()
    
    // Add each command and its description
    sortedCommands.forEach(cmd => {
      const metadata = this.getCommand(cmd)
      if (metadata) {
        helpText.push(`  ${cmd.padEnd(20)} - ${metadata.description}`)
      }
    })

    helpText.push("", "Type any command to see more information.")
    return helpText
  }
}

export const commandRegistry = CommandRegistry.getInstance() 