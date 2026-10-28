"use client"

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react"
import { usePathname } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TerminalInput, { TerminalInputRef } from "./terminal-input"
import TerminalOutput from "./terminal-output"
import Projects from "./projects"
import Contact from "./contact"
import About from "./about"
import AsciiArt from "./ascii-art"
import WelcomeBanner from "./terminal-welcome"
import ChatIntro from "./chat-intro"
import MyAchievements from "./my-achievements"
import YourAchievements from "./your-achievements"
import AchievementNotification from "@/components/achievement-notification"
import { executeCommand } from "@/lib/commands"
import { contact, cv } from "@/lib/profile-extras"
import { hasTextSelection } from "@/lib/utils"
import { isCoarsePointer, PHONE_WIDTH } from "@/lib/media"
import { tabScroller } from "@/lib/scroll"
import { usePublishHeight } from "@/lib/use-publish-height"
import ChatFollowUps from "./chat-follow-ups"
import TerminalDock from "./terminal-dock"
import CommandSheet from "./command-sheet"
import PageMenu from "./page-menu"
import { tabForPath, pathForTab, opensNewTab, projectSlugForPath, returnToProjectList } from "@/lib/routes"
import { titleForPath } from "@/lib/seo"
import { Maximize2, Minimize2, Menu, MessageSquare, Terminal as TerminalIcon } from "lucide-react"
import { AchievementsProvider, useAchievements } from "@/lib/achievements-context"
import type { Command, ChatMessage } from '@/lib/types'
import { streamChat } from "@/lib/ai/chat-client"
import { displayMessageFor } from "@/lib/ai/messages"
import { renderTerminalMarkdown } from "@/lib/ai/markdown"
import StreamingMessage, { type StreamingMessageRef } from "@/components/streaming-message"
import React from "react"

// The full tab labels need ~920px, but the tab bar shows from 768px (iPad
// portrait), where it overflowed and pushed "Your Achievements" off-screen.
// Short labels until lg, where the full ones fit.
function TabLabel({ short, full }: { short: string; full: string }) {
  return (
    <>
      <span className="lg:hidden">{short}</span>
      <span className="hidden lg:inline">{full}</span>
    </>
  )
}

