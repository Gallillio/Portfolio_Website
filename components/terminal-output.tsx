import type { Command, CommandResponse } from "@/lib/types"
import { useCallback } from "react"
import { availableCommands } from "@/lib/commands"
import { cv } from "@/lib/profile-extras"
import { Tooltip } from "@/components/ui/tooltip"
import { COARSE_POINTER, useMediaQuery } from "@/lib/media"

interface TerminalOutputProps {
  history: Array<Command & CommandResponse>
  onCommandClick?: (command: string) => void
  isChatMode?: boolean
}

const linkColor = (isChatMode?: boolean) => (isChatMode ? "text-blue-400" : "text-green-400")

// The ╔═╗ ║ title ║ ╚═╝ headings and └─── rules that box command output. They
// must keep their width to line up, so they shrink to fit a narrow phone
// (.terminal-frame in globals.css) rather than wrap or push the page sideways.
const isFrameLine = (line: React.ReactNode) => typeof line === "string" && /^[╔║╚└]/.test(line)

/**
 * A click anywhere in the output focuses the prompt, so with a mouse a link
 * follows on ctrl or cmd click, as links in a terminal do, and says so in a
 * tooltip. A tap follows it straight away: a touch screen has neither the key
 * nor the hover. Before, iPads (touch, 768-1024px) got the mouse rules and no
 * tap did anything.
 */
function useFollowOnModifier() {
  const touch = useMediaQuery(COARSE_POINTER)
  const onClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (!touch && !event.ctrlKey && !event.metaKey) event.preventDefault()
    },
    [touch]
  )
  return { touch, onClick }
}

const TerminalLink = ({ href, isChatMode }: { href: string; isChatMode?: boolean }) => {
  const { touch, onClick } = useFollowOnModifier()
  return (
    <Tooltip text="Follow Link: ctrl + click" showTooltip={!touch}>
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} className={`underline cursor-pointer relative break-all ${linkColor(isChatMode)}`}>
        {href}
      </a>
    </Tooltip>
  )
}

const CommandLink = ({ command, onClick, isChatMode }: { command: string; onClick: (command: string) => void; isChatMode?: boolean }) => {
  // Command words in a chat reply are prose, not links.
  if (isChatMode) return <span className="text-gray-300">{command}</span>

  // A real button, so it can be reached with the keyboard. It runs the command;
  // stopPropagation keeps the output's click-to-focus from opening the keyboard
  // on a phone. Underlined on touch screens, where there is no hover to show it.
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation()
        onClick(command)
      }}
      className="touch-hit cursor-pointer text-green-300 underline-offset-4 hover:text-green-200 hover:underline coarse:underline coarse:decoration-green-500/50"
    >
      {command}
    </button>
  )
}

// Component for tab links (for Projects, Your Achievements, etc.)
const TabLink = ({ tabName, displayName, isChatMode }: { tabName: string; displayName: string; isChatMode?: boolean }) => {
  const touch = useMediaQuery(COARSE_POINTER)

  const handleClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation()
    // List of about section tabs that need special handling
    const aboutSectionTabs = ['experience', 'skills', 'education', 'freelance', 'courses']

    // Check if this is an about section tab
    if (aboutSectionTabs.includes(tabName)) {
      // Switch to the about tab
      window.dispatchEvent(new CustomEvent('switch-terminal-tab', { detail: { tabName: 'about' } }))

      // After a small delay to ensure the about tab is loaded, switch to the specific section
      setTimeout(() => {
        // Try to use postMessage to communicate with the inner tab
        try {
          window.postMessage({
            type: 'navigate-about-section',
            sectionId: tabName,
            shouldScrollToNav: true  // Add flag to indicate scrolling to navbar
          }, '*')
        } catch (error) {
          console.error(`Error navigating to ${tabName} section:`, error)
        }

        // Also try to find and click the tab directly
        setTimeout(() => {
          const sectionTab = document.querySelector(`[value="${tabName}"]`) as HTMLElement
          if (sectionTab) {
            sectionTab.click()

            // Remove direct scrolling from here as it's now handled in the About component
          }
        }, 100)
      }, 200)
    } else {
      // Default behavior for other tabs
      window.dispatchEvent(new CustomEvent('switch-terminal-tab', { detail: { tabName } }))
    }
  }, [tabName])

  return (
    <Tooltip text="Click to switch tab" showTooltip={!touch}>
      <button type="button" className={`touch-hit underline cursor-pointer ${linkColor(isChatMode)}`} onClick={handleClick}>
        {displayName}
      </button>
    </Tooltip>
  )
}

const CVLink = ({ isChatMode }: { isChatMode?: boolean }) => {
  const { touch, onClick } = useFollowOnModifier()
  return (
    <Tooltip text="Download CV: ctrl + click" showTooltip={!touch}>
      <a href={cv.path} download={cv.downloadName} onClick={onClick} className={`underline cursor-pointer ${linkColor(isChatMode)}`}>
        {cv.path}
      </a>
    </Tooltip>
  )
}

// Component for email links (for Contact command)
const EmailLink = ({ email, isChatMode }: { email: string; isChatMode?: boolean }) => {
  const touch = useMediaQuery(COARSE_POINTER)

  // The achievement context isn't reachable from here, so the terminal hears
  // about the click through an event and unlocks it.
  const handleClick = () => {
    window.dispatchEvent(new CustomEvent('contact-email-clicked'))
  }

  return (
    <Tooltip text="Click to send email" showTooltip={!touch}>
      <a href={`mailto:${email}`} onClick={handleClick} className={`underline cursor-pointer break-all ${linkColor(isChatMode)}`}>
        {email}
      </a>
    </Tooltip>
  )
}

