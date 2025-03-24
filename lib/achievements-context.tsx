"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import { Code, Zap, Trophy, Star, Mail, Eye, Coffee, MessageSquare, Book, Award, ChevronsUp, Search, X, ArrowLeftRight } from "lucide-react"
import { projects } from "./projects"

// Define achievement types and categories
export enum AchievementCategory {
  EXPLORATION = "exploration",
  INTERACTION = "interaction",
  SECRET = "secret",
  PERSISTENCE = "persistence",
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  category: AchievementCategory
  isSecret?: boolean
  condition: (state: AchievementState, progress?: Record<string, AchievementProgress>, achievements?: Achievement[]) => boolean
  hint?: string
  unlocked?: boolean
  unlockedAt?: Date | null
}

// Achievement state interface
export interface AchievementState {
  projectsViewed: Set<string>
  commandsExecuted: Set<string>
  contactSent: boolean
  projectDemoClicked: boolean
  cvDownloaded: boolean
  tabsVisited: Set<string>
  secretCommandsExecuted: Set<string>
  visitDuration: number
  lateNightVisit: boolean
  totalCommands: number
  projectCodesClicked: Set<string>
  terminalClosed: boolean
  terminalMinimized: boolean
}

// User progress for an individual achievement
export interface AchievementProgress {
  achievementId: string
  unlocked: boolean
  unlockedAt?: Date
  viewed: boolean
}

// Context type definition
export interface AchievementsContextType {
  achievements: Achievement[]
  unlockedAchievements: Achievement[]
  lastUnlockedAchievement: Achievement | null
  clearLastUnlockedAchievement: () => void
  viewAchievement: (id: string) => void
  
  // Achievement progress tracking
  achievementProgress: Record<string, AchievementProgress>
  getProgress: (achievementId: string) => number
  getProgressDetails: (achievementId: string) => { current: number; target: number }
  
  // Track actions for unlocking achievements
  visitTab: (tabId: string) => void
  executeSecretCommand: (commandId: string) => void
  viewProject: (projectId: string) => void
  sendContact: () => void
  clickProjectDemo: () => void
  downloadCV: () => void
  clickProjectCode: (projectId: string) => void
  registerTerminalClosed: () => void
  registerTerminalMinimized: () => void
  
  // Additional methods for terminal component
  markCommandExecuted: (command?: string) => void
  executeCommand: (command: string) => void
  projectCodeClicked: (projectId: string) => void
  
  // Unlock all achievements at once (cheat code)
  unlockAllAchievements: () => void

  // Enable Night Owl achievement
  enableNightOwl: () => void
}

// Default context value
const AchievementsContext = createContext<AchievementsContextType | undefined>(undefined)

