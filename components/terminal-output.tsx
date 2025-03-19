import type { Command, CommandResponse } from "@/lib/types"
import { useState, useCallback, useEffect } from "react"
import { availableCommands } from "@/lib/commands"

interface TerminalOutputProps {
  history: Array<Command & CommandResponse>
  onCommandClick?: (command: string) => void
}

const TerminalLink = ({ href }: { href: string }) => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if device is mobile/touch screen
    const checkMobile = () => {
      setIsMobile(
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        ('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0)
      )
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (isMobile || e.ctrlKey) {
      window.open(href, '_blank')
    }
  }, [href, isMobile])

  return (
    <span 
      className="text-green-400 underline cursor-pointer relative"
      onClick={handleClick}
    >
      {href}
    </span>
  )
}

const CommandLink = ({ command, onClick }: { command: string; onClick: (command: string) => void }) => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        ('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0)
      )
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <span 
      className="text-green-400 hover:underline cursor-pointer relative group"
      onClick={() => onClick(command)}
    >
      {command}
      {!isMobile && (
        <span className="absolute left-0 -top-6 bg-gray-900 text-green-400 text-xs px-2 py-1 rounded border border-green-500 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          Click to add command to input
        </span>
      )}
    </span>
  )
}

const CVLink = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        ('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0)
      )
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault()
    if (isMobile || event.ctrlKey) {
      const link = document.createElement('a')
      link.href = "/Ahmed Elzeky Resume.pdf"
      link.download = "Ahmed Elzeky Resume.pdf"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <span className="text-green-400 hover:underline cursor-pointer relative group">
      <a
        href="#"
        onClick={handleClick}
        className="text-green-400 underline"
        tabIndex={-1}
      >
        /Ahmed Elzeky Resume.pdf
      </a>
      {!isMobile && (
        <span className="absolute left-0 -top-6 bg-gray-900 text-green-400 text-xs px-2 py-1 rounded border border-green-500 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          Download (ctrl + click)
        </span>
      )}
    </span>
  )
}

export default function TerminalOutput({ history, onCommandClick }: TerminalOutputProps) {
  const renderLine = (line: React.ReactNode, index: number) => {
    if (typeof line === 'string') {
      // Handle URLs that might be prefixed with box drawing characters
      const urlMatch = line.match(/\│\s*(https?:\/\/[^\s]+)/)
      if (urlMatch) {
        return (
          <>
            {line.substring(0, urlMatch.index)}
            <TerminalLink key={index} href={urlMatch[1]} />
          </>
        )
      }

      // Handle URLs without prefix
      if (line.startsWith('http') || line.startsWith('https')) {
        return <TerminalLink key={index} href={line} />
      }

      // Handle CV download link
      if (line === "/Ahmed Elzeky Resume.pdf") {
        return <CVLink key={index} />
      }

      // Handle commands in help text
      const parts = line.split(/(\s+)/)
      
      return parts.map((part, index) => {
        const trimmedPart = part.trim()
        if (availableCommands.includes(trimmedPart.toLowerCase() as typeof availableCommands[number]) && onCommandClick) {
          return <CommandLink key={index} command={trimmedPart} onClick={onCommandClick} />
        }
        return part
      })
    }

    return line
  }

  return (
    <div className="space-y-4">
      {history.map((item, index) => (
        <div key={index} className="font-mono">
          {item.command && (
            <div className="flex items-center">
              <span className="text-green-500 mr-1">$</span>
              <span className="text-green-300">{item.command}</span>
            </div>
          )}
          <div className={`mt-1 whitespace-pre-wrap ${item.isError ? "text-red-500" : "text-green-400"}`}>
            {item.output.map((line, lineIndex) => (
              <div key={lineIndex}>{renderLine(line, index)}</div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

