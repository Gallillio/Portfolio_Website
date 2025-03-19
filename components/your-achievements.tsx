"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useAchievements, type Achievement, AchievementCategory } from "@/lib/achievements-context"
import { Sparkles, Trophy, HelpCircle } from "lucide-react"

export default function YourAchievements() {
  const { 
    achievements, 
    achievementProgress, 
    visitTab, 
    unlockedAchievements, 
    getProgress,
    getProgressDetails 
  } = useAchievements()
  
  const [filter, setFilter] = useState<string>("all")
  const [showConfetti, setShowConfetti] = useState(false)
  const [hasMarkedVisit, setHasMarkedVisit] = useState(false)

  // Mark this tab as visited for the site explorer achievement - only once
  useEffect(() => {
    if (!hasMarkedVisit) {
      visitTab("your-achievements")
      setHasMarkedVisit(true)
    }
  }, [visitTab, hasMarkedVisit])

  // Count of unlocked achievements for confetti effect
  useEffect(() => {
    if (unlockedAchievements.length > 0) {
      // Show confetti when viewing page with unlocked achievements
      setShowConfetti(true)
      const timer = setTimeout(() => {
        setShowConfetti(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [unlockedAchievements.length])

  // Filter achievements based on selection
  const filteredAchievements = achievements.filter(achievement => {
    // Include secret achievements that haven't been unlocked yet (they'll be displayed as obfuscated)
    
    // Apply the selected filter
    if (filter === "all") {
      return true
    } else if (filter === "unlocked") {
      return achievementProgress[achievement.id]?.unlocked
    } else if (filter === "locked") {
      return !achievementProgress[achievement.id]?.unlocked
    } else if (filter === AchievementCategory.SECRET) {
      // For the secret filter, only show secret achievements
      return achievement.category === AchievementCategory.SECRET
    } else {
      // Filter by category
      return achievement.category === filter
    }
  })

  // Check if there are any unlocked secret achievements
  const hasSecretAchievements = achievements.some(
    a => a.category === AchievementCategory.SECRET
  )

  return (
    <div className="bg-black text-green-500 p-6 min-h-[70vh] font-mono relative custom-scrollbar">
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
          <Sparkles className="text-yellow-400 animate-pulse h-32 w-32 opacity-75" />
        </div>
      )}

      <div className="mb-6 border-b border-green-500 pb-2">
        <h2 className="text-2xl mb-4">Your Achievements</h2>
        <div className="flex flex-nowrap overflow-x-auto pb-2">
          <Badge
            onClick={() => setFilter("all")}
            className={cn(
              "cursor-pointer hover:bg-green-500/20 whitespace-nowrap mr-2",
              filter === "all" ? "bg-green-500 text-black" : "bg-transparent",
            )}
          >
            All
          </Badge>
          <Badge
            onClick={() => setFilter("unlocked")}
            className={cn(
              "cursor-pointer hover:bg-green-500/20 whitespace-nowrap mr-2",
              filter === "unlocked" ? "bg-green-500 text-black" : "bg-transparent",
            )}
          >
            Unlocked
          </Badge>
          <Badge
            onClick={() => setFilter("locked")}
            className={cn(
              "cursor-pointer hover:bg-green-500/20 whitespace-nowrap mr-2",
              filter === "locked" ? "bg-green-500 text-black" : "bg-transparent",
            )}
          >
            Locked
          </Badge>
          <Badge
            onClick={() => setFilter(AchievementCategory.EXPLORATION)}
            className={cn(
              "cursor-pointer hover:bg-green-500/20 whitespace-nowrap mr-2",
              filter === AchievementCategory.EXPLORATION ? "bg-green-500 text-black" : "bg-transparent",
            )}
          >
            Exploration
          </Badge>
          <Badge
            onClick={() => setFilter(AchievementCategory.INTERACTION)}
            className={cn(
              "cursor-pointer hover:bg-green-500/20 whitespace-nowrap mr-2",
              filter === AchievementCategory.INTERACTION ? "bg-green-500 text-black" : "bg-transparent",
            )}
          >
            Interaction
          </Badge>
          <Badge
            onClick={() => setFilter(AchievementCategory.PERSISTENCE)}
            className={cn(
              "cursor-pointer hover:bg-green-500/20 whitespace-nowrap mr-2",
              filter === AchievementCategory.PERSISTENCE ? "bg-green-500 text-black" : "bg-transparent",
            )}
          >
            Persistence
          </Badge>
          {hasSecretAchievements && (
            <Badge
              onClick={() => setFilter(AchievementCategory.SECRET)}
              className={cn(
                "cursor-pointer hover:bg-green-500/20 whitespace-nowrap mr-2",
                filter === AchievementCategory.SECRET ? "bg-green-500 text-black" : "bg-transparent",
              )}
            >
              Secret Achievements
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAchievements.map((achievement) => {
          const isUnlocked = achievementProgress[achievement.id]?.unlocked || false;
          const isSecret = achievement.isSecret;
          
          return (
            <AchievementCard 
              key={achievement.id} 
              achievement={achievement} 
              progress={getProgress(achievement.id)}
              progressDetails={getProgressDetails(achievement.id)}
              unlocked={isUnlocked}
              isSecret={isSecret}
            />
          );
        })}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="text-center py-12 text-green-400">
          <p>No achievements found with the selected filter.</p>
          <button onClick={() => setFilter("all")} className="text-green-500 underline mt-2">
            Show all achievements
          </button>
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-900/50 border border-green-500 rounded-md">
        <h3 className="text-xl text-green-400 mb-2">How to Earn Achievements</h3>
        <p className="text-green-300 mb-4">
          Explore the portfolio and interact with different sections to unlock achievements. Some achievements are
          secret and will only be revealed once unlocked!
        </p>
        <p className="text-green-300/70 text-sm">
          Tip: Try using different terminal commands, visiting all tabs, and interacting with projects.
        </p>
      </div>
    </div>
  )
}

// AchievementCard Component
interface AchievementCardProps {
  achievement: Achievement
  progress: number
  progressDetails: { current: number; target: number }
  unlocked: boolean
  isSecret: boolean | undefined
}

function AchievementCard({ achievement, progress, progressDetails, unlocked, isSecret }: AchievementCardProps) {
  // Determine if we should show obfuscated content (for secret achievements that aren't unlocked)
  const showObfuscated = isSecret && !unlocked;

  return (
    <Card
      className={cn(
        "bg-gray-900 border-green-500 transition-all",
        unlocked ? "opacity-100" : "opacity-70 hover:opacity-90",
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-green-400">
            {showObfuscated ? "???" : achievement.title}
          </CardTitle>
          <CardDescription className="text-green-300/70">
            {showObfuscated ? "Secret Achievement" : achievement.description}
          </CardDescription>
        </div>
        <div className={cn("p-2 rounded-full", unlocked ? "bg-green-500/20" : "bg-gray-800 text-gray-400")}>
          {showObfuscated ? <HelpCircle className="h-6 w-6" /> : (achievement.icon || <Trophy className="h-6 w-6" />)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-green-400">Progress</span>
            <span className="text-green-400">
              {showObfuscated ? "?/?" : `${progressDetails.current}/${progressDetails.target}`}
            </span>
          </div>
          <Progress
            value={showObfuscated ? 0 : progress}
            className="h-2 bg-gray-800"
            indicatorClassName={unlocked ? "bg-green-500" : "bg-green-700"}
          />
          <div className="flex justify-end mt-2">
            <Badge
              variant="outline"
              className={cn(
                "text-xs",
                unlocked ? "border-green-500 text-green-400" : "border-gray-600 text-gray-400",
              )}
            >
              {achievement.category}
            </Badge>
          </div>
          {!showObfuscated && achievement.hint && !unlocked && (
            <p className="text-yellow-400/80 text-xs mt-2 italic">
              Hint: {achievement.hint}
            </p>
          )}
          {showObfuscated && (
            <p className="text-yellow-400/80 text-xs mt-2 italic">
              This achievement is secret. Continue exploring to discover it!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 