// Define the list of achievements
const achievementsList: Achievement[] = [
  // Regular achievements
  {
    id: "first_step",
    title: "First Step",
    description: "Execute your first command in the terminal",
    icon: <Trophy className="h-6 w-6" />,
    category: AchievementCategory.INTERACTION,
    condition: (state) => state.totalCommands >= 1,
    hint: "Try typing a command in the terminal",
  },
  {
    id: "terminal_master",
    title: "Terminal Master",
    description: "Execute at least 7 different terminal commands",
    icon: <Code className="h-6 w-6" />,
    category: AchievementCategory.INTERACTION,
    condition: (state) => state.commandsExecuted.size >= 7,
    hint: "Try using different commands in the terminal",
  },
  {
    id: "interested_arent_we",
    title: "Interested Aren't We",
    description: "Downloaded my CV to learn more about me",
    icon: <Book className="h-6 w-6" />,
    category: AchievementCategory.INTERACTION,
    condition: (state) => state.cvDownloaded,
    hint: "Try downloading my CV from the Contact tab or using the cv command",
  },
  {
    id: "contact_made",
    title: "Contact Made",
    description: "Sent a message through the contact form or clicked on my email",
    icon: <Mail className="h-6 w-6" />,
    category: AchievementCategory.INTERACTION,
    condition: (state) => state.contactSent,
    hint: "Try sending a message through the contact form or clicking on my email",
  },
  {
    id: "persistent_visitor",
    title: "Persistent Visitor",
    description: "Spent more than 5 minutes exploring the portfolio",
    icon: <Zap className="h-6 w-6" />,
    category: AchievementCategory.PERSISTENCE,
    condition: (state) => state.visitDuration >= 5,
    hint: "Spend more time exploring the site",
  },
  {
    id: "achievement_hunter",
    title: "Achievement Hunter",
    description: "Unlocked at least 5 achievements",
    icon: <Award className="h-6 w-6" />,
    category: AchievementCategory.PERSISTENCE,
    condition: (state, progress) => {
      if (!progress) return false;
      return Object.values(progress).filter(a => a.unlocked).length >= 5;
    },
    hint: "Unlock more achievements to get this one",
  },
  {
    id: "site_explorer",
    title: "Site Explorer",
    description: "Visited all sections of the portfolio",
    icon: <Search className="h-6 w-6" />,
    category: AchievementCategory.EXPLORATION,
    condition: (state) => {
      const requiredTabs = ["projects", "about", "contact", "my-achievements", "your-achievements", "terminal"];
      return requiredTabs.every(tab => state.tabsVisited.has(tab));
    },
    hint: "Try visiting all the tabs in the site",
  },
  {
    id: "demo_explorer",
    title: "Demo Explorer",
    description: "Clicked on a project demo link",
    icon: <Eye className="h-6 w-6" />,
    category: AchievementCategory.INTERACTION,
    condition: (state) => state.projectDemoClicked,
    hint: "Try clicking on a project's demo link",
  },
  
  // Secret achievements
  {
    id: "hello_friend",
    title: "Hello Friend!",
    description: "Said hello to the terminal, it's nice to be friendly",
    icon: <MessageSquare className="h-6 w-6" />,
    category: AchievementCategory.SECRET,
    isSecret: true,
    hint: "Try being friendly to the terminal with a greeting.",
    condition: (state) => 
      // "hello", "hi", "hey", "hii", "heyy", "whats up", "what's up
      state.secretCommandsExecuted.has('hello') ||
      state.secretCommandsExecuted.has('hi') ||
      state.secretCommandsExecuted.has('hey') ||
      state.secretCommandsExecuted.has('hii') ||
      state.secretCommandsExecuted.has('heyy') ||
      state.secretCommandsExecuted.has('whats up') ||
      state.secretCommandsExecuted.has('whats up'),
  },
  {
    id: "night_owl",
    title: "Night Owl",
    description: "Visited the portfolio during late hours (7 PM - 4 AM)",
    icon: <Star className="h-6 w-6" />,
    category: AchievementCategory.SECRET,
    isSecret: true,
    hint: "Some achievements can only be unlocked at... None working hours...",
    condition: (state) => state.lateNightVisit,
  },
  {
    id: "project_expert",
    title: "Project Expert",
    description: "Clicked on all project GitHub links. Great Effort!",
    icon: <Coffee className="h-6 w-6" />,
    category: AchievementCategory.SECRET,
    isSecret: true,
    // hint: "Explore all the projects' code repositories",
    hint: "Since you're interested in my projects, you should check out how they're built! All of them.",
    condition: (state) => state.projectCodesClicked.size >= projects.filter(project => project.code_available).length,
  },
  {
    id: "terminal_escape_artist",
    title: "Terminal Escape Artist",
    description: "Tried to close the terminal, but couldn't escape!",
    icon: <X className="h-6 w-6" />,
    category: AchievementCategory.SECRET,
    isSecret: true,
    hint: "Oh I thought these buttons were just for decoration.",
    condition: (state) => state.terminalClosed,
  },
  {
    id: "found_the_bottom_of_the_rabbit_hole",
    title: "Found the Bottom of the Rabbit Hole",
    description: "Discovered the secret minimized terminal screen",
    icon: <ArrowLeftRight className="h-6 w-6" />,
    category: AchievementCategory.SECRET,
    isSecret: true,
    hint: "There's more than one way to hide a terminal...",
    condition: (state) => state.terminalMinimized,
  },
  {
    id: "portfolio_grandmaster",
    title: "Portfolio Grandmaster",
    description: "Unlocked all other achievements",
    icon: <ChevronsUp className="h-6 w-6" />,
    category: AchievementCategory.SECRET,
    isSecret: true,
    hint: "The ultimate achievement for the Completionists",
    condition: (state, progress, achievements) => {
      if (!progress || !achievements) return false;
      const otherAchievements = achievements.filter(a => a.id !== "portfolio_grandmaster");
      return otherAchievements.every(a => progress[a.id]?.unlocked);
    },
  }
];