// A tab that is also a link to the section's own page (/projects, /about,
// /achievements). The tab bar is in the server HTML, so these links are how
// crawlers reach those pages. A plain click only switches the tab; cmd/ctrl/shift
// or middle click opens the page.
//
// Pressing the tab that is already open calls onReselect: Radix runs these
// handlers before its own, so data-state still says whether the tab was open.
function PageTab({
  href,
  onReselect,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsTrigger> & { href: string; onReselect?: () => void }) {
  const reselect = (event: React.SyntheticEvent<HTMLElement>) => {
    if (event.currentTarget.dataset.state === "active") onReselect?.()
  }
  return (
    <TabsTrigger
      {...props}
      asChild
      // Radix switches tabs on mousedown and skips it when the event is prevented.
      onMouseDown={(event) => {
        if (opensNewTab(event)) event.preventDefault()
        else if (event.button === 0) reselect(event)
      }}
      onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") reselect(event) }}
      onClick={(event) => { if (!opensNewTab(event)) event.preventDefault() }}
    >
      {/* type: drop the type="button" Radix gives triggers, which is invalid on a link */}
      <a href={href} type={undefined}>{children}</a>
    </TabsTrigger>
  )
}

function TerminalContent(): React.ReactNode {
  // The opening banner, seeded as initial state rather than in a mount effect so
  // it is in the server HTML: crawlers that never run JavaScript see the name,
  // role and links, and the input no longer jumps down when the page hydrates.
  // The arrow defers handleCommandClick (declared further down) to click time.
  const welcomeEntry = () => ({
    command: "",
    output: [
      <AsciiArt key="ascii-art" />,
      <WelcomeBanner key="welcome" onRun={(command: string) => handleCommandClick(command)} />,
    ],
    timestamp: new Date(),
    isError: false,
  })
  const [history, setHistory] = useState<Array<{ command: string; output: React.ReactNode[]; timestamp: Date; isError: boolean }>>(() => [welcomeEntry()])
  const pathname = usePathname()
  // The address picks the opening tab: /projects, /about and /achievements open
  // their tab, and anything else opens the terminal. usePathname works during
  // server rendering too, so that tab's content is in the server HTML.
  const [activeTab, setActiveTabState] = useState<string>(() => tabForPath(pathname) ?? "terminal")
  // The Projects tab keeps its place, as tabs in apps do: leaving it notes the
  // page it was on, how far down that was scrolled and how many steps back the
  // cards are, and choosing the tab again reopens that page there. Held in memory
  // only, so a reload or a new visit opens what the address says.
  const projectsPlaceRef = useRef<{ path: string; depth: number; scroll: number } | null>(null)
  // Every tab change goes through here so the address always names what is on
  // screen. replaceState, not pushState: switching tabs should not fill the Back
  // button's history.
  const setActiveTab = useCallback((tab: string) => {
    const current = window.location.pathname
    const state = window.history.state
    const onProjects = tabForPath(current) === "projects"
    if (tab === "projects" && onProjects) {
      // An open project keeps its /projects/<slug> address while the tab stays selected.
      setActiveTabState(tab)
      return
    }
    const place = projectsPlaceRef.current
    if (tab === "projects" && place) {
      // The steps back to the cards only hold on the history entry the tab was left from.
      const projectDepth = state?.leftProjectsHere ? place.depth : 0
      window.history.replaceState({ projectDepth, projectsScroll: place.scroll }, "", place.path)
      // The pathname effect below opens the tab once the router has this address.
      // Opening it here would mount Projects on the old one and show the cards for
      // a moment before the project: Next applies the address in a transition.
      return
    }
    if (onProjects) {
      projectsPlaceRef.current = {
        path: current,
        depth: state?.projectDepth ?? 0,
        scroll: tabScroller(document.querySelector<HTMLElement>("[data-tab-scroll]"))?.top ?? 0,
      }
    }
    setActiveTabState(tab)
    const target = pathForTab(tab)
    // Mark the entry the Projects tab was left from; moving between the other tabs keeps the mark.
    const leftProjectsHere = tab !== "projects" && (onProjects || Boolean(state?.leftProjectsHere))
    if (current !== target) window.history.replaceState(leftProjectsHere ? { leftProjectsHere } : null, "", target)
  }, [])

  // Choosing the tab that is already open: from a project, the Projects tab goes
  // back to the cards, as tapping the current tab returns to its top in apps.
  const reselectTab = useCallback((tab: string) => {
    if (tab === "projects" && projectSlugForPath(window.location.pathname)) returnToProjectList()
  }, [])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [animationClass, setAnimationClass] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isChatMode, setIsChatMode] = useState(false)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [isBotResponding, setIsBotResponding] = useState(false)
  const streamingRef = useRef<StreamingMessageRef>(null)
  const abortRef = useRef<AbortController | null>(null)
  // Guards against a late stream completion resurrecting a chat the user already exited.
  const requestGenRef = useRef(0)
  // Date.now() collides when two entries commit in the same millisecond.
  const messageKeyRef = useRef(0)
  const terminalRef = useRef<HTMLDivElement>(null)
  const outputEndRef = useRef<HTMLDivElement>(null)
  const terminalInputRef = useRef<TerminalInputRef>(null)
  // The answer streamed so far, which Stop keeps.
  const streamedTextRef = useRef("")
  // Set when a command runs: its output is shown even if the visitor had
  // scrolled up, which otherwise holds the view where it is.
  const revealNextOutputRef = useRef(false)
  // Every tap or click on a command lands here: it types itself into the
  // prompt and runs. Stable, because history entries keep the handlers they
  // were rendered with.
  const runCommand = useCallback((command: string) => {
    terminalInputRef.current?.run(command)
  }, [])
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

  // Initial setup on component mount
  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])

  // Back and Forward change the address without a click: follow it to the tab it
  // names, and keep the browser tab's title the one that page's metadata gives.
  // Tabs without an address of their own stay open while the address is /.
  useEffect(() => {
    const routeTab = tabForPath(pathname)
    setActiveTabState((current) => routeTab ?? (pathForTab(current) === "/" ? current : "terminal"))
    document.title = titleForPath(pathname)
  }, [pathname])

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
  }, [executeSecretCommand, setActiveTab]);

  // Phones have no window to make fullscreen: the terminal is the page there,
  // and the page scrolls. Shrinking a fullscreen desktop window to phone width
  // leaves fullscreen, which also locks the page's scrolling.
  useEffect(() => {
    const checkIfMobile = () => {
      const isMobileNow = window.innerWidth < 768
      setIsMobile(isMobileNow)
      if (isMobileNow && isFullscreen) setIsFullscreen(false)
    }
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    return () => {
      window.removeEventListener('resize', checkIfMobile)
    }
  }, [isFullscreen])

  // How far the on-screen keyboard reaches over the page, as --kb on the root,
  // and data-kb-open while it is up. The phone's pinned prompt rises by --kb
  // and the dock steps aside. On iOS the keyboard covers the page without
  // resizing it, so the prompt has to move itself; Android resizes the page
  // (interactive-widget in app/layout.tsx) and --kb stays near 0 there.
  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return
    const root = document.documentElement
    let frame = 0
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const kb = Math.max(0, Math.round(window.innerHeight - viewport.height - viewport.offsetTop))
        root.style.setProperty("--kb", `${kb}px`)
        root.toggleAttribute("data-kb-open", kb > 120)
      })
    }
    update()
    viewport.addEventListener("resize", update)
    viewport.addEventListener("scroll", update)
    // iOS 26 can leave the viewport offset stale after the keyboard closes.
    window.addEventListener("focusout", update)
    window.addEventListener("pageshow", update)
    return () => {
      cancelAnimationFrame(frame)
      viewport.removeEventListener("resize", update)
      viewport.removeEventListener("scroll", update)
      window.removeEventListener("focusout", update)
      window.removeEventListener("pageshow", update)
      root.style.removeProperty("--kb")
      root.removeAttribute("data-kb-open")
    }
  }, [])

  // `clear` resets the transcript to the opening banner.
  const initializeTerminal = () => {
    setHistory([welcomeEntry()])
  }

  // Called on every streamed repaint. Uses "auto" rather than "smooth" (a
  // restarting smooth animation per frame looks broken) and stays put if the
  // user has scrolled up to re-read something.
  // Auto-scrolling is only welcome when the user is already following along at
  // the bottom. If they have scrolled up to read something, moving the view is
  // an interruption.
  // The transcript's own box on larger screens, the page on a phone (lib/scroll.ts).
  const transcriptScroller = useCallback(
    () => tabScroller(outputEndRef.current?.closest<HTMLElement>("[data-terminal-scroll]")),
    []
  )

  const isPinnedToBottom = useCallback(() => transcriptScroller()?.atBottom() ?? true, [transcriptScroller])

  // New output arrived below while the visitor was reading further up: the
  // "new reply" button offers the way down instead of the view jumping there.
  const [hasUnseenOutput, setHasUnseenOutput] = useState(false)

  const scrollTranscriptToEnd = useCallback((behavior: ScrollBehavior = "smooth") => {
    const scroller = transcriptScroller()
    scroller?.el.scrollTo({ top: scroller.el.scrollHeight, behavior })
    setHasUnseenOutput(false)
  }, [transcriptScroller])

  const followStream = useCallback(() => {
    const scroller = transcriptScroller()
    if (!scroller) return
    if (!scroller.atBottom()) {
      setHasUnseenOutput(true)
      return
    }
    scroller.top = scroller.el.scrollHeight
  }, [transcriptScroller])

  // Reaching the end by scrolling clears the button.
  useEffect(() => {
    if (!hasUnseenOutput) return
    const scroller = transcriptScroller()
    if (!scroller) return
    const target = scroller.page ? window : scroller.el
    const onScroll = () => {
      if (scroller.atBottom()) setHasUnseenOutput(false)
    }
    target.addEventListener("scroll", onScroll, { passive: true })
    return () => target.removeEventListener("scroll", onScroll)
  }, [hasUnseenOutput, transcriptScroller])

  useEffect(() => {
    // While streaming, followStream owns the scroll position frame by frame;
    // a competing smooth animation here fights it for the whole response.
    if (isBotResponding) return
    // Only follow new output if the user hasn't scrolled up to read something,
    // or has just run a command.
    const reveal = revealNextOutputRef.current
    revealNextOutputRef.current = false
    if (!reveal && !isPinnedToBottom()) {
      // An answer finished while the visitor was reading higher up.
      if (isChatMode) setHasUnseenOutput(true)
      return
    }
    // Scroll the transcript to the bottom when history changes: its own box on
    // a larger screen (scrollIntoView also scrolled the page, which on a short
    // screen pushed the window's title bar and tabs off the top), the page on a
    // phone, where the prompt is pinned at the bottom anyway.
    scrollTranscriptToEnd()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, activeTab, isBotResponding, isPinnedToBottom, scrollTranscriptToEnd])

  // Responses are committed as a JSX element, never a raw string:
  // TerminalOutput.renderLine() rewrites bare strings, turning words like
  // "projects" into clickable commands and bare URLs into links. A full answer
  // carries the question it answers, which picks its follow-up suggestions.
  const commitAssistant = (content: string, tone: "normal" | "soft" | "error", question?: string) => {
    const key = `chat-${messageKeyRef.current++}`;
    const label = tone === "error" ? "Chatbot Error:" : "Gallillio Assistant:";
    const bodyClass =
      tone === "error" ? "text-red-400" : tone === "soft" ? "text-amber-300" : "";
    setHistory(prev => [
      ...prev,
      {
        command: "",
        output: [
          <div key={key} className={`whitespace-pre-wrap font-normal text-sm ${bodyClass}`}>
            {renderTerminalMarkdown(
              content,
              <span className="text-purple-400">{label} </span>
            )}
          </div>,
          ...(question !== undefined
            ? [<ChatFollowUps key={`${key}-next`} question={question} answer={content} onAsk={runCommand} />]
            : []),
        ],
        timestamp: new Date(),
        isError: tone === "error"
      }
    ]);
  };

  // Stops the answer being written and keeps what has arrived, staying in
  // chat. Ctrl+C leaves chat altogether; this is the touch screen's way out of
  // a long answer.
  const stopResponse = () => {
    if (!isBotResponding) return;
    const partial = streamedTextRef.current;
    requestGenRef.current++;
    abortRef.current?.abort();
    abortRef.current = null;
    streamingRef.current?.reset();
    setIsBotResponding(false);
    if (partial.trim()) {
      setChatHistory(prevChat => [...prevChat, { role: 'model', content: partial }]);
      commitAssistant(partial, "normal");
    }
    setHistory(prev => [
      ...prev,
      {
        command: "",
        output: [<span key={`stopped-${messageKeyRef.current++}`} className="text-gray-500">^C answer stopped</span>],
        timestamp: new Date(),
        isError: false
      }
    ]);
  };

  const handleCommand = async (input: string) => {
    const trimmedInput = input.trim();
    // Whatever the visitor just ran is what they want to see, even if they
    // had scrolled up to reread something before tapping it.
    revealNextOutputRef.current = true;

    if (isChatMode) {
      if (trimmedInput.toLowerCase() === 'exit') {
        requestGenRef.current++;
        abortRef.current?.abort();
        abortRef.current = null;
        streamingRef.current?.reset();
        setIsBotResponding(false);
        setIsChatMode(false);
        setChatHistory([]);
        setHistory(prev => [
          ...prev,
          {
            command: trimmedInput,
            output: ["Exiting chat mode. Returning to terminal."],
            timestamp: new Date(),
            isError: false
          }
        ]);
        if (terminalInputRef.current) {
          terminalInputRef.current.focus();
        }
        return;
      }

      // Add user's message to history immediately
      const newUserMessage: ChatMessage = { role: 'user', content: trimmedInput };
      setChatHistory(prevChat => [...prevChat, newUserMessage]);
      setHistory(prev => [
        ...prev,
        {
          command: trimmedInput, 
          output: [], // No direct output for user's chat message in terminal history, it's in chat UI
          timestamp: new Date(),
          isError: false
        }
      ]);
      
      setIsBotResponding(true); // Disable input

      const generation = ++requestGenRef.current;
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      streamingRef.current?.reset();

      streamedTextRef.current = "";

      await streamChat(
        { message: trimmedInput, history: chatHistory, signal: abortRef.current.signal },
        {
          onDelta: (text) => {
            streamedTextRef.current += text;
            streamingRef.current?.append(text);
          },
          onDone: async (full) => {
            if (generation !== requestGenRef.current) return;
            await streamingRef.current?.finish();
            if (generation !== requestGenRef.current) return;
            setChatHistory(prevChat => [...prevChat, { role: 'model', content: full }]);
            commitAssistant(full, "normal", trimmedInput);
            streamingRef.current?.reset();
          },
          onError: async (error) => {
            if (generation !== requestGenRef.current) return;
            await streamingRef.current?.finish();
            if (generation !== requestGenRef.current) return;
            // Keep whatever already streamed — a stream that died after 40 tokens
            // should not throw those 40 tokens away.
            if (error.partial) {
              setChatHistory(prevChat => [...prevChat, { role: 'model', content: error.partial }]);
              commitAssistant(error.partial, "normal");
            }
            // Quota, overload and misconfiguration are Ahmed's problem, not the
            // visitor's — those read as the assistant talking, not as a red error.
            // The precise server message stays in the console and the network tab.
            console.error("[chat]", error.code, error.message);
            const display = displayMessageFor(error.code, error.message);
            if (!error.partial || display.tone === "error") {
              commitAssistant(display.text, display.tone === "error" ? "error" : "soft");
            }
            streamingRef.current?.reset();
          },
        }
      );

      if (generation === requestGenRef.current) {
        setIsBotResponding(false); // Re-enable input
        if (terminalInputRef.current) {
          terminalInputRef.current.focus();
        }
      }
      return; // Chat mode handled, exit function
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
      
      
      return
    }

    markCommandExecuted()

    const newCommand: Command = {
      command: trimmedInput,
      timestamp: new Date(),
    }

    if (trimmedInput.toLowerCase() === "contact") {
      const contactInfo = [
        `Email: <email>${contact.email}</email>`,
        `Phone: ${contact.phone}`,
        `Location: ${contact.location}`,
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
      
      
      return;
    }

    const response = await executeCommand(trimmedInput)

    if (response.chatMode) {
      setIsChatMode(true)
      activateChatMode()
      response.output = [
        <ChatIntro key="chat-intro" onAsk={runCommand} />,
      ]
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
      link.href = cv.path
      link.download = cv.downloadName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      downloadCV()
    }

    setHistory((prev) => [...prev, { ...newCommand, ...response, isError: response.isError ?? false }])
    
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

  // A click anywhere in the output types into the prompt, as in a terminal. Not
  // on a touch screen: there it would open the keyboard on every stray tap and
  // every scroll that ends in one, so a finger focuses the prompt by tapping
  // the prompt itself.
  const focusInput = useCallback(() => {
    // This runs on every click anywhere in the output. Focusing an input
    // collapses the document selection, so bail out while the user is
    // selecting text — otherwise double-click-to-select can never work.
    if (hasTextSelection() || isCoarsePointer()) return;

    terminalInputRef.current?.focus();
  }, [terminalInputRef]);

  useEffect(() => {
    if (activeTab === "terminal") {
      setTimeout(() => {
        focusInput();
      }, 0);
    }
  }, [activeTab, focusInput])

  const handleNavigateToAchievements = () => {
    setActiveTab("your-achievements")
    clearLastUnlockedAchievement()
  }

  const handleCommandClick = runCommand

  // Each tab's height. Desktop: 70% of the screen in the window, or the whole
  // screen in fullscreen. A phone: no height at all, the content runs on and the
  // page scrolls. A touch iPad: the terminal fills the screen and the tab fills
  // what the header and dock leave (a flex column, see the window's classes).
  // All media queries, not isMobile: the server can't know the screen, and a
  // height decided after hydration made the page jump (CLS 0.45 on a phone).
  const contentHeight = isFullscreen && !isMobile
    ? "h-[calc(100vh-120px)]"
    : "md:h-[70vh] md:coarse:h-full";
  // A tab's own scroll box, which a phone gives up for the page's (lib/scroll.ts).
  // overflow-x clip rather than hidden on a phone: clip makes no scroll box, so
  // the header and prompt can still pin to the screen.
  const tabBoxClass = "max-md:overflow-y-visible max-md:overflow-x-clip md:coarse:min-h-0"

  // A phone's two menus, one open at a time: the pages from the section
  // bar's ☰ (components/page-menu.tsx), and the commands from the dock's ⋯
  // (components/command-sheet.tsx).
  const [menu, setMenu] = useState<"pages" | "commands" | null>(null)
  const openPages = useCallback(() => setMenu("pages"), [])
  const openCommands = useCallback(() => setMenu("commands"), [])
  const closeMenu = useCallback(() => setMenu(null), [])

  const handleTabChange = (value: string) => {
    if (value === activeTab) reselectTab(value)
    else setActiveTab(value)
  }

  // A command chosen outside the terminal tab runs in the terminal: open it,
  // then give its prompt, which mounts with the tab, a beat to appear.
  // In chat, a command from the dock or the list would go to the assistant as a
  // question; leave chat first (exit itself is the dock's way out of chat).
  const runInTerminal = (command: string) => {
    const leaveChat = isChatMode && command !== "exit"
    if (leaveChat) handleCommand("exit")
    if (activeTab === "terminal" && !leaveChat) {
      runCommand(command)
      return
    }
    if (activeTab !== "terminal") setActiveTab("terminal")
    setTimeout(() => runCommand(command), 60)
  }

  // On a phone the tabs share the page's scroll, so a new tab starts at its top
  // (the Projects tab then restores its own place), and the terminal at its
  // prompt, the end of the transcript.
  const previousTabRef = useRef(activeTab)
  useLayoutEffect(() => {
    if (previousTabRef.current === activeTab) return
    previousTabRef.current = activeTab
    if (!window.matchMedia(PHONE_WIDTH).matches) return
    if (activeTab === "terminal") requestAnimationFrame(() => scrollTranscriptToEnd("auto"))
    else if (activeTab !== "projects") window.scrollTo(0, 0)
  }, [activeTab, scrollTranscriptToEnd])

  // Heights for whatever has to clear the pinned bars (lib/use-publish-height.ts).
  const headerRef = useRef<HTMLDivElement>(null)
  const titleBarRef = useRef<HTMLDivElement>(null)
  const dockRef = useRef<HTMLElement>(null)
  const promptRef = useRef<HTMLDivElement>(null)
  const layoutKey = `${activeTab}-${isMinimized}-${isClosing}`
  usePublishHeight(headerRef, "--terminal-header-h", layoutKey)
  usePublishHeight(titleBarRef, "--terminal-title-h", layoutKey)
  usePublishHeight(dockRef, "--terminal-dock-h", layoutKey)
  usePublishHeight(promptRef, "--terminal-prompt-h", layoutKey)

  const chatLook = isChatMode && activeTab === "terminal"

  return (
    <>
      <div
        ref={terminalRef}
        className={`bg-black transition-all duration-700 ease-in-out transform-gpu overflow-hidden
          ${chatLook ? 'border border-gray-400 rounded-lg chat-mode' : 'border border-green-500'}
          ${isMinimized || isClosing
            ? isMobile
              ? 'fixed inset-4 z-50 rounded-md shadow-xl'
              : 'w-full max-w-5xl 2xl:max-w-6xl rounded-md relative'
            : isFullscreen && !isMobile
              ? 'fixed inset-0 z-50 max-w-none rounded-none border-green-400'
              // Media queries, as for contentHeight. A phone: the terminal is the
              // page, a screen-tall column that grows and scrolls with it. Nothing
              // here may clip or transform, or the header, prompt and dock could
              // no longer pin to the screen. A touch iPad: the window fills the
              // screen, as fullscreen does on a desktop.
              : 'max-md:flex max-md:min-h-[100svh] max-md:w-full max-md:flex-col max-md:overflow-visible max-md:rounded-none max-md:border-0 max-md:transform-none md:w-full md:max-w-5xl 2xl:max-w-6xl md:rounded-md md:relative md:coarse:fixed md:coarse:inset-0 md:coarse:z-50 md:coarse:flex md:coarse:h-[100dvh] md:coarse:max-w-none md:coarse:flex-col md:coarse:rounded-none md:coarse:border-0'
          } ${animationClass} ${isMinimized || isClosing ? 'h-10 overflow-hidden' : ''}
          ${chatLook
            ? 'shadow-gray-400/30 hover:shadow-gray-400/50'
            : 'shadow-green-500/30 hover:shadow-green-500/50'} shadow-xl hover:shadow-2xl`}
        style={{
          transitionProperty: "all",
          transitionDuration: "700ms",
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)"
        }}
      >
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full max-md:flex max-md:flex-1 max-md:flex-col md:coarse:flex md:coarse:min-h-0 md:coarse:flex-1 md:coarse:flex-col"
        >
          {/* The title bar and the section bar, pinned together to the top of a
              phone's screen, under the status bar (safe-area padding). On a
              short screen (a phone on its side) only the section bar stays:
              .terminal-header in globals.css. */}
          <div
            ref={headerRef}
            className={`terminal-header shrink-0 max-md:sticky max-md:z-40 max-md:pt-[env(safe-area-inset-top)] ${chatLook ? 'bg-gray-800' : 'bg-gray-900'}`}
          >
            <div ref={titleBarRef} className={`flex items-center justify-between gap-3 px-4 py-2 cursor-default
              ${chatLook ? 'bg-gray-800 border-b border-gray-400' : 'bg-gray-900 border-b border-green-500'}`}>
              {/* Wider apart on touch screens, so each light's enlarged tap area
                  (.touch-hit) stays its own. */}
              <div className="flex shrink-0 space-x-2 coarse:space-x-5">
                <button
                  className="touch-hit group relative w-3 h-3 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
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
                  className="touch-hit group relative w-3 h-3 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
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
                  className="touch-hit group relative w-3 h-3 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
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
              {/* min-w-0 and truncate: on a 320px phone the title gives way
                  rather than run into the lights. */}
              <div
                className={`min-w-0 font-mono text-sm flex items-center gap-2 transition-colors duration-300
                  ${chatLook ? 'text-gray-300' : 'text-green-500'}`}
                onDoubleClick={isMinimized ? handleRestore : undefined}
              >
                {chatLook ? (
                  <>
                    <MessageSquare size={14} className="shrink-0 animate-pulse motion-reduce:animate-none" />
                    <span className="truncate">chat@Gallillio:~</span>
                  </>
                ) : (
                  <span className="truncate">portfolio@Gallillio:~</span>
                )}

                {/* Chat/terminal toggle for phones. Shown by a media query, like the
                    desktop buttons below, so the title bar doesn't rearrange on hydration. */}
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
                  className={`touch-hit md:hidden ml-2 p-1 rounded-md transition-colors duration-300
                    ${isChatMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-900 text-green-400 hover:bg-gray-800'}`}
                  title={isChatMode ? "Switch to command mode" : "Switch to chat mode"}
                  aria-label={isChatMode ? "Leave chat" : "Chat with my AI assistant"}
                >
                  {isChatMode ? (
                    <TerminalIcon size={14} aria-hidden="true" />
                  ) : (
                    <MessageSquare size={14} aria-hidden="true" />
                  )}
                </button>
              </div>
              {!isMinimized && (
                <div className="hidden md:flex gap-2 items-center">
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
                    className={`touch-hit p-1 rounded-md transition-colors duration-300 mr-2
                      ${isChatMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-900 text-green-400 hover:bg-gray-800'}`}
                    title={isChatMode ? "Switch to command mode" : "Switch to chat mode"}
                    aria-label={isChatMode ? "Leave chat" : "Chat with my AI assistant"}
                  >
                    {isChatMode ? (
                      <TerminalIcon size={16} aria-hidden="true" />
                    ) : (
                      <MessageSquare size={16} aria-hidden="true" />
                    )}
                  </button>
                  {/* A touch iPad is always full screen, so the button would do nothing there. */}
                  <button
                    onClick={toggleFullscreen}
                    aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                    title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                    className={`coarse:hidden transition-colors duration-300
                      ${chatLook ? 'text-gray-400 hover:text-gray-300' : 'text-green-500 hover:text-green-400'}`}
                  >
                    {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>
                </div>
              )}
            </div>

            {!isMinimized && (
              <div className={`w-full flex justify-between rounded-none overflow-x-auto
                ${chatLook ? 'bg-gray-800 border-b border-gray-400' : 'bg-gray-900 border-b border-green-500'}`}>
                {/* A phone's section bar: where you are, and a tap for every
                    page (components/page-menu.tsx), which drops down from
                    under it. The dock along the bottom has the main sections
                    one tap away, and its ⋯ has the commands. */}
                <button
                  type="button"
                  onClick={openPages}
                  aria-haspopup="dialog"
                  aria-label={`Pages. Now on ${chatLook ? "chat" : activeTab}`}
                  className={`md:hidden flex min-h-[44px] flex-grow items-center gap-2 px-3 text-left font-mono text-sm
                    ${chatLook ? 'text-gray-400 active:bg-gray-700' : 'text-green-500 active:bg-green-500/10'}`}
                >
                  <Menu size={20} aria-hidden="true" />
                  <span>
                    /{chatLook ? "chat" : activeTab}
                    <span className={`terminal-cursor ${chatLook ? 'chat-cursor' : ''}`}></span>
                  </span>
                </button>

                <div className="hidden md:block">
                  <TabsList className={`bg-transparent border-none rounded-none h-auto text-gray-400
                    ${chatLook ? 'chat-tabs' : ''}`}>
                    <TabsTrigger
                      value="terminal"
                      className={`custom-tab touch-optimized rounded-none border-r
                        ${chatLook
                          ? 'data-[state=active]:bg-black data-[state=active]:text-gray-300 border-gray-400'
                          : 'data-[state=active]:bg-black data-[state=active]:text-green-500 border-green-500'}`}
                    >
                      {chatLook ? (
                        <div className="flex items-center gap-1">
                          <MessageSquare size={14} />
                          Chat
                        </div>
                      ) : (
                        "Terminal"
                      )}
                    </TabsTrigger>
                    <PageTab
                      value="projects"
                      href="/projects"
                      onReselect={() => reselectTab("projects")}
                      className={`custom-tab touch-optimized rounded-none border-r
                        ${chatLook
                          ? 'data-[state=active]:bg-black data-[state=active]:text-gray-300 border-gray-400'
                          : 'data-[state=active]:bg-black data-[state=active]:text-green-500 border-green-500'}`}
                    >
                      Projects
                    </PageTab>
                    <PageTab
                      value="about"
                      href="/about"
                      className={`custom-tab touch-optimized rounded-none border-r
                        ${chatLook
                          ? 'data-[state=active]:bg-black data-[state=active]:text-gray-300 border-gray-400'
                          : 'data-[state=active]:bg-black data-[state=active]:text-green-500 border-green-500'}`}
                    >
                      <TabLabel short="About" full="About / Experience" />
                    </PageTab>
                    <TabsTrigger
                      value="contact"
                      className={`custom-tab touch-optimized rounded-none border-r
                        ${chatLook
                          ? 'data-[state=active]:bg-black data-[state=active]:text-gray-300 border-gray-400'
                          : 'data-[state=active]:bg-black data-[state=active]:text-green-500 border-green-500'}`}
                    >
                      <TabLabel short="Contact" full="Contact / CV" />
                    </TabsTrigger>
                    <PageTab
                      value="my-achievements"
                      href="/achievements"
                      className={`custom-tab touch-optimized rounded-none border-r
                        ${chatLook
                          ? 'data-[state=active]:bg-black data-[state=active]:text-gray-300 border-gray-400'
                          : 'data-[state=active]:bg-black data-[state=active]:text-green-500 border-green-500'}`}
                    >
                      <TabLabel short="Achievements" full="My Achievements / Publications / Certifications" />
                    </PageTab>
                  </TabsList>
                </div>

                <TabsList className={`bg-transparent border-none rounded-none h-auto ml-auto flex-grow hidden md:flex text-gray-400
                  ${chatLook ? 'chat-tabs' : ''}`}>
                  <TabsTrigger
                    value="your-achievements"
                    className={`custom-tab touch-optimized rounded-none w-full flex justify-end pr-6
                      ${chatLook
                        ? 'data-[state=active]:bg-black data-[state=active]:text-gray-300'
                        : 'data-[state=active]:bg-black data-[state=active]:text-green-500'}`}
                  >
                    <span>Your Achievements</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            )}
          </div>

          {!isMinimized && (
            <>
              <TabsContent
                value="terminal"
                className="p-0 m-0 max-md:flex max-md:flex-1 max-md:flex-col md:coarse:min-h-0 md:coarse:flex-1"
              >
                <div
                  data-terminal-scroll
                  className={`${contentHeight} ${tabBoxClass} overflow-y-auto overflow-x-auto p-4 pt-6 max-md:flex-1 max-md:pb-0 font-mono cursor-text custom-scrollbar transition-all duration-700 ease-in-out
                    ${isChatMode ? 'bg-gray-900 text-gray-300 chat-terminal-content' : 'bg-black text-green-500'}`}
                  onClick={focusInput}
                >
                  {isChatMode && (
                    <div className={`mb-6 p-3 rounded-lg border animate-fadeIn motion-reduce:animate-none ${isChatMode ? 'bg-gray-800/50 border-gray-500/30 text-gray-300' : 'bg-green-900/10 border-green-500/30 text-green-400'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare size={16} className="text-blue-400" />
                        <span className="font-semibold text-blue-400">Chat Mode Active</span>
                      </div>
                      <p className="text-sm">You&apos;re chatting with Ahmed&apos;s AI assistant. Ask anything about Ahmed or his work. Type <code className="bg-gray-700 px-1 rounded">exit</code> to return to terminal mode.</p>
                    </div>
                  )}
                  <TerminalOutput history={history} onCommandClick={handleCommandClick} isChatMode={isChatMode} />
                  <StreamingMessage ref={streamingRef} active={isBotResponding} onGrow={followStream} />
                  <div ref={outputEndRef} />
                  {/* More arrived below while the visitor read further up. Pinned
                      just above the prompt (and the dock, on a phone). */}
                  {hasUnseenOutput && (
                    <div className="sticky bottom-3 z-30 flex h-0 justify-center max-md:bottom-[calc(var(--terminal-dock-h,0px)+var(--terminal-prompt-h,0px)+0.75rem)]">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          scrollTranscriptToEnd()
                        }}
                        className="flex min-h-[40px] -translate-y-full items-center gap-1.5 rounded-full border border-blue-400/60 bg-gray-800 px-4 font-mono text-sm text-blue-200 shadow-lg shadow-black/60 active:bg-gray-700"
                      >
                        New reply <span aria-hidden="true">↓</span>
                      </button>
                    </div>
                  )}
                  {!isClosing && (
                    // A phone pins the prompt to the bottom of the screen, above
                    // the dock and, through --kb, above the keyboard (globals.css).
                    <div
                      ref={promptRef}
                      className={`terminal-prompt max-md:sticky max-md:z-20 max-md:-mx-4 max-md:px-4 max-md:pb-2 ${isChatMode ? 'max-md:bg-gray-900' : 'max-md:bg-black'}`}
                      style={{ bottom: "var(--terminal-dock-h, 0px)" }}
                    >
                      <TerminalInput
                        ref={terminalInputRef}
                        onCommand={handleCommand}
                        onStop={stopResponse}
                        isChatMode={isChatMode}
                        isBotResponding={isBotResponding}
                      />
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent
                value="projects"
                className="p-0 m-0 max-md:flex-1 md:coarse:min-h-0 md:coarse:flex-1"
              >
                <div
                  data-tab-scroll
                  className={`${contentHeight} ${tabBoxClass} overflow-y-auto transition-height duration-700 ease-in-out pt-2`}
                >
                  <Projects />
                </div>
              </TabsContent>

              <TabsContent
                value="about"
                className="p-0 m-0 max-md:flex-1 md:coarse:min-h-0 md:coarse:flex-1"
              >
                <div
                  className={`${contentHeight} ${tabBoxClass} overflow-y-auto transition-height duration-700 ease-in-out pt-2`}
                >
                  <About />
                </div>
              </TabsContent>

              <TabsContent
                value="contact"
                className="p-0 m-0 max-md:flex-1 md:coarse:min-h-0 md:coarse:flex-1"
              >
                <div
                  className={`${contentHeight} ${tabBoxClass} overflow-y-auto transition-height duration-700 ease-in-out pt-2`}
                >
                  <Contact />
                </div>
              </TabsContent>

              <TabsContent
                value="my-achievements"
                className="p-0 m-0 max-md:flex-1 md:coarse:min-h-0 md:coarse:flex-1"
              >
                <div
                  className={`${contentHeight} ${tabBoxClass} overflow-y-auto transition-height duration-700 ease-in-out pt-2`}
                >
                  <MyAchievements />
                </div>
              </TabsContent>

              <TabsContent
                value="your-achievements"
                className="p-0 m-0 max-md:flex-1 md:coarse:min-h-0 md:coarse:flex-1"
              >
                <div
                  className={`${contentHeight} ${tabBoxClass} overflow-y-auto transition-height duration-700 ease-in-out pt-2`}
                >
                  <YourAchievements />
                </div>
              </TabsContent>

              {/* The thumb's bar: every tab on a phone, the terminal tab on a
                  touch iPad (which has its tabs along the top for the rest). */}
              {!isClosing && (
                <TerminalDock
                  ref={dockRef}
                  activeTab={activeTab}
                  isChatMode={isChatMode}
                  onRun={runInTerminal}
                  onTab={handleTabChange}
                  onMore={openCommands}
                  onType={() => terminalInputRef.current?.focus()}
                  className={`shrink-0 max-md:sticky max-md:bottom-0 ${activeTab === "terminal" ? "hidden max-md:flex md:coarse:flex" : "hidden max-md:flex"}`}
                />
              )}
            </>
          )}
        </Tabs>
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

      <PageMenu
        open={menu === "pages"}
        onClose={closeMenu}
        activeTab={activeTab}
        isChatMode={isChatMode}
        onTab={handleTabChange}
        anchorRef={headerRef}
      />
      <CommandSheet open={menu === "commands"} onClose={closeMenu} onRun={runInTerminal} onPages={openPages} />

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

