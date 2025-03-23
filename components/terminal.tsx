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
import AchievementNotification from "@/components/achievement-notification"
import { executeCommand } from "@/lib/commands"
import { Maximize2, Minimize2, Menu, X, ChevronRight } from "lucide-react"
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const terminalRef = useRef<HTMLDivElement>(null)
  const outputEndRef = useRef<HTMLDivElement>(null)
  const terminalInputRef = useRef<TerminalInputRef>(null)
  const { 
    lastUnlockedAchievement, 
    clearLastUnlockedAchievement, 
    executeSecretCommand,
    markCommandExecuted,
    downloadCV,
    registerTerminalClosed,
    registerTerminalMinimized
  } = useAchievements()
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const hamburgerButtonRef = useRef<HTMLButtonElement>(null)

  // Initial setup on component mount
  useEffect(() => {
    // Set initial mobile state and fullscreen
    const initialIsMobile = window.innerWidth < 768
    setIsMobile(initialIsMobile)
    
    // Set fullscreen automatically on mobile
    if (initialIsMobile) {
      setIsFullscreen(true)
      setAnimationClass("animate-expand")
    }

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

    // Listen for contact email clicked event
    const handleContactEmailClicked = () => {
      // Trigger the sendContact achievement
      executeSecretCommand("contact");
    };

    // Listen for custom events
    window.addEventListener('switch-terminal-tab', handleTabSwitch);
    window.addEventListener('contact-email-clicked', handleContactEmailClicked);
    
    // Listen for postMessage events
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'switch-tab' && event.data.tabName) {
        console.log('Terminal received postMessage to switch tab:', event.data.tabName);
        setActiveTab(event.data.tabName);
      } else if (event.data && event.data.type === 'contact-email-clicked') {
        handleContactEmailClicked();
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('switch-terminal-tab', handleTabSwitch);
      window.removeEventListener('contact-email-clicked', handleContactEmailClicked);
      window.removeEventListener('message', handleMessage);
    };
  }, [executeSecretCommand]);

  // Check if we're on a mobile device and handle responsive behavior
  useEffect(() => {
    const checkIfMobile = () => {
      const isMobileNow = window.innerWidth < 768
      const wasMobile = isMobile
      
      setIsMobile(isMobileNow)
      
      // Set fullscreen automatically when transitioning to mobile
      if (isMobileNow && !wasMobile) {
        setIsFullscreen(true)
        setAnimationClass("animate-expand")
      }
      // Exit fullscreen when transitioning from mobile to desktop
      else if (!isMobileNow && wasMobile && isFullscreen) {
        setIsFullscreen(false)
        setAnimationClass("animate-contract")
      }
    }
    
    // Initial check
    checkIfMobile()
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile)
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIfMobile)
    }
  }, [isMobile, isFullscreen])

  // Effect to detect virtual keyboard visibility on mobile
  useEffect(() => {
    // Function to check if virtual keyboard is likely open
    const checkKeyboard = () => {
      // Only run this check on mobile devices
      if (window.innerWidth < 768) {
        // If the visual viewport is significantly smaller than the layout viewport,
        // it's likely that a keyboard is shown
        const heightDiff = window.innerHeight - (window.visualViewport?.height || 0);
        const isKeyboardOpen = heightDiff > 150 // Typical keyboard heights are > 150px

        if (isKeyboardOpen) {
          // Scroll to make the input field visible when keyboard opens
          setTimeout(() => {
            if (terminalInputRef.current) {
              const inputElement = document.querySelector('input[aria-label="Terminal input"]')
              if (inputElement) {
                inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }
            }
          }, 300)
        }
      }
    }

    // Set up event listeners for visual viewport changes
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', checkKeyboard)
      window.visualViewport.addEventListener('scroll', checkKeyboard)
    }

    // Also check on window resize
    window.addEventListener('resize', checkKeyboard)

    // Cleanup
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', checkKeyboard)
        window.visualViewport.removeEventListener('scroll', checkKeyboard)
      }
      window.removeEventListener('resize', checkKeyboard)
    }
  }, [])

  const initializeTerminal = () => {
    // Initial welcome message
    setHistory([
      {
        command: "",
        output: [
          <AsciiArt key="ascii-art" />,
          "Welcome to my interactive portfolio terminal!",
          'Type "help" to see available commands. Or simply select a tab from the menu above.',
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
    
    // Also ensure input is visible when history changes
    // This helps when the keyboard might cover the input
    if (window.innerWidth < 768 && activeTab === "terminal") {
      ensureInputVisible();
    }
  }, [history, activeTab])

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

    // Check for specific commands
    if (trimmedInput.toLowerCase() === "contact") {
      const contactInfo = [
        "Email: AhmedGalal11045@gmail.com",
        "Phone: +20 1110333933",
        "Location: New Cairo, Egypt",
        "If you would like to see more, click on",
        "",
        <span 
          key="contact-link"
          className="text-green-400 underline cursor-pointer" 
          onClick={() => {
            setActiveTab("contact");
            clearLastUnlockedAchievement();
          }}
        >
           Contact / CV
        </span>
      ];

      const response = {
        output: contactInfo,
        isError: false,
      };

      // Add command and response to history
      setHistory((prev) => [...prev, { ...newCommand, ...response }]);
      
      // Ensure input is visible after adding command
      ensureInputVisible();
      
      return; // Exit early to prevent further command processing
    }

    // Execute command and get response from commands module (not from achievements)
    const response = await executeCommand(trimmedInput)

    // Special handling for tab switching commands
    if (response.specialAction === "switchTab" && response.tabName) {
      setActiveTab(response.tabName)
      
      // Handle navigation to specific section in the About tab
      if (response.tabName === "about" && response.timelineSection) {
        // After a small delay to ensure the about tab is loaded, navigate to timeline section
        setTimeout(() => {
          try {
            window.postMessage({ 
              type: 'navigate-about-section', 
              sectionId: response.timelineSection 
            }, '*')
          } catch (error) {
            console.error(`Error navigating to ${response.timelineSection} section:`, error)
          }
        }, 200)
      }
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
    
    // Ensure the input field is visible after adding command
    ensureInputVisible();
  }
  
  // Helper function to ensure input is visible on mobile after command execution
  const ensureInputVisible = () => {
    if (window.innerWidth < 768) {
      // First, scroll to the end of output to show the command results
      outputEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      
      // Then, after a short delay to allow rendering, focus and scroll to the input
      setTimeout(() => {
        if (terminalInputRef.current) {
          terminalInputRef.current.focus();
          const inputElement = document.querySelector('input[aria-label="Terminal input"]');
          if (inputElement instanceof HTMLElement) {
            // Use block: 'end' to ensure the input is at the bottom of the visible area
            // This helps prevent the keyboard from covering it
            inputElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'end'
            });
          }
        }
      }, 400); // Slightly longer delay to ensure everything is rendered
    }
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
      // Track terminal minimized achievement
      executeSecretCommand("minimized");
      setTimeout(() => {
        registerTerminalMinimized();
      }, 500);
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
    // Track terminal closed achievement
    executeSecretCommand("closed");
    setTimeout(() => {
      registerTerminalClosed();
    }, 500);
  }

  const handleRestore = () => {
    setIsMinimized(false)
    setIsClosing(false)
    
    // If on mobile, set to fullscreen
    if (isMobile) {
      setIsFullscreen(true)
      setAnimationClass("animate-expand")
    }
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
    
    // Ensure input is visible, especially on mobile
    if (window.innerWidth < 768) {
      ensureInputVisible();
    }
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

  // Determine the terminal height based on fullscreen status and keyboard state
  const [keyboardAdjustedHeight, setKeyboardAdjustedHeight] = useState(0);
  
  // Add effect to adjust height when keyboard appears
  useEffect(() => {
    if (window.visualViewport) {
      const handleVisualViewportChange = () => {
        if (window.innerWidth < 768) {
          const heightDiff = window.innerHeight - (window.visualViewport?.height || 0);
          // If difference is significant, adjust the height
          if (heightDiff > 150) {
            // Set a custom height that accounts for the keyboard
            setKeyboardAdjustedHeight(window.visualViewport?.height ? window.visualViewport.height - 120 : 0); // Adjust for headers
          } else {
            // Reset to default when keyboard is hidden
            setKeyboardAdjustedHeight(0);
          }
        }
      };
      
      window.visualViewport.addEventListener('resize', handleVisualViewportChange);
      return () => {
        window.visualViewport?.removeEventListener('resize', handleVisualViewportChange);
      };
    }
  }, []);
  
  // Calculate content height considering keyboard
  const contentHeight = isFullscreen 
    ? keyboardAdjustedHeight > 0 
      ? `h-[${keyboardAdjustedHeight}px]` 
      : "h-[calc(100vh-120px)]" // Adjusted for both headers
    : isMobile 
      ? keyboardAdjustedHeight > 0
        ? `h-[${keyboardAdjustedHeight}px]` 
        : "h-[calc(100vh-140px)]" // Adjusted for mobile
      : "h-[70vh]";

  // Add new function for revealing the secret joke
  const handleSecretClick = () => {
    setSecretJokeRevealed(true);
    // Pretend to mark this as an achievement too
    setTimeout(() => {
      executeSecretCommand("minimized");
    }, 500);
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  }

  // Close mobile menu when a tab is selected
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setMobileMenuOpen(false);
  }

  // Handle clicking on "help" in the mobile menu
  const handleHelpClick = () => {
    setActiveTab("terminal");
    setMobileMenuOpen(false);
    
    // Use a short timeout to ensure the terminal tab is active before setting the command
    setTimeout(() => {
      if (terminalInputRef.current) {
        terminalInputRef.current.setValue("help");
        terminalInputRef.current.focus();
      }
    }, 50);
  };

  // Close mobile menu when clicking outside or scrolling
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuOpen && 
        mobileMenuRef.current && 
        hamburgerButtonRef.current && 
        !mobileMenuRef.current.contains(event.target as Node) && 
        !hamburgerButtonRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };
    
    // Direct wheel event handler
    const handleWheel = () => {
      if (mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    
    // Direct touch move handler for mobile devices
    const handleTouchMove = () => {
      if (mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    
    // Track touch position to detect scrolling
    let touchStartY = 0;
    
    const handleTouchStart = (e: Event) => {
      const touchEvent = e as unknown as TouchEvent;
      touchStartY = touchEvent.touches[0].clientY;
    };
    
    const handleTouchEnd = (e: Event) => {
      if (!mobileMenuOpen) return;
      
      const touchEvent = e as unknown as TouchEvent;
      const touchEndY = touchEvent.changedTouches[0].clientY;
      const diff = Math.abs(touchEndY - touchStartY);
      
      // If user scrolled more than 5px vertically, close the menu
      if (diff > 5) {
        setMobileMenuOpen(false);
      }
    };
    
    // Add all necessary event listeners
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('wheel', handleWheel, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchstart', handleTouchStart as EventListener, { passive: true });
    document.addEventListener('touchend', handleTouchEnd as EventListener, { passive: true });
    
    // Add all event listeners to scrollable areas
    const scrollableAreas = document.querySelectorAll('.overflow-y-auto, .overflow-auto');
    scrollableAreas.forEach(area => {
      area.addEventListener('wheel', handleWheel, { passive: true });
      area.addEventListener('touchmove', handleTouchMove, { passive: true });
      area.addEventListener('touchstart', handleTouchStart as EventListener, { passive: true });
      area.addEventListener('touchend', handleTouchEnd as EventListener, { passive: true });
    });
    
    return () => {
      // Clean up all event listeners
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchstart', handleTouchStart as EventListener);
      document.removeEventListener('touchend', handleTouchEnd as EventListener);
      
      scrollableAreas.forEach(area => {
        area.removeEventListener('wheel', handleWheel);
        area.removeEventListener('touchmove', handleTouchMove);
        area.removeEventListener('touchstart', handleTouchStart as EventListener);
        area.removeEventListener('touchend', handleTouchEnd as EventListener);
      });
    };
  }, [mobileMenuOpen]);

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
        <div className="flex items-center justify-between bg-gray-900 px-4 py-2 border-b border-green-500 cursor-default terminal-title-fixed">
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
            <div className="bg-gray-900 border-b border-green-500 w-full flex justify-between rounded-none overflow-x-auto terminal-header-fixed">
              {/* Mobile/Tablet Hamburger Menu */}
              <div className="md:hidden flex items-center">
                <button 
                  ref={hamburgerButtonRef}
                  onClick={toggleMobileMenu}
                  className="p-2 flex items-center text-green-500 hover:text-green-400 focus:outline-none ml-1"
                  aria-label="Toggle navigation menu"
                >
                  {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                  <span className="font-mono text-sm ml-2">
                    /{activeTab} <span className="terminal-cursor"></span>
                  </span>
                </button>
              </div>

              {/* Desktop Tabs */}
              <div className="hidden md:block">
                <TabsList className="bg-transparent border-none rounded-none h-auto">
                  <TabsTrigger
                    value="terminal"
                    className="custom-tab touch-optimized data-[state=active]:bg-black data-[state=active]:text-green-500 rounded-none border-r border-green-500"
                  >
                    Terminal
                  </TabsTrigger>
                  <TabsTrigger
                    value="projects"
                    className="custom-tab touch-optimized data-[state=active]:bg-black data-[state=active]:text-green-500 rounded-none border-r border-green-500"
                  >
                    Projects
                  </TabsTrigger>
                  <TabsTrigger
                    value="about"
                    className="custom-tab touch-optimized data-[state=active]:bg-black data-[state=active]:text-green-500 rounded-none border-r border-green-500"
                  >
                    About / Experience
                  </TabsTrigger>
                  <TabsTrigger
                    value="contact"
                    className="custom-tab touch-optimized data-[state=active]:bg-black data-[state=active]:text-green-500 rounded-none border-r border-green-500"
                  >
                    Contact / CV
                  </TabsTrigger>
                  <TabsTrigger
                    value="my-achievements"
                    className="custom-tab touch-optimized data-[state=active]:bg-black data-[state=active]:text-green-500 rounded-none border-r border-green-500"
                  >
                    My Achievements / Publications / Certifications
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Your Achievements Tab */}
              <TabsList className="bg-transparent border-none rounded-none h-auto ml-auto flex-grow">
                <TabsTrigger
                  value="your-achievements"
                  className="custom-tab touch-optimized data-[state=active]:bg-black data-[state=active]:text-green-500 rounded-none w-full flex justify-end pr-6"
                >
                  <span className="hidden md:inline">Your Achievements</span>
                  <span className="md:hidden">Your Achievements</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Mobile Menu Dropdown - Terminal Style */}
            {mobileMenuOpen && (
              <div 
                ref={mobileMenuRef}
                className="md:hidden absolute top-[2.5rem] left-0 w-full z-50 bg-gray-900 border-b border-green-500 font-mono text-sm shadow-lg shadow-black/50"
              >
                <div className="p-2 bg-black text-green-500 text-xs border-b border-green-500/50">
                  <span className="opacity-80">portfolio@Gallillio:~</span> <span className="text-green-400">$</span> ls -la /pages
                </div>
                <div className="flex flex-col">
                  {[
                    { id: "terminal", label: "terminal", desc: "Command line interface" },
                    { id: "projects", label: "projects", desc: "View my work" },
                    { id: "about", label: "about", desc: "My background" },
                    { id: "contact", label: "contact", desc: "Get in touch" },
                    { id: "my-achievements", label: "my-achievements", desc: "My accomplishments" },
                    { id: "your-achievements", label: "your-achievements", desc: "Your unlocked achievements" }
                  ].map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={`mobile-menu-item touch-optimized text-left px-4 py-3 flex items-center border-b border-green-500/30 transition-colors cursor-pointer ${
                        activeTab === item.id 
                          ? "bg-black text-green-400" 
                          : "text-green-500 hover:bg-gray-800"
                      }`}
                      style={{
                        animationDelay: `${index * 70}ms`,
                        animation: "fadeInDown 0.3s ease-out forwards"
                      }}
                    >
                      <ChevronRight size={14} className="mr-2" />
                      <span className="mr-2 opacity-70">{activeTab === item.id ? ">" : "$"}</span>
                      <span className="text-green-400">cd</span>
                      <span className="mx-1">/</span>
                      <span className={activeTab === item.id ? "text-green-300" : ""}>{item.label}</span>
                      <span className="ml-2 text-green-500/50 text-xs hidden sm:inline">{item.desc}</span>
                    </button>
                  ))}
                </div>
                <div className="p-3 bg-black text-green-500/70 text-xs border-t border-green-500/30">
                  Type <span 
                    className="text-green-400 cursor-pointer hover:text-green-300 underline decoration-dotted underline-offset-2"
                    onClick={handleHelpClick}
                  >help</span> in terminal for available commands
                </div>
              </div>
            )}

            {/* Tab Content Sections */}
            <TabsContent 
              value="terminal" 
              className="p-0 m-0"
              onScroll={() => mobileMenuOpen && setMobileMenuOpen(false)}
            >
              <div
                className={`${contentHeight} overflow-y-auto overflow-x-auto bg-black p-4 pt-6 font-mono text-green-500 cursor-text custom-scrollbar transition-height duration-700 ease-in-out`}
                onClick={focusInput}
                onScroll={() => mobileMenuOpen && setMobileMenuOpen(false)}
              >
                <TerminalOutput history={history} onCommandClick={handleCommandClick} />
                <div ref={outputEndRef} />
                <TerminalInput ref={terminalInputRef} onCommand={handleCommand} />
              </div>
            </TabsContent>

            <TabsContent 
              value="projects" 
              className="p-0 m-0"
              onScroll={() => mobileMenuOpen && setMobileMenuOpen(false)}
            >
              <div 
                className={`${contentHeight} overflow-y-auto transition-height duration-700 ease-in-out pt-2`}
                onScroll={() => mobileMenuOpen && setMobileMenuOpen(false)}
              >
                <Projects />
              </div>
            </TabsContent>

            <TabsContent 
              value="about" 
              className="p-0 m-0"
              onScroll={() => mobileMenuOpen && setMobileMenuOpen(false)}
            >
              <div 
                className={`${contentHeight} overflow-y-auto transition-height duration-700 ease-in-out pt-2`}
                onScroll={() => mobileMenuOpen && setMobileMenuOpen(false)}
              >
                <About />
              </div>
            </TabsContent>

            <TabsContent 
              value="contact" 
              className="p-0 m-0"
              onScroll={() => mobileMenuOpen && setMobileMenuOpen(false)}
            >
              <div 
                className={`${contentHeight} overflow-y-auto transition-height duration-700 ease-in-out pt-2`}
                onScroll={() => mobileMenuOpen && setMobileMenuOpen(false)}
              >
                <Contact />
              </div>
            </TabsContent>

            <TabsContent 
              value="my-achievements" 
              className="p-0 m-0"
              onScroll={() => mobileMenuOpen && setMobileMenuOpen(false)}
            >
              <div 
                className={`${contentHeight} overflow-y-auto transition-height duration-700 ease-in-out pt-2`}
                onScroll={() => mobileMenuOpen && setMobileMenuOpen(false)}
              >
                <MyAchievements />
              </div>
            </TabsContent>

            <TabsContent 
              value="your-achievements" 
              className="p-0 m-0"
              onScroll={() => mobileMenuOpen && setMobileMenuOpen(false)}
            >
              <div 
                className={`${contentHeight} overflow-y-auto transition-height duration-700 ease-in-out pt-2`}
                onScroll={() => mobileMenuOpen && setMobileMenuOpen(false)}
              >
                <YourAchievements />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {(isMinimized || isClosing) && (
        <div className="fixed inset-4 z-40 bg-black border border-green-500 rounded-md p-6 flex flex-col justify-center items-center text-center shadow-lg shadow-green-500/30 font-mono">
          <div className="max-w-2xl mx-auto space-y-6 pt-8 md:pt-0">
            <h2 className="text-2xl text-green-400 font-bold mt-8 md:mt-0">
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
                    &ldquo;I would tell you an exit joke, but there&apos;s no escape...&rdquo;
                  </p>
                ) : (
                  <p className="text-xl text-green-300">
                    &ldquo;I would tell you a joke about being minimized,
                    <br />but I&apos;m afraid it would be <span className="text-green-400">too small</span> to understand.&rdquo;
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
                    Fun fact: If you count all the pixels in this message, you&apos;ll get  
                    <span 
                      className="text-green-400 cursor-pointer hover:text-green-300 transition-colors relative inline-block"
                      onClick={handleSecretClick}
                      title="Click me for a surprise"
                    > 42</span>, the answer to life, the universe and everything.
                    <br />
                    (Not really, but wouldn&apos;t that be neat?)
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
              {/* <path d="M21 13v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8"></path> */}
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