// Storage keys
const ACHIEVEMENT_PROGRESS_KEY = "portfolio-achievement-progress";
const ACHIEVEMENT_STATE_KEY = "portfolio-achievement-state";

// Global store for achievements to make them accessible outside React components
let achievementsStore: Achievement[] = achievementsList.map(achievement => ({
  ...achievement,
  unlocked: false,
  unlockedAt: null,
}));

// Function to update the global store when achievements change
function updateAchievementsStore(achievements: Achievement[], unlockedAchievements: Achievement[]) {
  achievementsStore = achievements.map(achievement => ({
    ...achievement,
    unlocked: unlockedAchievements.some(ua => ua.id === achievement.id),
    unlockedAt: unlockedAchievements.find(ua => ua.id === achievement.id)?.unlockedAt || null,
  })) as Achievement[];
}

// Function to get achievements data for non-React contexts
export function getAchievementsData(): Achievement[] {
  return [...achievementsStore];
}

export function AchievementsProvider({ children }: { children: ReactNode }) {
  // Achievement progress tracking
  const [achievementProgress, setAchievementProgress] = useState<Record<string, AchievementProgress>>({});

  // State tracking for various achievement conditions
  const [state, setState] = useState<AchievementState>({
    projectsViewed: new Set<string>(),
    commandsExecuted: new Set<string>(),
    contactSent: false,
    projectDemoClicked: false,
    cvDownloaded: false,
    tabsVisited: new Set<string>(),
    secretCommandsExecuted: new Set<string>(),
    visitDuration: 0,
    lateNightVisit: false,
    totalCommands: 0,
    projectCodesClicked: new Set<string>(),
    terminalClosed: false,
    terminalMinimized: false
  });

  // Last unlocked achievement for notification
  const [lastUnlockedAchievement, setLastUnlockedAchievement] = useState<Achievement | null>(null);
  
  // Initialize achievements on first load
  useEffect(() => {
    // Check if it's late night (10 PM - 5 AM)
    const checkLateNight = () => {
      const hour = new Date().getHours();
      return hour >= 19 || hour < 4;
    };

    // Load achievement progress from localStorage
    const loadAchievementProgress = () => {
      if (typeof window === "undefined") return {};
      
      try {
        const savedProgress = localStorage.getItem(ACHIEVEMENT_PROGRESS_KEY);
        if (savedProgress) {
          const parsed = JSON.parse(savedProgress);
          
          // Convert dates from strings back to Date objects
          Object.values(parsed).forEach((progress) => {
            const achievementProgress = progress as AchievementProgress;
            if (achievementProgress.unlockedAt) {
              achievementProgress.unlockedAt = new Date(achievementProgress.unlockedAt);
            }
          });
          
          return parsed;
        }
      } catch (e) {
        console.error("Error loading achievement progress:", e);
      }
      
      return {};
    };

    // Load achievement state from localStorage
    const loadAchievementState = () => {
      if (typeof window === "undefined") return null;
      
      try {
        const savedState = localStorage.getItem(ACHIEVEMENT_STATE_KEY);
        if (savedState) {
          const parsed = JSON.parse(savedState);
          
          // Convert sets from arrays back to Sets
          return {
            ...parsed,
            projectsViewed: new Set(parsed.projectsViewed || []),
            commandsExecuted: new Set(parsed.commandsExecuted || []),
            tabsVisited: new Set(parsed.tabsVisited || []),
            secretCommandsExecuted: new Set(parsed.secretCommandsExecuted || []),
            projectCodesClicked: new Set(parsed.projectCodesClicked || []),
            // Update late night status on load
            lateNightVisit: parsed.lateNightVisit || checkLateNight()
          };
        }
      } catch (e) {
        console.error("Error loading achievement state:", e);
      }
      
      return null;
    };

    // Initialize state
    const initState = loadAchievementState();
    if (initState) {
      setState(initState);
    } else {
      // Set initial lateNightVisit based on current time
      setState(prev => ({
        ...prev,
        lateNightVisit: checkLateNight()
      }));
    }

    // Initialize progress
    const initProgress = loadAchievementProgress();
    if (Object.keys(initProgress).length > 0) {
      setAchievementProgress(initProgress);
    } else {
      // Create initial progress entries for all achievements
      const initialProgress: Record<string, AchievementProgress> = {};
      achievementsList.forEach(achievement => {
        initialProgress[achievement.id] = {
          achievementId: achievement.id,
          unlocked: false,
          viewed: false
        };
      });
      setAchievementProgress(initialProgress);
    }
  }, []);

  // Save achievement progress to localStorage when it changes
  useEffect(() => {
    if (typeof window === "undefined" || Object.keys(achievementProgress).length === 0) return;
    
    try {
      localStorage.setItem(ACHIEVEMENT_PROGRESS_KEY, JSON.stringify(achievementProgress));
      
      // Update the global store for achievements
      const unlockedAchievements = achievementsList.filter(
        achievement => achievementProgress[achievement.id]?.unlocked
      );
      updateAchievementsStore(achievementsList, unlockedAchievements);
    } catch (e) {
      console.error("Error saving achievement progress:", e);
    }
  }, [achievementProgress]);

  // Save achievement state to localStorage when it changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    try {
      // Convert Sets to arrays for JSON serialization
      const serializedState = {
        ...state,
        projectsViewed: Array.from(state.projectsViewed),
        commandsExecuted: Array.from(state.commandsExecuted),
        tabsVisited: Array.from(state.tabsVisited),
        secretCommandsExecuted: Array.from(state.secretCommandsExecuted),
        projectCodesClicked: Array.from(state.projectCodesClicked)
      };
      
      localStorage.setItem(ACHIEVEMENT_STATE_KEY, JSON.stringify(serializedState));
    } catch (e) {
      console.error("Error saving achievement state:", e);
    }
  }, [state]);

  // Track visit duration
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsedMinutes = (Date.now() - startTime) / 60000;
      setState(prev => ({
        ...prev,
        visitDuration: elapsedMinutes
      }));
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Function to check for newly unlocked achievements
  const checkAchievements = useCallback(() => {
    let newlyUnlocked = false;
    
    // Make a copy of the current progress
    const updatedProgress = { ...achievementProgress };
    
    // Check each achievement
    achievementsList.forEach(achievement => {
      // Skip already unlocked achievements
      if (updatedProgress[achievement.id]?.unlocked) return;
      
      // Check if achievement condition is met
      const isUnlocked = achievement.condition(state, updatedProgress, achievementsList);
      
      if (isUnlocked) {
        // Mark as unlocked and set timestamp
        updatedProgress[achievement.id] = {
          ...updatedProgress[achievement.id],
          unlocked: true,
          unlockedAt: new Date()
        };
        
        // Set the last unlocked achievement for notification
        setLastUnlockedAchievement(achievement);
        
        newlyUnlocked = true;

        console.log(`Achievement unlocked: ${achievement.title}`);
      }
    });
    
    // Update progress if any achievements were unlocked
    if (newlyUnlocked) {
      setAchievementProgress(updatedProgress);
    }
  }, [achievementProgress, state, setLastUnlockedAchievement, setAchievementProgress]);

  // Check for achievements when state changes
  useEffect(() => {
    checkAchievements();
  }, [state, checkAchievements]);

  // Clear the last unlocked achievement (after notification is shown)
  const clearLastUnlockedAchievement = useCallback(() => {
    setLastUnlockedAchievement(null);
  }, []);

  // Track command execution for achievements  
  const markCommandExecuted = useCallback((command?: string) => {
    setState(prev => {
      const newState = { 
        ...prev,
        totalCommands: prev.totalCommands + 1
      };
      
      // Only track unique commands
      if (command) {
        newState.commandsExecuted = new Set([...prev.commandsExecuted, command]);
      }
      
      return newState;
    });
  }, []);

  const executeCommand = useCallback((command: string) => {
    setState(prev => {
      const updatedCommands = new Set(prev.commandsExecuted);
      updatedCommands.add(command.toLowerCase());
      
      return {
        ...prev,
        commandsExecuted: updatedCommands
      };
    });
  }, []);

  const executeSecretCommand = useCallback((command: string) => {
    setState(prev => {
      const updatedSecretCommands = new Set(prev.secretCommandsExecuted);
      updatedSecretCommands.add(command.toLowerCase());
      
      return {
        ...prev,
        secretCommandsExecuted: updatedSecretCommands
      };
    });
  }, []);

  const viewProject = useCallback((projectId: string) => {
    setState(prev => {
      const updatedProjectsViewed = new Set(prev.projectsViewed);
      updatedProjectsViewed.add(projectId);
      
      return {
        ...prev,
        projectsViewed: updatedProjectsViewed
      };
    });
  }, []);

  const clickProjectDemo = useCallback(() => {
    setState(prev => ({
      ...prev,
      projectDemoClicked: true
    }));
  }, []);

  const clickProjectCode = useCallback((projectId: string) => {
    setState(prev => {
      const updatedProjectCodes = new Set(prev.projectCodesClicked);
      updatedProjectCodes.add(projectId);
      
      return {
        ...prev,
        projectCodesClicked: updatedProjectCodes
      };
    });
  }, []);

  const visitTab = useCallback((tabId: string) => {
    setState(prev => {
      const updatedTabsVisited = new Set(prev.tabsVisited);
      updatedTabsVisited.add(tabId);
      
      return {
        ...prev,
        tabsVisited: updatedTabsVisited
      };
    });
  }, []);

  const sendContact = useCallback(() => {
    setState(prev => ({
      ...prev,
      contactSent: true
    }));
  }, []);

  const downloadCV = useCallback(() => {
    setState(prev => ({
      ...prev,
      cvDownloaded: true
    }));
  }, []);

  const registerTerminalClosed = useCallback(() => {
    setState(prev => ({
      ...prev,
      terminalClosed: true
    }));
  }, []);

  const registerTerminalMinimized = useCallback(() => {
    setState(prev => ({
      ...prev,
      terminalMinimized: true
    }));
  }, []);

  // Get progress for an achievement (for progress bar)
  const getProgress = useCallback((achievementId: string) => {
    const achievement = achievementsList.find(a => a.id === achievementId);
    
    if (!achievement) return 0;
    
    // If already unlocked, return 100%
    if (achievementProgress[achievementId]?.unlocked) return 100;
    
    // Calculate progress based on achievement type
    switch (achievementId) {
      case "first_step":
        return state.totalCommands > 0 ? 100 : 0;
        
      case "terminal_master":
        return Math.min(Math.floor((state.commandsExecuted.size / 7) * 100), 99);
        
      case "site_explorer": {
        const requiredTabs = ["projects", "about", "contact", "my-achievements", "your-achievements", "terminal"];
        const visitedCount = requiredTabs.filter(tab => state.tabsVisited.has(tab)).length;
        return Math.min(Math.floor((visitedCount / requiredTabs.length) * 100), 99);
      }
        
      case "achievement_hunter": {
        const unlockedCount = Object.values(achievementProgress).filter(a => a.unlocked).length;
        return Math.min(Math.floor((unlockedCount / 5) * 100), 99);
      }
        
      case "persistent_visitor":
        return Math.min(Math.floor((state.visitDuration / 5) * 100), 99);
        
      case "project_expert": {
        // Assuming 4 projects with code available
        const codeProjects = 4;
        return Math.min(Math.floor((state.projectCodesClicked.size / codeProjects) * 100), 99);
      }
        
      default:
        // Binary achievements (either done or not)
        return 0;
    }
  }, [achievementProgress, state]);

  // Get detailed progress information
  const getProgressDetails = useCallback((achievementId: string) => {
    // If already unlocked, return max progress
    if (achievementProgress[achievementId]?.unlocked) {
      switch (achievementId) {
        case "terminal_master":
          return { current: 7, target: 7 };
        case "site_explorer":
          return { current: 6, target: 6 };
        case "achievement_hunter":
          return { current: 5, target: 5 };
        case "persistent_visitor":
          return { current: 5, target: 5 };
        case "project_expert":
          return { current: 4, target: 4 };
        default:
          return { current: 1, target: 1 };
      }
    }
    
    // Calculate progress based on achievement type
    switch (achievementId) {
      case "first_step":
        return { current: state.totalCommands, target: 1 };
        
      case "terminal_master":
        return { current: state.commandsExecuted.size, target: 7 };
        
      case "site_explorer": {
        const requiredTabs = ["projects", "about", "contact", "my-achievements", "your-achievements", "terminal"];
        const visitedCount = requiredTabs.filter(tab => state.tabsVisited.has(tab)).length;
        return { current: visitedCount, target: requiredTabs.length };
      }
        
      case "achievement_hunter": {
        const unlockedCount = Object.values(achievementProgress).filter(a => a.unlocked).length;
        return { current: unlockedCount, target: 5 };
      }
        
      case "persistent_visitor":
        return { current: Math.min(Math.floor(state.visitDuration), 5), target: 5 };
        
      case "project_expert":
        return { current: state.projectCodesClicked.size, target: 4 };
        
      default:
        // Binary achievements (either done or not)
        return { current: 0, target: 1 };
    }
  }, [achievementProgress, state]);

  // Get list of unlocked achievements
  const unlockedAchievements = achievementsList.filter(
    achievement => achievementProgress[achievement.id]?.unlocked
  );

  // Function to unlock all achievements at once
  const unlockAllAchievements = useCallback(() => {
    // Create an updated version of progress with all achievements unlocked
    const updatedProgress = { ...achievementProgress };
    
    // Mark each achievement as unlocked
    achievementsList.forEach(achievement => {
      if (!updatedProgress[achievement.id]?.unlocked) {
        updatedProgress[achievement.id] = {
          ...updatedProgress[achievement.id],
          unlocked: true,
          unlockedAt: new Date()
        };
      }
    });
    
    // Update the achievement progress state
    setAchievementProgress(updatedProgress);
    
    console.log("🎮 Cheat code activated: All achievements unlocked!");
  }, [achievementProgress, setAchievementProgress]);

  // Add a function to explicitly enable Night Owl achievement
  const enableNightOwl = useCallback(() => {
    setState(prev => ({
      ...prev,
      lateNightVisit: true
    }));
  }, []);

  // Create the context value
  const contextValue = {
    achievements: achievementsList,
    unlockedAchievements,
    lastUnlockedAchievement,
    clearLastUnlockedAchievement,
    viewAchievement: viewProject,
    
    // Track actions for unlocking achievements
    visitTab,
    executeSecretCommand,
    viewProject,
    sendContact,
    clickProjectDemo,
    downloadCV,
    clickProjectCode,
    registerTerminalClosed,
    registerTerminalMinimized,
    
    // Additional methods for terminal component
    markCommandExecuted,
    executeCommand,
    projectCodeClicked: clickProjectCode,
    
    // Achievement progress tracking
    achievementProgress,
    getProgress,
    getProgressDetails,
    
    // Unlock all achievements at once
    unlockAllAchievements,
    
    // Enable Night Owl achievement
    enableNightOwl
  };

  return (
    <AchievementsContext.Provider value={contextValue}>
      {children}
    </AchievementsContext.Provider>
  );
}

// Custom hook to access achievement context
export function useAchievements() {
  const context = useContext(AchievementsContext);
  
  if (context === undefined) {
    throw new Error("useAchievements must be used within an AchievementsProvider");
  }
  
  return context;
}

