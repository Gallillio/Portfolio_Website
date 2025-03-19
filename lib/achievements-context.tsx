"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback, useRef } from "react"
import { Code, Zap, Trophy, Star, Mail, Eye, Coffee, MessageSquare, Book, Award, ChevronsUp, Search } from "lucide-react"

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
}

// User progress for an individual achievement
export interface AchievementProgress {
  achievementId: string
  unlocked: boolean
  unlockedAt?: Date
  viewed: boolean
}

// Context type definition
export interface AchievementContextType {
  achievements: Achievement[]
  unlockedAchievements: Achievement[]
  achievementProgress: Record<string, AchievementProgress>
  lastUnlockedAchievement: Achievement | null
  clearLastUnlockedAchievement: () => void
  
  // Event trackers
  executeCommand: (command: string) => void
  viewProject: (projectId: string) => void
  clickProjectDemo: () => void
  visitTab: (tabId: string) => void
  sendContact: () => void
  downloadCV: () => void
  executeSecretCommand: (command: string) => void
  
  // Achievement checking utilities
  checkAchievements: () => void
  getProgress: (achievementId: string) => number
  getProgressDetails: (achievementId: string) => { current: number; target: number }
  
  // Additional methods for terminal component
  markCommandExecuted: () => void
  markCVDownloaded: () => void
  markTabVisited: (tabId: string) => void
}

// Default context value
const AchievementContext = createContext<AchievementContextType | undefined>(undefined)

// Define the list of achievements
const achievementsList: Achievement[] = [
  {
    id: "first-command",
    title: "First Step",
    description: "Execute your first command in the terminal",
      icon: <Trophy className="h-6 w-6" />,
    category: AchievementCategory.INTERACTION,
    condition: (state) => state.totalCommands >= 1,
  },
  {
    id: "explorer",
    title: "Site Explorer",
    description: "Visit all sections of the portfolio",
    icon: <Search className="h-6 w-6" />,
    category: AchievementCategory.EXPLORATION,
    condition: (state) => state.tabsVisited.size >= 6,
  },
  {
    id: "terminal-master",
    title: "Terminal Master",
    description: "Execute at least 7 different terminal commands",
    icon: <Code className="h-6 w-6" />,
    category: AchievementCategory.INTERACTION,
    condition: (state) => state.commandsExecuted.size >= 7,
  },
  {
    id: "project-expert",
    title: "Project Expert",
      description: "View all projects in the projects section",
      icon: <Coffee className="h-6 w-6" />,
    category: AchievementCategory.EXPLORATION,
    condition: (state) => state.projectsViewed.size >= 6,
  },
  {
    id: "cv-downloader",
    title: "Resume Researcher",
    description: "Download my CV",
    icon: <Book className="h-6 w-6" />,
    category: AchievementCategory.INTERACTION,
    condition: (state) => state.cvDownloaded,
  },
  {
    id: "contact-sender",
    title: "Contact Made",
    description: "Send a message through the contact form",
    icon: <Mail className="h-6 w-6" />,
    category: AchievementCategory.INTERACTION,
    condition: (state) => state.contactSent,
  },
  {
    id: "demo-viewer",
    title: "Demo Explorer",
    description: "Click on a project demo link",
    icon: <Eye className="h-6 w-6" />,
    category: AchievementCategory.INTERACTION,
    condition: (state) => state.projectDemoClicked,
    },
    {
      id: "night-owl",
      title: "Night Owl",
      description: "Visit the portfolio during late hours (10 PM - 5 AM)",
      icon: <Star className="h-6 w-6" />,
    category: AchievementCategory.SECRET,
    isSecret: true,
    condition: (state) => state.lateNightVisit,
    },
    {
      id: "persistent-visitor",
      title: "Persistent Visitor",
      description: "Spend more than 5 minutes exploring the portfolio",
      icon: <Zap className="h-6 w-6" />,
    category: AchievementCategory.PERSISTENCE,
    condition: (state) => state.visitDuration >= 5,
  },
  {
    id: "hello-friend",
    title: "Hello Friend",
    description: "Be friendly and say hello",
      icon: <MessageSquare className="h-6 w-6" />,
    category: AchievementCategory.SECRET,
    isSecret: true,
    condition: (state) => state.secretCommandsExecuted.has('hello'),
  },
  {
    id: "achievement-hunter",
    title: "Achievement Hunter",
    description: "Unlock at least 5 achievements",
    icon: <Award className="h-6 w-6" />,
    category: AchievementCategory.PERSISTENCE,
    condition: (state, progress) => {
      if (!progress) return false;
      return Object.values(progress).filter(a => a.unlocked).length >= 5;
    },
    hint: "Keep exploring and interacting with the site!",
  },
  {
    id: "completion",
    title: "Portfolio Master",
    description: "Unlock all other achievements",
    icon: <ChevronsUp className="h-6 w-6" />,
    category: AchievementCategory.SECRET,
    isSecret: true,
    condition: (state, progress, achievements) => {
      if (!progress || !achievements) return false;
      const otherAchievements = achievements.filter(a => a.id !== "completion");
      return otherAchievements.every(a => progress[a.id]?.unlocked);
    },
  }
];