// Component for phone links (for Contact command)
const PhoneLink = ({ phone, isChatMode }: { phone: string; isChatMode?: boolean }) => {
  const touch = useMediaQuery(COARSE_POINTER)
  return (
    <Tooltip text="Click to call" showTooltip={!touch}>
      {/* tel: URIs must not contain the display spacing */}
      <a href={`tel:${phone.replace(/\s+/g, "")}`} className={`underline cursor-pointer ${linkColor(isChatMode)}`}>
        {phone}
      </a>
    </Tooltip>
  )
}

export default function TerminalOutput({ history, onCommandClick, isChatMode = false }: TerminalOutputProps) {
  const renderLine = (line: React.ReactNode, index: number) => {
    if (typeof line === 'string') {
      // Check for email tags <email>...</email>
      const emailMatch = line.match(/<email>(.*?)<\/email>/);
      if (emailMatch) {
        const [fullMatch, email] = emailMatch;
        const beforeText = line.substring(0, line.indexOf(fullMatch));
        const afterText = line.substring(line.indexOf(fullMatch) + fullMatch.length);
        
        return (
          <>
            {beforeText}
            <EmailLink key={`email-${index}`} email={email} isChatMode={isChatMode} />
            {afterText}
          </>
        );
      }
      
      // Check for phone numbers in Contact command
      // Accepts grouped formats such as "+20 111 033 3933" as well as "+20 1110333933"
      const phoneMatch = line.match(/\+\d{1,3}(?:\s?\d){8,12}/);
      if (phoneMatch && phoneMatch.index !== undefined) {
        const [fullMatch] = phoneMatch;
        const beforeText = line.substring(0, phoneMatch.index);
        const afterText = line.substring(phoneMatch.index + fullMatch.length);
        
        return (
          <>
            {beforeText}
            <PhoneLink key={`phone-${index}`} phone={fullMatch} isChatMode={isChatMode} />
            {afterText}
          </>
        );
      }
      
      // Check for status tags <status class="...">...</status>
      const statusMatch = line.match(/<status class="(.*?)">(.*?)<\/status>/);
      if (statusMatch) {
        const [fullMatch, className, status] = statusMatch;
        const beforeText = line.substring(0, line.indexOf(fullMatch));
        const afterText = line.substring(line.indexOf(fullMatch) + fullMatch.length);
        
        return (
          <>
            {beforeText}
            <span key={`status-${index}`} className={className}>
              {status}
            </span>
            {afterText}
          </>
        );
      }

      // Check for tab navigation patterns like "go to projects" or "click on your-achievements"
      const tabNavigationMatch = line.match(/(?:go to|click on) (projects|your-achievements|about|contact|my-achievements|experience|skills|education|freelance|courses)/i)
      if (tabNavigationMatch && tabNavigationMatch.index !== undefined) {
        const tabName = tabNavigationMatch[1].toLowerCase()
        const displayName = tabName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        
        const beforeText = line.substring(0, tabNavigationMatch.index)
        const afterText = line.substring(tabNavigationMatch.index + tabNavigationMatch[0].length)
        
        return (
          <>
            {beforeText}
            <TabLink key={`tab-${index}`} tabName={tabName} displayName={displayName} isChatMode={isChatMode} />
            {afterText}
          </>
        )
      }

      // Handle URLs that might be prefixed with box drawing characters
      const urlMatch = line.match(/\│\s*(https?:\/\/[^\s]+)/)
      if (urlMatch) {
        return (
          <>
            {line.substring(0, urlMatch.index)}
            <TerminalLink key={index} href={urlMatch[1]} isChatMode={isChatMode} />
          </>
        )
      }

      // Handle URLs without prefix
      if (line.startsWith('http') || line.startsWith('https')) {
        return <TerminalLink key={index} href={line} isChatMode={isChatMode} />
      }

      // Handle CV download link
      if (line === cv.path) {
        return <CVLink isChatMode={isChatMode} />
      }

      // Box content lines ("│  ...") carry prose from the profile data; linking every
      // word that happens to be a command name ("about", "freelance", "chat") there
      // produces stray links. Command links belong to help and hint lines only.
      if (line.startsWith("│")) {
        return line
      }

      // Handle commands in help text
      const parts = line.split(/(\s+)/)
      
      return parts.map((part, index) => {
        const trimmedPart = part.trim()
        if (availableCommands.includes(trimmedPart.toLowerCase() as typeof availableCommands[number]) && onCommandClick) {
          return <CommandLink key={index} command={trimmedPart} onClick={onCommandClick} isChatMode={isChatMode} />
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
            <div className="flex items-start">
              <span className="text-green-500 mr-1">$</span>
              {/* dir="auto": an Arabic message reads right-to-left, with its
                  punctuation in place, while the $ stays on the left. */}
              <span dir="auto" className="text-green-300 whitespace-pre-wrap">{item.command}</span>
            </div>
          )}
          <div className={`mt-1 whitespace-pre-wrap ${item.isError ? "text-red-500" : "text-green-400"}`}>
            {/* Check if this is a chat response (no command but has output) */}
            {!item.command && item.output.length > 0 && 
              item.output[0] !== "Processing your request..." && 
              typeof item.output[0] !== 'object' && // Don't show AI: for components like AsciiArt
              isChatMode && (
              <div className="flex items-start mb-1">
                <span className="text-blue-400 mr-2 font-bold">AI:</span>
              </div>
            )}
            {item.output.map((line, lineIndex) => (
              <div key={lineIndex} className={isFrameLine(line) ? "terminal-frame" : undefined}>{renderLine(line, index)}</div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

