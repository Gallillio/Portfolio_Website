import type { Command, CommandResponse } from "@/lib/types"
import { useState, useCallback, useEffect } from "react"
import { availableCommands } from "@/lib/commands"
import { Tooltip } from "@/components/ui/tooltip"

interface TerminalOutputProps {
  history: Array<Command & CommandResponse>
  onCommandClick?: (command: string) => void
}

const TerminalLink = ({ href }: { href: string }) => {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  useEffect(() => {
    // Check if device is mobile/touch screen
    const checkDeviceType = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        ('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0)
      
      const isTabletDevice = isMobileDevice && window.innerWidth >= 768 && window.innerWidth <= 1024
      
      setIsMobile(isMobileDevice && !isTabletDevice)
      setIsTablet(isTabletDevice)
    }

    checkDeviceType()
    window.addEventListener('resize', checkDeviceType)
    return () => window.removeEventListener('resize', checkDeviceType)
  }, [])

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (isMobile || e.ctrlKey) {
      window.open(href, '_blank')
    }
  }, [href, isMobile])

  return (
    <Tooltip text="Follow Link: ctrl + click" isMobile={isMobile} isTablet={isTablet} showTooltip={true}>
      <span 
        className="text-green-400 underline cursor-pointer relative"
        onClick={handleClick}
      >
        {href}
      </span>
    </Tooltip>
  )
}

const CommandLink = ({ command, onClick }: { command: string; onClick: (command: string) => void }) => {
  const handleClick = () => {
    onClick(command)
    
    // Ensure the terminal input is visible after clicking
    setTimeout(() => {
      // Find the terminal input field
      const terminalInput = document.querySelector('input[aria-label="Terminal input"]')
      if (terminalInput instanceof HTMLElement) {
        terminalInput.focus()
        // Scroll to the input field
        terminalInput.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }
    }, 100)
  }

  return (
    <span 
      className="text-green-400 hover:underline cursor-pointer"
      onClick={handleClick}
    >
      {command}
    </span>
  )
}

// Component for tab links (for Projects, Your Achievements, etc.)
const TabLink = ({ tabName, displayName }: { tabName: string; displayName: string }) => {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  useEffect(() => {
    const checkDeviceType = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        ('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0)
      
      const isTabletDevice = isMobileDevice && window.innerWidth >= 768 && window.innerWidth <= 1024
      
      setIsMobile(isMobileDevice && !isTabletDevice)
      setIsTablet(isTabletDevice)
    }

    checkDeviceType()
    window.addEventListener('resize', checkDeviceType)
    return () => window.removeEventListener('resize', checkDeviceType)
  }, [])

  const handleClick = useCallback(() => {
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
          window.postMessage({ type: 'navigate-about-section', sectionId: tabName }, '*')
        } catch (error) {
          console.error(`Error navigating to ${tabName} section:`, error)
        }
        
        // Also try to find and click the tab directly
        setTimeout(() => {
          const sectionTab = document.querySelector(`[value="${tabName}"]`) as HTMLElement
          if (sectionTab) {
            sectionTab.click()
          }
        }, 100)
      }, 200)
    } else {
      // Default behavior for other tabs
      window.dispatchEvent(new CustomEvent('switch-terminal-tab', { detail: { tabName } }))
    }
  }, [tabName])

  return (
    <Tooltip text="Click to switch tab" isMobile={isMobile} isTablet={isTablet} showTooltip={true}>
      <span 
        className="text-green-400 underline cursor-pointer"
        onClick={handleClick}
      >
        {displayName}
      </span>
    </Tooltip>
  )
}

const CVLink = () => {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  useEffect(() => {
    const checkDeviceType = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        ('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0)
      
      const isTabletDevice = isMobileDevice && window.innerWidth >= 768 && window.innerWidth <= 1024
      
      setIsMobile(isMobileDevice && !isTabletDevice)
      setIsTablet(isTabletDevice)
    }

    checkDeviceType()
    window.addEventListener('resize', checkDeviceType)
    return () => window.removeEventListener('resize', checkDeviceType)
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
    <Tooltip text="Download CV: ctrl + click" isMobile={isMobile} isTablet={isTablet} showTooltip={true}>
      <span className="text-green-400 hover:underline cursor-pointer">
        <a
          href="#"
          onClick={handleClick}
          className="text-green-400 underline"
          tabIndex={-1}
        >
          /Ahmed Elzeky Resume.pdf
        </a>
      </span>
    </Tooltip>
  )
}

// Component for email links (for Contact command)
const EmailLink = ({ email }: { email: string }) => {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  
  useEffect(() => {
    const checkDeviceType = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        ('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0)
      
      const isTabletDevice = isMobileDevice && window.innerWidth >= 768 && window.innerWidth <= 1024
      
      setIsMobile(isMobileDevice && !isTabletDevice)
      setIsTablet(isTabletDevice)
    }

    checkDeviceType()
    window.addEventListener('resize', checkDeviceType)
    return () => window.removeEventListener('resize', checkDeviceType)
  }, [])

  const handleClick = () => {
    // Open email client
    window.location.href = `mailto:${email}`;
    
    // Try to get achievements context and trigger achievement
    try {
      // This is a workaround since we can't use hooks directly in this component
      const achievementEvent = new CustomEvent('contact-email-clicked');
      window.dispatchEvent(achievementEvent);
    } catch (error) {
      console.error('Error triggering contact achievement:', error);
    }
  };

  return (
    <Tooltip text="Click to send email" isMobile={isMobile} isTablet={isTablet} showTooltip={true}>
      <span 
        className="text-green-400 underline cursor-pointer"
        onClick={handleClick}
      >
        {email}
      </span>
    </Tooltip>
  );
};

// Component for phone links (for Contact command)
const PhoneLink = ({ phone }: { phone: string }) => {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  
  useEffect(() => {
    const checkDeviceType = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        ('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0)
      
      const isTabletDevice = isMobileDevice && window.innerWidth >= 768 && window.innerWidth <= 1024
      
      setIsMobile(isMobileDevice && !isTabletDevice)
      setIsTablet(isTabletDevice)
    }

    checkDeviceType()
    window.addEventListener('resize', checkDeviceType)
    return () => window.removeEventListener('resize', checkDeviceType)
  }, [])

  const handleClick = () => {
    // Open phone dialer
    window.location.href = `tel:${phone}`;
  };

  return (
    <Tooltip text="Click to call" isMobile={isMobile} isTablet={isTablet} showTooltip={true}>
      <span 
        className="text-green-400 underline cursor-pointer"
        onClick={handleClick}
      >
        {phone}
      </span>
    </Tooltip>
  );
};

export default function TerminalOutput({ history, onCommandClick }: TerminalOutputProps) {
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
            <EmailLink key={`email-${index}`} email={email} />
            {afterText}
          </>
        );
      }
      
      // Check for phone numbers in Contact command
      const phoneMatch = line.match(/\+\d{2}\s\d{10}/);
      if (phoneMatch && phoneMatch.index !== undefined) {
        const [fullMatch] = phoneMatch;
        const beforeText = line.substring(0, phoneMatch.index);
        const afterText = line.substring(phoneMatch.index + fullMatch.length);
        
        return (
          <>
            {beforeText}
            <PhoneLink key={`phone-${index}`} phone={fullMatch} />
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
            <TabLink key={`tab-${index}`} tabName={tabName} displayName={displayName} />
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