// Storage keys
const ACHIEVEMENT_PROGRESS_KEY = "portfolio-achievement-progress";
const ACHIEVEMENT_STATE_KEY = "portfolio-achievement-state";

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
    totalCommands: 0
  });

  // Last unlocked achievement for notification
  const [lastUnlockedAchievement, setLastUnlockedAchievement] = useState<Achievement | null>(null);
  
  // Timer references
  const visitTimer = useRef<NodeJS.Timeout | null>(null);

  // Load saved progress and state from localStorage
  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem(ACHIEVEMENT_PROGRESS_KEY);
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        setAchievementProgress(parsed);
      } else {
        // Initialize achievement progress if not already in localStorage
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

      const savedState = localStorage.getItem(ACHIEVEMENT_STATE_KEY);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        
        // Convert serialized sets back to real Set objects
        setState({
          ...parsedState,
          projectsViewed: new Set(parsedState.projectsViewed || []),
          commandsExecuted: new Set(parsedState.commandsExecuted || []),
          tabsVisited: new Set(parsedState.tabsVisited || []),
          secretCommandsExecuted: new Set(parsedState.secretCommandsExecuted || []),
        });
      }
    } catch (error) {
      console.error("Error loading achievement data:", error);
      // Initialize with fresh data in case of error
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

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      // Serialize sets for storage
      const stateToSave = {
        ...state,
        projectsViewed: Array.from(state.projectsViewed),
        commandsExecuted: Array.from(state.commandsExecuted),
        tabsVisited: Array.from(state.tabsVisited),
        secretCommandsExecuted: Array.from(state.secretCommandsExecuted),
      };
      localStorage.setItem(ACHIEVEMENT_STATE_KEY, JSON.stringify(stateToSave));
      localStorage.setItem(ACHIEVEMENT_PROGRESS_KEY, JSON.stringify(achievementProgress));
    } catch (error) {
      console.error("Error saving achievement data:", error);
    }
  }, [state, achievementProgress]);

  // Check if it's late night visit (10 PM - 5 AM)
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 22 || hour <= 5) {
      setState(prev => ({ ...prev, lateNightVisit: true }));
    }
  }, []);

  // Start visit duration timer
  useEffect(() => {
    visitTimer.current = setInterval(() => {
      setState(prev => ({ ...prev, visitDuration: prev.visitDuration + 1 }));
    }, 60000); // Update every minute

    return () => {
      if (visitTimer.current) clearInterval(visitTimer.current);
    };
  }, []);

  // Check all achievements against current state
  const checkAchievements = useCallback(() => {
    let anyNewlyUnlocked = false;

    achievementsList.forEach(achievement => {
      const progress = achievementProgress[achievement.id];
      
      if (progress && !progress.unlocked) {
        // Pass the condition function everything it needs to evaluate
        const achievementConditionMet = achievement.condition(state, achievementProgress, achievementsList);

        if (achievementConditionMet) {
          // Update unlock status
          setAchievementProgress(prev => ({
            ...prev,
            [achievement.id]: {
              ...prev[achievement.id],
              unlocked: true,
              unlockedAt: new Date()
            }
          }));

          // Set last unlocked for notification
          setLastUnlockedAchievement(achievement);
          anyNewlyUnlocked = true;
        }
      }
    });

    // Return whether any new achievements were unlocked
    return anyNewlyUnlocked;
  }, [state, achievementProgress, achievementsList, setLastUnlockedAchievement]);

  // Check for achievement unlocks whenever state changes
  useEffect(() => {
    checkAchievements();
  }, [state, checkAchievements]);

  // Clear the last unlocked achievement notification
  const clearLastUnlockedAchievement = useCallback(() => {
    setLastUnlockedAchievement(null);
  }, []);

  // Event trackers
  const executeCommand = useCallback((command: string) => {
    setState(prev => {
      const commands = new Set(prev.commandsExecuted);
      commands.add(command);
      return {
        ...prev,
        commandsExecuted: commands,
        totalCommands: prev.totalCommands + 1
      };
    });
  }, []);

  // Simplified command tracker (for terminal component)
  const markCommandExecuted = useCallback(() => {
    setState(prev => ({
      ...prev,
      totalCommands: prev.totalCommands + 1
    }));
  }, []);

  const viewProject = useCallback((projectId: string) => {
    setState(prev => {
      const projects = new Set(prev.projectsViewed);
      projects.add(projectId);
      return {
        ...prev,
        projectsViewed: projects
      };
    });
  }, []);

  const clickProjectDemo = useCallback(() => {
    setState(prev => ({
      ...prev,
      projectDemoClicked: true
    }));
  }, []);

  const visitTab = useCallback((tabId: string) => {
    setState(prev => {
      const tabs = new Set(prev.tabsVisited);
      tabs.add(tabId);
      return {
        ...prev,
        tabsVisited: tabs
      };
    });
  }, []);

  // Alias for visitTab for terminal-input component
  const markTabVisited = useCallback((tabId: string) => {
    visitTab(tabId);
  }, [visitTab]);

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

  // Alias for downloadCV for terminal component
  const markCVDownloaded = useCallback(() => {
    downloadCV();
  }, [downloadCV]);

  const executeSecretCommand = useCallback((command: string) => {
    setState(prev => {
      const commands = new Set(prev.secretCommandsExecuted);
      commands.add(command);
      return {
        ...prev,
        secretCommandsExecuted: commands
      };
    });
  }, []);

  // Calculate progress percentage for an achievement
  const getProgress = useCallback((achievementId: string): number => {
    const achievement = achievementsList.find(a => a.id === achievementId);
    if (!achievement) return 0;
    
    // For boolean conditions
    if (achievement.id === "cv-downloader") return state.cvDownloaded ? 100 : 0;
    if (achievement.id === "contact-sender") return state.contactSent ? 100 : 0;
    if (achievement.id === "demo-viewer") return state.projectDemoClicked ? 100 : 0;
    if (achievement.id === "night-owl") return state.lateNightVisit ? 100 : 0;
    if (achievement.id === "hello-friend") return state.secretCommandsExecuted.has('hello') ? 100 : 0;
    
    // For count-based conditions
    if (achievement.id === "first-command") {
      return Math.min(state.totalCommands, 1) * 100;
    }
    if (achievement.id === "explorer") {
      return Math.min(state.tabsVisited.size / 6 * 100, 100);
    }
    if (achievement.id === "terminal-master") {
      return Math.min(state.commandsExecuted.size / 7 * 100, 100);
    }
    if (achievement.id === "project-expert") {
      return Math.min(state.projectsViewed.size / 6 * 100, 100);
    }
    if (achievement.id === "persistent-visitor") {
      return Math.min(state.visitDuration / 5 * 100, 100);
    }
    if (achievement.id === "achievement-hunter") {
      const unlockedCount = Object.values(achievementProgress).filter(a => a.unlocked).length;
      return Math.min(unlockedCount / 5 * 100, 100);
    }
    if (achievement.id === "completion") {
      const otherAchievements = achievementsList.filter(a => a.id !== "completion");
      const unlockedCount = otherAchievements.filter(a => achievementProgress[a.id]?.unlocked).length;
      return Math.min(unlockedCount / otherAchievements.length * 100, 100);
    }
    
    return 0;
  }, [state, achievementProgress]);

  // Get detailed progress information for an achievement
  const getProgressDetails = useCallback((achievementId: string): { current: number; target: number } => {
    const achievement = achievementsList.find(a => a.id === achievementId);
    if (!achievement) return { current: 0, target: 1 };
    
    // For boolean conditions
    if (achievement.id === "cv-downloader") 
      return { current: state.cvDownloaded ? 1 : 0, target: 1 };
    if (achievement.id === "contact-sender") 
      return { current: state.contactSent ? 1 : 0, target: 1 };
    if (achievement.id === "demo-viewer") 
      return { current: state.projectDemoClicked ? 1 : 0, target: 1 };
    if (achievement.id === "night-owl") 
      return { current: state.lateNightVisit ? 1 : 0, target: 1 };
    if (achievement.id === "hello-friend") 
      return { current: state.secretCommandsExecuted.has('hello') ? 1 : 0, target: 1 };
    
    // For count-based conditions
    if (achievement.id === "first-command") {
      return { current: Math.min(state.totalCommands, 1), target: 1 };
    }
    if (achievement.id === "explorer") {
      return { current: state.tabsVisited.size, target: 6 };
    }
    if (achievement.id === "terminal-master") {
      return { current: state.commandsExecuted.size, target: 7 };
    }
    if (achievement.id === "project-expert") {
      return { current: state.projectsViewed.size, target: 6 };
    }
    if (achievement.id === "persistent-visitor") {
      return { current: state.visitDuration, target: 5 };
    }
    if (achievement.id === "achievement-hunter") {
      const unlockedCount = Object.values(achievementProgress).filter(a => a.unlocked).length;
      return { current: unlockedCount, target: 5 };
    }
    if (achievement.id === "completion") {
      const otherAchievements = achievementsList.filter(a => a.id !== "completion");
      const unlockedCount = otherAchievements.filter(a => achievementProgress[a.id]?.unlocked).length;
      return { current: unlockedCount, target: otherAchievements.length };
    }
    
    return { current: 0, target: 1 };
  }, [state, achievementProgress]);

  // Get list of unlocked achievements
  const unlockedAchievements = achievementsList.filter(
    achievement => achievementProgress[achievement.id]?.unlocked
  );

  // Context value
  const value = {
    achievements: achievementsList,
    unlockedAchievements,
    achievementProgress,
        lastUnlockedAchievement,
        clearLastUnlockedAchievement,
    
    // Event trackers
    executeCommand,
    viewProject,
    clickProjectDemo,
    visitTab,
    sendContact,
    downloadCV,
        executeSecretCommand,
    
    // Achievement checking
    checkAchievements,
    getProgress,
    getProgressDetails,
    
    // Additional aliased methods for components
    markCommandExecuted,
        markCVDownloaded,
    markTabVisited
  };

  return (
    <AchievementContext.Provider value={value}>
      {children}
    </AchievementContext.Provider>
  );
}

// Custom hook to use the achievements context
export function useAchievements() {
  const context = useContext(AchievementContext);
  if (context === undefined) {
    throw new Error("useAchievements must be used within an AchievementsProvider");
  }
  return context;
}

