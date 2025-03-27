"use client"

import { useState, useEffect, useRef, useCallback } from "react"
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
import { Maximize2, Minimize2, Menu, X, ChevronRight, MessageSquare, Terminal as TerminalIcon } from "lucide-react"
import { AchievementsProvider, useAchievements } from "@/lib/achievements-context"
import type { Command } from '@/lib/types'
import React from "react"
import { sendMessageToGemini, type ChatMessage } from "@/lib/chatbot"

function TerminalContent(): React.ReactNode {
  const [history, setHistory] = useState<Array<{ command: string; output: React.ReactNode[]; timestamp: Date; isError: boolean }>>([])
  const [activeTab, setActiveTab] = useState<string>("terminal")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [animationClass, setAnimationClass] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isChatMode, setIsChatMode] = useState(false)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  // const [isProcessingChat, setIsProcessingChat] = useState(false)
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
    registerTerminalMinimized,
    unlockAllAchievements,
    enableNightOwl,
    activateChatMode
  } = useAchievements()
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const hamburgerButtonRef = useRef<HTMLDivElement>(null)
  const scrollTimer = useRef<NodeJS.Timeout | null>(null)
  const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY as string;

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
          "Welcome to my interactive portfolio terminal! \n",
          "You can learn everything you want about me by interacting with this terminal via typing commands,",
          "by using natural language in the chat mode,",
          "Or by simply selecting a tab from the menu above.",
          "\n",
          "Type 'help' to see available commands.",
          "",
          "Type 'chat' to open my AI chatbot for natural language questions.",
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

    if (isChatMode) {
      if (trimmedInput.toLowerCase() === 'exit') {
        setIsChatMode(false)
        setChatHistory([])
        setHistory(prev => [
          ...prev, 
          {
            command: trimmedInput,
            output: ["Exiting chat mode. Returning to terminal."],
            timestamp: new Date(),
            isError: false
          }
        ])
        return
      }
      
      setHistory(prev => [
        ...prev, 
        {
          command: trimmedInput,
          output: [],
          timestamp: new Date(),
          isError: false
        }
      ])
      
      // setIsProcessingChat(true)
      setHistory(prev => [
        ...prev, 
        {
          command: "",
          output: ["Processing your request..."],
          timestamp: new Date(),
          isError: false
        }
      ])
      
      try {
        const response = await sendMessageToGemini(
          trimmedInput,
          geminiApiKey,
          chatHistory
        )
        
        setHistory(prev => prev.slice(0, -1))
        
        setHistory(prev => [
          ...prev, 
          {
            command: "",
            output: [response.split("\n").map((line, i) => <div key={i}>{line}</div>)],
            timestamp: new Date(),
            isError: false
          }
        ])
        
        setChatHistory(prev => [
          ...prev,
          { role: 'user', content: trimmedInput },
          { role: 'model', content: response }
        ])
      } catch (error) {
        console.error('Chat error:', error)
        
        setHistory(prev => prev.slice(0, -1))
        
        setHistory(prev => [
          ...prev, 
          {
            command: "",
            output: ["Sorry, I encountered an error. Please try again."],
            timestamp: new Date(),
            isError: true
          }
        ])
      } finally {
        // setIsProcessingChat(false)
        ensureInputVisible()
      }
      
      return
    }

    const lowerCommand = trimmedInput.toLowerCase()
    if (lowerCommand === "hello") {
      executeSecretCommand("hello")
    } else if (lowerCommand === "this-site-is-cool") {
      clearLastUnlockedAchievement();
      
      const cheatResponse = {
        command: trimmedInput,
        output: [
          "Oh wow, you think so? How original... 🙄",
          "But since you liked it so much, I'll unlock ALL achievements for you.",
          "You're welcome. I guess...",
          "",
          <span key="cheat-code" className="text-yellow-400">
            🔓 All achievements unlocked! Check your achievements tab!
          </span>
        ],
        isError: false,
        timestamp: new Date(),
      }
      
      setHistory((prev) => [...prev, cheatResponse])
      
      setTimeout(() => {
        unlockAllAchievements();
        ensureInputVisible();
      }, 100);
      
      return
    } else if (lowerCommand === "enable-night-owl") {
      executeSecretCommand("enable-night-owl");
      
      const nightOwlResponse = {
        command: trimmedInput,
        output: [
          "Okay Batman",
          "",
          <span key="night-owl" className="text-yellow-400">
            🦇 Night Owl mode activated!
          </span>
        ],
        isError: false,
        timestamp: new Date(),
      }
      
      setHistory((prev) => [...prev, nightOwlResponse])
      
      enableNightOwl();
      
      ensureInputVisible();
      
      return
    }

    markCommandExecuted()

    const newCommand: Command = {
      command: trimmedInput,
      timestamp: new Date(),
    }

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

      setHistory((prev) => [...prev, { ...newCommand, ...response }]);
      
      ensureInputVisible();
      
      return;
    }

    const response = await executeCommand(trimmedInput)

    if (response.chatMode) {
      setIsChatMode(true)
      activateChatMode()
    } else if (response.specialAction === "switchTab" && response.tabName) {
      setActiveTab(response.tabName)
      
      if (response.tabName === "about" && response.timelineSection) {
        setTimeout(() => {
          try {
            window.postMessage({ 
              type: 'navigate-about-section', 
              sectionId: response.timelineSection,
              shouldScrollToNav: true
            }, '*')
          } catch (error) {
            console.error(`Error navigating to ${response.timelineSection} section:`, error)
          }
        }, 500)
      }
    } else if (response.specialAction === "clear") {
      initializeTerminal()
      return
    } else if (response.specialAction === "downloadCV") {
      const link = document.createElement('a')
      link.href = '/Ahmed Elzeky Resume.pdf'
      link.download = 'Ahmed Elzeky Resume.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      downloadCV()
    }

    setHistory((prev) => [...prev, { ...newCommand, ...response, isError: response.isError ?? false }])
    
    ensureInputVisible();
  }
  
  const ensureInputVisible = () => {
    if (window.innerWidth < 768) {
      outputEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      
      setTimeout(() => {
        if (terminalInputRef.current) {
          terminalInputRef.current.focus();
          const inputElement = document.querySelector('input[aria-label="Terminal input"]');
          if (inputElement instanceof HTMLElement) {
            inputElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'end'
            });
          }
        }
      }, 400);
    }
  }

  const toggleFullscreen = () => {
    if (isFullscreen) {
      setAnimationClass("animate-contract")
    } else {
      setAnimationClass("animate-expand")
    }
    setIsFullscreen(!isFullscreen)
    if (isMinimized) {
      setIsMinimized(false)
    }
  }

  const handleMinimize = () => {
    if (!isMinimized) {
      setIsMinimized(true)
      if (isFullscreen) {
        setIsFullscreen(false)
        setAnimationClass("animate-contract")
      }
      executeSecretCommand("minimized");
      setTimeout(() => {
        registerTerminalMinimized();
      }, 500);
    }
  }

  const handleClose = () => {
    setIsClosing(true)
    if (isFullscreen) {
      setIsFullscreen(false)
      setAnimationClass("animate-contract")
    }
    executeSecretCommand("closed");
    setTimeout(() => {
      registerTerminalClosed();
    }, 500);
  }

  const handleRestore = () => {
    setIsMinimized(false)
    setIsClosing(false)
    
    if (isMobile) {
      setIsFullscreen(true)
      setAnimationClass("animate-expand")
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationClass("")
    }, 700)
    return () => clearTimeout(timer)
  }, [animationClass])

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

  const focusInput = useCallback(() => {
    terminalInputRef.current?.focus();
    
    if (window.innerWidth < 768) {
      ensureInputVisible();
    }
  }, [terminalInputRef]);

  useEffect(() => {
    if (activeTab === "terminal") {
      setTimeout(() => {
        focusInput();
      }, 0);
    }
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('terminalActiveTab', activeTab);
    }
  }, [activeTab, focusInput])

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

  const [keyboardAdjustedHeight, setKeyboardAdjustedHeight] = useState(0);
  
  useEffect(() => {
    if (window.visualViewport) {
      const handleVisualViewportChange = () => {
        if (window.innerWidth < 768) {
          const heightDiff = window.innerHeight - (window.visualViewport?.height || 0);
          if (heightDiff > 150) {
            setKeyboardAdjustedHeight(window.visualViewport?.height ? window.visualViewport.height - 120 : 0);
          } else {
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
  
  const contentHeight = isFullscreen 
    ? keyboardAdjustedHeight > 0 
      ? `h-[${keyboardAdjustedHeight}px]` 
      : "h-[calc(100vh-120px)]"
    : isMobile 
      ? keyboardAdjustedHeight > 0
        ? `h-[${keyboardAdjustedHeight}px]` 
        : "h-[calc(100vh-140px)]"
      : "h-[70vh]";

  const toggleMobileMenu = () => {
    if (isScrolling) {
      setMenuOpenedDuringScroll(true);
    }
    setMobileMenuOpen(prev => !prev);
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setMobileMenuOpen(false);
  }

  const handleHelpClick = () => {
    setActiveTab("terminal");
    setMobileMenuOpen(false);
    
    setTimeout(() => {
      if (terminalInputRef.current) {
        terminalInputRef.current.setValue("help");
        terminalInputRef.current.focus();
      }
    }, 50);
  };

  const [menuOpenedDuringScroll, setMenuOpenedDuringScroll] = useState(false);

  const [isScrolling, setIsScrolling] = useState(false);

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
    
    const handleWheel = () => {
      setIsScrolling(true);
      
      if (scrollTimer.current) {
        clearTimeout(scrollTimer.current);
      }
      
      if (mobileMenuOpen && !menuOpenedDuringScroll) {
        scrollTimer.current = setTimeout(() => {
          setMobileMenuOpen(false);
        }, 1000);
        return;
      }
      
      scrollTimer.current = setTimeout(() => {
        setIsScrolling(false);
        
        setTimeout(() => {
          setMenuOpenedDuringScroll(false);
        }, 1000);
      }, 300);
    };
    
    const handleTouchMove = () => {
      setIsScrolling(true);
      
      if (scrollTimer.current) {
        clearTimeout(scrollTimer.current);
      }
      
      if (mobileMenuOpen && !menuOpenedDuringScroll) {
        scrollTimer.current = setTimeout(() => {
          setMobileMenuOpen(false);
        }, 1000);
        return;
      }
      
      scrollTimer.current = setTimeout(() => {
        setIsScrolling(false);
        
        setTimeout(() => {
          setMenuOpenedDuringScroll(false);
        }, 1000);
      }, 300);
    };
    
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
      
      if (diff > 5 && !menuOpenedDuringScroll) {
        setMobileMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('wheel', handleWheel, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchstart', handleTouchStart as EventListener, { passive: true });
    document.addEventListener('touchend', handleTouchEnd as EventListener, { passive: true });
    
    const scrollableAreas = document.querySelectorAll('.overflow-y-auto, .overflow-auto');
    scrollableAreas.forEach(area => {
      area.addEventListener('wheel', handleWheel, { passive: true });
      area.addEventListener('touchmove', handleTouchMove, { passive: true });
      area.addEventListener('touchstart', handleTouchStart as EventListener, { passive: true });
      area.addEventListener('touchend', handleTouchEnd as EventListener, { passive: true });
    });
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchstart', handleTouchStart as EventListener);
      document.removeEventListener('touchend', handleTouchEnd as EventListener);
      
      if (scrollTimer.current) {
        clearTimeout(scrollTimer.current);
      }
      
      scrollableAreas.forEach(area => {
        area.removeEventListener('wheel', handleWheel);
        area.removeEventListener('touchmove', handleTouchMove);
        area.removeEventListener('touchstart', handleTouchStart as EventListener);
        area.removeEventListener('touchend', handleTouchEnd as EventListener);
      });
    };
  }, [mobileMenuOpen, isScrolling, menuOpenedDuringScroll]);

  return (
    <>
      <div
        ref={terminalRef}
        className={`bg-black transition-all duration-700 ease-in-out transform-gpu overflow-hidden
          ${isChatMode && activeTab === "terminal" ? 'border border-gray-400 rounded-lg chat-mode' : 'border border-green-500'} 
          ${isFullscreen 
            ? 'fixed inset-0 z-50 max-w-none rounded-none border-green-400' 
            : isMobile 
              ? 'fixed inset-4 z-50 rounded-md shadow-xl' 
              : 'w-full max-w-5xl rounded-md relative'
          } ${animationClass} ${isMinimized || isClosing ? 'h-10 overflow-hidden' : ''}
          ${isChatMode && activeTab === "terminal" 
            ? 'shadow-gray-400/30 hover:shadow-gray-400/50' 
            : 'shadow-green-500/30 hover:shadow-green-500/50'} shadow-xl hover:shadow-2xl`}
        style={{
          transitionProperty: "all",
          transitionDuration: "700ms",
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)"
        }}
      >
        <div className={`flex items-center justify-between px-4 py-2 cursor-default terminal-title-fixed
          ${isChatMode && activeTab === "terminal" ? 'bg-gray-800 border-b border-gray-400' : 'bg-gray-900 border-b border-green-500'}`}>
          <div className="flex space-x-2">
            <button 
              className="group relative w-3 h-3 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
              onClick={handleClose}
              aria-label="Close terminal"
            >
              <div className="w-3 h-3 rounded-full bg-red-500 group-hover:bg-red-600 transition-all duration-200 group-hover:shadow-[0_0_3px_rgba(239,68,68,0.7)]"></div>
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
            
            <button 
              className="group relative w-3 h-3 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
              onClick={handleMinimize}
              aria-label="Minimize terminal"
            >
              <div className="w-3 h-3 rounded-full bg-yellow-500 group-hover:bg-yellow-600 transition-all duration-200 group-hover:shadow-[0_0_3px_rgba(234,179,8,0.7)]"></div>
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
            
            <button 
              className="group relative w-3 h-3 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
              onClick={isMinimized ? handleRestore : (!isMobile ? toggleFullscreen : undefined)}
              aria-label={isFullscreen ? "Exit fullscreen" : (isMinimized ? "Restore" : "Enter fullscreen")}
            >
              <div className={`w-3 h-3 rounded-full transition-all duration-200 bg-green-500 group-hover:bg-green-600 group-hover:shadow-[0_0_3px_rgba(34,197,94,0.7)]'}`}></div>
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
                  <>
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </>
                ) : isFullscreen ? (
                  <>
                    <polyline points="4 14 10 14 10 20"></polyline>
                    <polyline points="20 10 14 10 14 4"></polyline>
                    <line x1="14" y1="10" x2="21" y2="3"></line>
                    <line x1="3" y1="21" x2="10" y2="14"></line>
                  </>
                ) : (
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
            className={`font-mono text-sm flex items-center gap-2 transition-colors duration-300
              ${isChatMode && activeTab === "terminal" ? 'text-gray-300' : 'text-green-500'}`}
            onDoubleClick={isMinimized ? handleRestore : undefined}
          >
            {isChatMode && activeTab === "terminal" ? (
              <>
                <MessageSquare size={14} className="animate-pulse" />
                chat@Gallillio:~
              </>
            ) : (
              <>portfolio@Gallillio:~</>
            )}
            
            {/* Add chat/terminal toggle button for mobile */}
            {isMobile && (
              <button 
                onClick={() => {
                  if (activeTab !== "terminal") {
                    setActiveTab("terminal");
                  }
                  if (!isChatMode) {
                    activateChatMode();
                  }
                  setIsChatMode(!isChatMode);
                }}
                className={`ml-2 p-1 rounded-md transition-colors duration-300
                  ${isChatMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-900 text-green-400 hover:bg-gray-800'}`}
                title={isChatMode ? "Switch to command mode" : "Switch to chat mode"}
              >
                {isChatMode ? (
                  <TerminalIcon size={14} />
                ) : (
                  <MessageSquare size={14} />
                )}
              </button>
            )}
          </div>
          {!isMobile && !isMinimized && (
            <div className="flex gap-2 items-center">
              {/* Change chat/terminal toggle to show on all tabs */}
              <button 
                onClick={() => {
                  if (activeTab !== "terminal") {
                    setActiveTab("terminal");
                  }
                  if (!isChatMode) {
                    activateChatMode();
                  }
                  setIsChatMode(!isChatMode);
                }} 
                className={`p-1 rounded-md transition-colors duration-300 mr-2
                  ${isChatMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-900 text-green-400 hover:bg-gray-800'}`}
                title={isChatMode ? "Switch to command mode" : "Switch to chat mode"}
              >
                {isChatMode ? (
                  <TerminalIcon size={16} />
                ) : (
                  <MessageSquare size={16} />
                )}
              </button>
              <button 
                onClick={toggleFullscreen} 
                className={`transition-colors duration-300
                  ${isChatMode && activeTab === "terminal" ? 'text-gray-400 hover:text-gray-300' : 'text-green-500 hover:text-green-400'}`}
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            </div>
          )}
        </div>

        {!isMinimized && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className={`w-full flex justify-between rounded-none overflow-x-auto terminal-header-fixed
              ${isChatMode && activeTab === "terminal" ? 'bg-gray-800 border-b border-gray-400' : 'bg-gray-900 border-b border-green-500'}`}>
              <div 
                className="md:hidden flex-grow cursor-pointer" 
                onClick={toggleMobileMenu}
                ref={hamburgerButtonRef}
              >
                <div className="flex items-center p-2">
                  <div className={`flex items-center focus:outline-none ml-1
                    ${isChatMode && activeTab === "terminal" ? 'text-gray-400 hover:text-gray-300' : 'text-green-500 hover:text-green-400'}`}>
                    {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    <span className="font-mono text-sm ml-2">
                      /{activeTab} 
                      <span className={`terminal-cursor ${isChatMode && activeTab === "terminal" ? 'chat-cursor' : ''}`}></span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="hidden md:block">
                <TabsList className={`bg-transparent border-none rounded-none h-auto 
                  ${isChatMode && activeTab === "terminal" ? 'chat-tabs' : ''}`}>
                  <TabsTrigger
                    value="terminal"
                    className={`custom-tab touch-optimized rounded-none border-r
                      ${isChatMode && activeTab === "terminal" 
                        ? 'data-[state=active]:bg-black data-[state=active]:text-gray-300 border-gray-400' 
                        : 'data-[state=active]:bg-black data-[state=active]:text-green-500 border-green-500'}`}
                  >
                    {isChatMode && activeTab === "terminal" ? (
                      <div className="flex items-center gap-1">
                        <MessageSquare size={14} />
                        Chat
                      </div>
                    ) : (
                      "Terminal"
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="projects"
                    className={`custom-tab touch-optimized rounded-none border-r
                      ${isChatMode && activeTab === "terminal" 
                        ? 'data-[state=active]:bg-black data-[state=active]:text-gray-300 border-gray-400' 
                        : 'data-[state=active]:bg-black data-[state=active]:text-green-500 border-green-500'}`}
                  >
                    Projects
                  </TabsTrigger>
                  <TabsTrigger
                    value="about"
                    className={`custom-tab touch-optimized rounded-none border-r
                      ${isChatMode && activeTab === "terminal" 
                        ? 'data-[state=active]:bg-black data-[state=active]:text-gray-300 border-gray-400' 
                        : 'data-[state=active]:bg-black data-[state=active]:text-green-500 border-green-500'}`}
                  >
                    About / Experience
                  </TabsTrigger>
                  <TabsTrigger
                    value="contact"
                    className={`custom-tab touch-optimized rounded-none border-r
                      ${isChatMode && activeTab === "terminal" 
                        ? 'data-[state=active]:bg-black data-[state=active]:text-gray-300 border-gray-400' 
                        : 'data-[state=active]:bg-black data-[state=active]:text-green-500 border-green-500'}`}
                  >
                    Contact / CV
                  </TabsTrigger>
                  <TabsTrigger
                    value="my-achievements"
                    className={`custom-tab touch-optimized rounded-none border-r
                      ${isChatMode && activeTab === "terminal" 
                        ? 'data-[state=active]:bg-black data-[state=active]:text-gray-300 border-gray-400' 
                        : 'data-[state=active]:bg-black data-[state=active]:text-green-500 border-green-500'}`}
                  >
                    My Achievements / Publications / Certifications
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsList className={`bg-transparent border-none rounded-none h-auto ml-auto flex-grow hidden md:flex
                ${isChatMode && activeTab === "terminal" ? 'chat-tabs' : ''}`}>
                <TabsTrigger
                  value="your-achievements"
                  className={`custom-tab touch-optimized rounded-none w-full flex justify-end pr-6
                    ${isChatMode && activeTab === "terminal" 
                      ? 'data-[state=active]:bg-black data-[state=active]:text-gray-300' 
                      : 'data-[state=active]:bg-black data-[state=active]:text-green-500'}`}
                >
                  <span>Your Achievements</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {mobileMenuOpen && (
              <div 
                ref={mobileMenuRef}
                className={`md:hidden absolute top-[2.5rem] left-0 w-full z-50 font-mono text-sm shadow-lg shadow-black/50
                  ${isChatMode && activeTab === "terminal" 
                    ? 'bg-gray-800 border-b border-gray-400' 
                    : 'bg-gray-900 border-b border-green-500'}`}
              >
                <div className={`p-2 border-b text-xs
                  ${isChatMode && activeTab === "terminal" 
                    ? 'bg-black text-gray-400 border-gray-400/50' 
                    : 'bg-black text-green-500 border-green-500/50'}`}>
                  <span className="opacity-80">
                    {isChatMode && activeTab === "terminal" ? "chat@Gallillio:~" : "portfolio@Gallillio:~"}
                  </span> 
                  <span className={isChatMode && activeTab === "terminal" ? "text-gray-300" : "text-green-400"}>$</span> ls -la /pages
                </div>
                <div className="flex flex-col">
                  {[
                    { id: "terminal", label: isChatMode && activeTab === "terminal" ? "chat" : "terminal", desc: isChatMode && activeTab === "terminal" ? "AI assistant" : "Command line interface" },
                    { id: "projects", label: "projects", desc: "View my work" },
                    { id: "about", label: "about", desc: "My background" },
                    { id: "contact", label: "contact", desc: "Get in touch" },
                    { id: "my-achievements", label: "my-achievements", desc: "My accomplishments" },
                    { id: "your-achievements", label: "your-achievements", desc: "Your unlocked achievements" }
                  ].map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={`mobile-menu-item touch-optimized text-left px-4 py-3 flex items-center border-b transition-colors cursor-pointer ${
                        isChatMode && activeTab === "terminal"
                          ? `border-gray-400/30 ${activeTab === item.id ? "bg-black text-gray-300" : "text-gray-400 hover:bg-gray-800"}`
                          : `border-green-500/30 ${activeTab === item.id ? "bg-black text-green-400" : "text-green-500 hover:bg-gray-800"}`
                      }`}
                      style={{
                        animationDelay: `${index * 70}ms`,
                        animation: "fadeInDown 0.3s ease-out forwards"
                      }}
                    >
                      <ChevronRight size={14} className="mr-2" />
                      <span className="mr-2 opacity-70">{activeTab === item.id ? ">" : "$"}</span>
                      <span className={isChatMode && activeTab === "terminal" ? "text-gray-300" : "text-green-400"}>cd</span>
                      <span className="mx-1">/</span>
                      <span className={activeTab === item.id ? (isChatMode && activeTab === "terminal" ? "text-gray-200" : "text-green-300") : ""}>{item.label}</span>
                      <span className={`ml-2 text-xs hidden sm:inline ${isChatMode && activeTab === "terminal" ? "text-gray-400/50" : "text-green-500/50"}`}>{item.desc}</span>
                    </button>
                  ))}
                </div>
                <div className={`p-3 text-xs border-t ${
                  isChatMode && activeTab === "terminal"
                    ? "bg-black text-gray-400/70 border-gray-400/30"
                    : "bg-black text-green-500/70 border-green-500/30"
                }`}>
                  Type <span 
                    className={`cursor-pointer underline decoration-dotted underline-offset-2 ${
                      isChatMode && activeTab === "terminal"
                        ? "text-gray-300 hover:text-gray-200"
                        : "text-green-400 hover:text-green-300"
                    }`}
                    onClick={handleHelpClick}
                  >help</span> in terminal for available commands
                </div>
              </div>
            )}

            <TabsContent 
              value="terminal" 
              className="p-0 m-0"
            >
              <div
                className={`${contentHeight} overflow-y-auto overflow-x-auto p-4 pt-6 font-mono cursor-text custom-scrollbar transition-all duration-700 ease-in-out
                  ${isChatMode ? 'bg-gray-900 text-gray-300 chat-terminal-content' : 'bg-black text-green-500'}`}
                onClick={focusInput}
              >
                {isChatMode && (
                  <div className={`mb-6 p-3 rounded-lg border animate-fadeIn ${isChatMode ? 'bg-gray-800/50 border-gray-500/30 text-gray-300' : 'bg-green-900/10 border-green-500/30 text-green-400'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare size={16} className="text-blue-400" />
                      <span className="font-semibold text-blue-400">Chat Mode Active</span>
                    </div>
                    <p className="text-sm">You&apos;re chatting with Ahmed&apos;s AI assistant. Ask anything about Ahmed or his work. Type <code className="bg-gray-700 px-1 rounded">exit</code> to return to terminal mode.</p>
                  </div>
                )}
                <TerminalOutput history={history} onCommandClick={handleCommandClick} isChatMode={isChatMode} />
                <div ref={outputEndRef} />
                <TerminalInput ref={terminalInputRef} onCommand={handleCommand} isChatMode={isChatMode} />
              </div>
            </TabsContent>

            <TabsContent 
              value="projects" 
              className="p-0 m-0"
            >
              <div 
                className={`${contentHeight} overflow-y-auto transition-height duration-700 ease-in-out pt-2`}
              >
                <Projects />
              </div>
            </TabsContent>

            <TabsContent 
              value="about" 
              className="p-0 m-0"
            >
              <div 
                className={`${contentHeight} overflow-y-auto transition-height duration-700 ease-in-out pt-2`}
              >
                <About />
              </div>
            </TabsContent>

            <TabsContent 
              value="contact" 
              className="p-0 m-0"
            >
              <div 
                className={`${contentHeight} overflow-y-auto transition-height duration-700 ease-in-out pt-2`}
              >
                <Contact />
              </div>
            </TabsContent>

            <TabsContent 
              value="my-achievements" 
              className="p-0 m-0"
            >
              <div 
                className={`${contentHeight} overflow-y-auto transition-height duration-700 ease-in-out pt-2`}
              >
                <MyAchievements />
              </div>
            </TabsContent>

            <TabsContent 
              value="your-achievements" 
              className="p-0 m-0"
            >
              <div 
                className={`${contentHeight} overflow-y-auto transition-height duration-700 ease-in-out pt-2`}
              >
                <YourAchievements />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {(isMinimized || isClosing) && (
        <div className={`fixed inset-4 z-40 bg-black p-6 flex flex-col justify-center items-center text-center shadow-lg font-mono rounded-md border
          ${isChatMode && activeTab === "terminal" 
            ? 'border-gray-400 shadow-gray-400/30' 
            : 'border-green-500 shadow-green-500/30'}`}>
          <div className="max-w-2xl mx-auto space-y-6 pt-8 md:pt-0">
            <h2 className={`text-2xl font-bold mt-8 md:mt-0
              ${isChatMode && activeTab === "terminal" ? 'text-gray-300' : 'text-green-400'}`}>
              {isClosing ? "Terminal Closed" : "Terminal Minimized"}
            </h2>
            
            <div className={`py-4 space-y-4 ${isChatMode && activeTab === "terminal" ? 'text-gray-300' : 'text-green-300'}`}>
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
              
              <div className={`border-t border-b py-6 my-6
                ${isChatMode && activeTab === "terminal" ? 'border-gray-500/30' : 'border-green-500/30'}`}>
                <p className={`text-lg italic mb-4
                  ${isChatMode && activeTab === "terminal" ? 'text-gray-300' : 'text-green-400'}`}>
                  &gt; Joke of the Day:
                </p>
                {isClosing ? (
                  <p className={`text-xl ${isChatMode && activeTab === "terminal" ? 'text-gray-200' : 'text-green-300'}`}>
                    &ldquo;Why do programmers prefer dark mode? Because light attracts bugs!&rdquo;
                  </p>
                ) : (
                  <p className={`text-xl ${isChatMode && activeTab === "terminal" ? 'text-gray-200' : 'text-green-300'}`}>
                    &ldquo;Why did the terminal break up with the window?
                    <br />Because it couldn&apos;t handle the pressure of being <span className={isChatMode && activeTab === "terminal" ? 'text-gray-100' : 'text-green-400'}>too open!</span>&rdquo;
                  </p>
                )}
              </div>
              
              <p className={`text-sm italic
                ${isChatMode && activeTab === "terminal" ? 'text-gray-400/70' : 'text-green-500/70'}`}>
                Achievement Unlocked: {isClosing ? "Terminal Escape Artist" : "Found the bottom of the rabbit hole!"}
              </p>
            </div>
          </div>
          
          <button 
            className={`mt-10 px-6 py-3 rounded-full shadow-lg cursor-pointer transition-colors font-bold flex items-center space-x-2
              ${isChatMode && activeTab === "terminal" 
                ? 'bg-gray-400 text-gray-900 hover:bg-gray-300' 
                : 'bg-green-500 text-black hover:bg-green-400'}`}
            onClick={handleRestore}
          >
            <span>{isClosing ? "Return to Terminal" : "Restore Terminal"}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 3 21 3 21 8"></polyline>
              <line x1="4" y1="20" x2="21" y2="3"></line>
            </svg>
          </button>
        </div>
      )}

      {!isMinimized && (
        <AchievementNotification
          achievement={lastUnlockedAchievement}
          onClose={clearLastUnlockedAchievement}
          onNavigate={handleNavigateToAchievements}
          isMobile={isMobile}
        />
      )}

      <style jsx global>{`
        .chat-mode {
          box-shadow: 0 0 15px rgba(156, 163, 175, 0.2);
        }
        
        .chat-mode:hover {
          box-shadow: 0 0 20px rgba(156, 163, 175, 0.3);
        }
        
        .chat-terminal-content .terminal-line {
          color: #d1d5db !important;
        }
        
        .chat-terminal-content .command-prompt {
          color: #9ca3af !important;
        }
        
        .chat-terminal-content .command-text {
          color: #e5e7eb !important;
        }
        
        .chat-cursor {
          background-color: #9ca3af !important;
        }
        
        .chat-tabs [data-state="inactive"] {
          color: #9ca3af !important;
        }
        
        .chat-tabs [data-state="inactive"]:hover {
          color: #d1d5db !important;
          background-color: rgba(75, 85, 99, 0.2) !important;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
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

