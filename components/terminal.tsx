"use client"

import { useState, useEffect, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TerminalInput, { TerminalInputRef } from "./terminal-input"
import TerminalOutput from "./terminal-output"
import Projects from "./projects"
import Contact from "./contact"
import About from "./about"
import AsciiArt from "./ascii-art"
import MyAchievements from "./my-achievements"
import YourAchievements from "./your-achievements"
import AchievementNotification from "./achievement-notification"
import { executeCommand } from "@/lib/commands"
import { Maximize2, Minimize2 } from "lucide-react"
import { AchievementsProvider, useAchievements } from "@/lib/achievements-context"
import type { Command } from '@/lib/types'

function TerminalContent() {
  const [history, setHistory] = useState<Array<{ command: string; output: React.ReactNode[]; timestamp: Date; isError: boolean }>>([])
  const [activeTab, setActiveTab] = useState<string>("terminal")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [animationClass, setAnimationClass] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [secretJokeRevealed, setSecretJokeRevealed] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const terminalRef = useRef<HTMLDivElement>(null)
  const outputEndRef = useRef<HTMLDivElement>(null)
  const terminalInputRef = useRef<TerminalInputRef>(null)
  const { 
    lastUnlockedAchievement, 
    clearLastUnlockedAchievement, 
    executeSecretCommand,
    markCommandExecuted,
    downloadCV
  } = useAchievements()

  // Initial setup on component mount
  useEffect(() => {
    // Set initial mobile state and fullscreen
    const initialIsMobile = window.innerWidth < 768
    setIsMobile(initialIsMobile)

    // Load saved tab from localStorage after initial render
    const savedTab = localStorage.getItem('terminalActiveTab');
    const validTabs = ['terminal', 'projects', 'about', 'contact', 'my-achievements', 'your-achievements'];
    if (savedTab && validTabs.includes(savedTab)) {
      setActiveTab(savedTab);
    }
  }, [])

  // Add listener for custom tab switching events from other components
  useEffect(() => {
    const handleTabSwitch = (event: Event) => {
      console.log('Terminal received switch-terminal-tab event');
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.tabName) {
        console.log('Switching to tab:', customEvent.detail.tabName);
        setActiveTab(customEvent.detail.tabName);
      }
    };

    // Listen for custom events
    window.addEventListener('switch-terminal-tab', handleTabSwitch);
    
    // Listen for postMessage events
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'switch-tab' && event.data.tabName) {
        console.log('Terminal received postMessage to switch tab:', event.data.tabName);
        setActiveTab(event.data.tabName);
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('switch-terminal-tab', handleTabSwitch);
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Check if we're on a mobile device and handle responsive behavior
  useEffect(() => {
    const checkIfMobile = () => {
      const isMobileNow = window.innerWidth < 768
      setIsMobile(isMobileNow)
      
      // We no longer set fullscreen automatically on mobile transition
    }
    
    // Initial check
    checkIfMobile()
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile)
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIfMobile)
    }
  }, [isMobile])

  const initializeTerminal = () => {
    // Initial welcome message
    setHistory([
      {
        command: "",
        output: [
          <AsciiArt key="ascii-art" />,
          "Welcome to my interactive portfolio terminal!",
          'Type "help" to see available commands.',
          "",
        ],
        timestamp: new Date(),
        isError: false,
      },
    ])
  }

  useEffect(() => {
    initializeTerminal()
  }, [])

  useEffect(() => {
    // Scroll to bottom when history changes
    outputEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [history])

  const handleCommand = async (input: string) => {
    const trimmedInput = input.trim()

    // Check for secret commands
    if (trimmedInput.toLowerCase() === "hello") {
      executeSecretCommand("hello")
    }

    // Track command execution for achievements
    markCommandExecuted()

    // Add command to history
    const newCommand: Command = {
      command: trimmedInput,
      timestamp: new Date(),
    }

    // Execute command and get response from commands module (not from achievements)
    const response = await executeCommand(trimmedInput)

    // Special handling for tab switching commands
    if (response.specialAction === "switchTab" && response.tabName) {
      setActiveTab(response.tabName)
    }
    // Special handling for clear command
    else if (response.specialAction === "clear") {
      initializeTerminal()
      return // Don't add to history
    }
    // Special handling for CV download
    else if (response.specialAction === "downloadCV") {
      const link = document.createElement('a')
      link.href = '/Ahmed Elzeky Resume.pdf'
      link.download = 'Ahmed Elzeky Resume.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      downloadCV()
    }

    // Add command and response to history
    setHistory((prev) => [...prev, { ...newCommand, ...response, isError: response.isError ?? false }])
  }

  const toggleFullscreen = () => {
    // Allow toggle fullscreen on mobile as well
    if (isFullscreen) {
      setAnimationClass("animate-contract")
    } else {
      setAnimationClass("animate-expand")
    }
    setIsFullscreen(!isFullscreen)
    // If terminal was minimized, restore it when going fullscreen
    if (isMinimized) {
      setIsMinimized(false)
    }
  }

  const handleMinimize = () => {
    // Only minimize if not already minimized
    if (!isMinimized) {
      setIsMinimized(true)
      // If in fullscreen, exit fullscreen first
      if (isFullscreen) {
        setIsFullscreen(false)
        setAnimationClass("animate-contract")
      }
    }
  }

  const handleClose = () => {
    // Instead of showing confirmation dialog, show joke page
    setIsClosing(true)
    // If in fullscreen, exit fullscreen first
    if (isFullscreen) {
      setIsFullscreen(false)
      setAnimationClass("animate-contract")
    }
    // Pretend to track this as an achievement
    setTimeout(() => {
      executeSecretCommand("closed");
    }, 500);
  }

  const handleRestore = () => {
    setIsMinimized(false)
    setIsClosing(false)
  }

  // Reset animation class after animation completes
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationClass("")
    }, 700) // Match the animation duration
    return () => clearTimeout(timer)
  }, [animationClass])

  // Prevent body scrolling in fullscreen mode
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isFullscreen])

  const focusInput = () => {
    terminalInputRef.current?.focus()
  }

  // Add effect to focus input when terminal tab is selected
  useEffect(() => {
    if (activeTab === "terminal") {
      // Add a small delay to ensure the tab content is rendered
      setTimeout(() => {
        focusInput()
      }, 0)
    }
    
    // When navigating to the about tab, don't reset its internal state
    // The About component will load the saved state from localStorage
    
    // Save the current active main tab to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('terminalActiveTab', activeTab);
    }
  }, [activeTab])

  const handleNavigateToAchievements = () => {
    setActiveTab("your-achievements")
    clearLastUnlockedAchievement()
  }

  const handleCommandClick = (command: string) => {
    if (terminalInputRef.current) {
      terminalInputRef.current.setValue(command)
      terminalInputRef.current.focus()
    }
  }

  // Determine the terminal height based on fullscreen status
  const contentHeight = isFullscreen 
    ? "h-[calc(100vh-82px)]" 
    : isMobile 
      ? "h-[calc(100vh-100px)]" 
      : "h-[70vh]";

  // Add new function for revealing the secret joke
  const handleSecretClick = () => {
    setSecretJokeRevealed(true);
    // Pretend to mark this as an achievement too
    setTimeout(() => {
      executeSecretCommand("minimized");
    }, 500);
  };

  return (
    <>
      <div
        ref={terminalRef}
        className={`bg-black border border-green-500 overflow-hidden transition-all duration-700 ease-in-out transform-gpu 
          ${isFullscreen 
            ? 'fixed inset-0 z-50 max-w-none rounded-none border-green-400' 
            : isMobile 
              ? 'fixed inset-4 z-50 rounded-md shadow-xl shadow-green-500/30' 
              : 'w-full max-w-5xl rounded-md relative shadow-xl shadow-green-500/30 hover:shadow-2xl hover:shadow-green-500/50'
          } ${animationClass} ${isMinimized || isClosing ? 'h-10 overflow-hidden' : ''}`}
        style={{
          transitionProperty: "all",
          transitionDuration: "700ms",
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)"
        }}
      >
        <div className="flex items-center justify-between bg-gray-900 px-4 py-2 border-b border-green-500 cursor-default">
          <div className="flex space-x-2">
            {/* Close button */}
            <button 
              className="group relative w-3 h-3 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
              onClick={handleClose}
              aria-label="Close terminal"
            >
              <div className="w-3 h-3 rounded-full bg-red-500 group-hover:bg-red-600 transition-all duration-200 group-hover:shadow-[0_0_3px_rgba(239,68,68,0.7)]"></div>
              {/* X icon that appears on hover */}
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 drop-shadow-[0_0_1px_rgba(255,255,255,0.7)]"
                width="10" 
                height="10" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="white" 
                strokeWidth="4" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            {/* Minimize button */}
            <button 
              className="group relative w-3 h-3 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
              onClick={handleMinimize}
              aria-label="Minimize terminal"
            >
              <div className="w-3 h-3 rounded-full bg-yellow-500 group-hover:bg-yellow-600 transition-all duration-200 group-hover:shadow-[0_0_3px_rgba(234,179,8,0.7)]"></div>
              {/* Minimize icon that appears on hover */}
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 drop-shadow-[0_0_1px_rgba(255,255,255,0.7)]"
                width="10" 
                height="10" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="white" 
                strokeWidth="4" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            
            {/* Maximize/restore button */}
            <button 
              className="group relative w-3 h-3 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
              onClick={isMinimized ? handleRestore : (!isMobile ? toggleFullscreen : undefined)}
              aria-label={isFullscreen ? "Exit fullscreen" : (isMinimized ? "Restore" : "Enter fullscreen")}
            >
              <div className="w-3 h-3 rounded-full bg-green-500 group-hover:bg-green-600 transition-all duration-200 group-hover:shadow-[0_0_3px_rgba(34,197,94,0.7)]"></div>
              {/* Maximize/restore icon that appears on hover */}
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 drop-shadow-[0_0_1px_rgba(255,255,255,0.7)]"
                width="10" 
                height="10" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="white" 
                strokeWidth="4" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                {isMinimized ? (
                  // Show + icon for restore from minimized
                  <>
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </>
                ) : isFullscreen ? (
                  // Show minimize icon for exit fullscreen
                  <>
                    <polyline points="4 14 10 14 10 20"></polyline>
                    <polyline points="20 10 14 10 14 4"></polyline>
                    <line x1="14" y1="10" x2="21" y2="3"></line>
                    <line x1="3" y1="21" x2="10" y2="14"></line>
                  </>
                ) : (
                  // Show maximize icon for enter fullscreen
                  <>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <polyline points="9 21 3 21 3 15"></polyline>
                    <line x1="21" y1="3" x2="14" y2="10"></line>
                    <line x1="3" y1="21" x2="10" y2="14"></line>
                  </>
                )}
              </svg>
            </button>
          </div>
          <div 
            className="text-green-500 font-mono text-sm"
            onDoubleClick={isMinimized ? handleRestore : undefined}
          >
            portfolio@Gallillio:~
          </div>
          {!isMobile && !isMinimized && (
            <button 
              onClick={toggleFullscreen} 
              className="text-green-500 hover:text-green-400"
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          )}
        </div>

        {!isMinimized && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="bg-gray-900 border-b border-green-500 w-full flex justify-between rounded-none overflow-x-auto">
              <TabsList className="bg-transparent border-none rounded-none h-auto">
                <TabsTrigger
                  value="terminal"
                  className="custom-tab data-[state=active]:bg-black data-[state=active]:text-green-500 rounded-none border-r border-green-500"
                >
                  Terminal
                </TabsTrigger>
                <TabsTrigger
                  value="projects"
                  className="custom-tab data-[state=active]:bg-black data-[state=active]:text-green-500 rounded-none border-r border-green-500"
                >
                  Projects
                </TabsTrigger>
                <TabsTrigger
                  value="about"
                  className="custom-tab data-[state=active]:bg-black data-[state=active]:text-green-500 rounded-none border-r border-green-500"
                >
                  {isMobile ? "About" : "About / Experience"}
                </TabsTrigger>
                <TabsTrigger
                  value="contact"
                  className="custom-tab data-[state=active]:bg-black data-[state=active]:text-green-500 rounded-none border-r border-green-500"
                >
                  {isMobile ? "Contact" : "Contact / CV"}
                </TabsTrigger>
                <TabsTrigger
                  value="my-achievements"
                  className="custom-tab data-[state=active]:bg-black data-[state=active]:text-green-500 rounded-none border-r border-green-500"
                >
                  {isMobile ? "My Achiev." : "My Achievements / Publications"}
                </TabsTrigger>
              </TabsList>
              <TabsList className="bg-transparent border-none rounded-none h-auto ml-auto flex-grow">
                <TabsTrigger
                  value="your-achievements"
                  className="custom-tab data-[state=active]:bg-black data-[state=active]:text-green-500 rounded-none w-full flex justify-end pr-6"
                >
                  {isMobile ? "Your Achiev." : "Your Achievements"}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="terminal" className="p-0 m-0">
              <div
                className={`${contentHeight} overflow-y-auto overflow-x-auto bg-black p-4 font-mono text-green-500 cursor-text custom-scrollbar transition-height duration-700 ease-in-out`}
                onClick={focusInput}
              >
                <TerminalOutput history={history} onCommandClick={handleCommandClick} />
                <div ref={outputEndRef} />
                <TerminalInput ref={terminalInputRef} onCommand={handleCommand} />
              </div>
            </TabsContent>

            <TabsContent value="projects" className="p-0 m-0">
              <div className={`${contentHeight} overflow-y-auto transition-height duration-700 ease-in-out`}>
                <Projects />
              </div>
            </TabsContent>

            <TabsContent value="about" className="p-0 m-0">
              <div className={`${contentHeight} overflow-y-auto transition-height duration-700 ease-in-out`}>
                <About />
              </div>
            </TabsContent>

            <TabsContent value="contact" className="p-0 m-0">
              <div className={`${contentHeight} overflow-y-auto transition-height duration-700 ease-in-out`}>
                <Contact />
              </div>
            </TabsContent>

            <TabsContent value="my-achievements" className="p-0 m-0">
              <div className={`${contentHeight} overflow-y-auto transition-height duration-700 ease-in-out`}>
                <MyAchievements />
              </div>
            </TabsContent>

            <TabsContent value="your-achievements" className="p-0 m-0">
              <div className={`${contentHeight} overflow-y-auto transition-height duration-700 ease-in-out`}>
                <YourAchievements />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {(isMinimized || isClosing) && (
        <div className="fixed inset-4 z-40 bg-black border border-green-500 rounded-md p-6 flex flex-col justify-center items-center text-center shadow-lg shadow-green-500/30 font-mono">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl text-green-400 font-bold">
              {isClosing ? "Terminal Closed" : "Terminal Minimized"}
            </h2>
            
            <div className="py-4 space-y-4 text-green-300">
              <p>
                {isClosing 
                  ? "You tried to close the terminal, but I couldn't let you go that easily!" 
                  : "You've found the secret minimized terminal screen!"}
              </p>
              <p>
                {isClosing 
                  ? "Instead of saying goodbye, let's hang out in this meta-space..." 
                  : "This is the digital equivalent of looking under the rug..."}
              </p>
              
              <div className="border-t border-b border-green-500/30 py-6 my-6">
                <p className="text-lg text-green-400 italic mb-4">
                  &gt; Joke of the Day:
                </p>
                {isClosing ? (
                  <p className="text-xl text-green-300">
                    "I would tell you an exit joke, but there's no escape..."
                  </p>
                ) : (
                  <p className="text-xl text-green-300">
                    "I would tell you a joke about being minimized,
                    <br />but I'm afraid it would be <span className="text-green-400">too small</span> to understand."
                  </p>
                )}
              </div>
              
              <p className="text-sm text-green-500/70 italic">
                Achievement Unlocked: {isClosing ? "Terminal Escape Artist" : "Found the bottom of the rabbit hole!"}
              </p>
              <p className="text-sm text-green-500/70">
                {isClosing ? (
                  <>
                    Did you know? This terminal has exactly 
                    <span 
                      className="text-green-400 cursor-pointer hover:text-green-300 transition-colors relative inline-block"
                      onClick={handleSecretClick}
                      title="Click me for a surprise"
                    > 42</span> different ways to exit, 
                    but you found the secret one!
                  </>
                ) : (
                  <>
                    Fun fact: If you count all the pixels in this message, you'll get  
                    <span 
                      className="text-green-400 cursor-pointer hover:text-green-300 transition-colors relative inline-block"
                      onClick={handleSecretClick}
                      title="Click me for a surprise"
                    > 42</span>, the answer to life, the universe and everything.
                    <br />
                    (Not really, but wouldn't that be neat?)
                  </>
                )}
              </p>

              {secretJokeRevealed && (
                <div className="mt-6 bg-green-900/20 p-4 rounded-md border border-green-500/40 animate-fade-in">
                  <p className="text-green-300 font-bold mb-2">Hidden Easter Egg Found!</p>
                  <p className="text-green-400 italic">
                    {isClosing 
                      ? "\"Why did the developer go broke?\""
                      : "\"Why do programmers prefer dark mode?\""}
                  </p>
                  <p className="mt-2 text-green-300">
                    {isClosing 
                      ? "\"Because they lost their domain!\"" 
                      : "\"Because light attracts bugs!\""}
                  </p>
                  <div className="flex justify-center space-x-2 mt-3 text-green-500 text-xs">
                    <span>⭐</span><span>⭐</span><span>⭐</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <button 
            className="mt-10 bg-green-500 text-black px-6 py-3 rounded-full shadow-lg cursor-pointer hover:bg-green-400 transition-colors font-bold flex items-center space-x-2"
            onClick={handleRestore}
          >
            <span>{isClosing ? "Return to Terminal" : "Restore Terminal"}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 3 21 3 21 8"></polyline>
              <line x1="4" y1="20" x2="21" y2="3"></line>
              <path d="M21 13v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8"></path>
            </svg>
          </button>
        </div>
      )}

      {!isMinimized && (
        <AchievementNotification
          achievement={lastUnlockedAchievement}
          onClose={clearLastUnlockedAchievement}
          onNavigate={handleNavigateToAchievements}
        />
      )}
    </>
  )
}

export default function Terminal() {
  return (
    <AchievementsProvider>
      <TerminalContent />
    </AchievementsProvider>
  )
}

