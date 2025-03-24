"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useAchievements } from "@/lib/achievements-context"
import { Trophy, HelpCircle } from "lucide-react"

export default function YourAchievements() {
  const { 
    achievements, 
    achievementProgress,
    getProgress,
    getProgressDetails,
    visitTab,
    celebrationAlreadyShown,
    showCookieNotification 
  } = useAchievements()
  
  const [filter, setFilter] = useState<string>("all")
  const [hasMarkedVisit, setHasMarkedVisit] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Mark this tab as visited for the site explorer achievement - only once
  useEffect(() => {
    if (!hasMarkedVisit) {
      visitTab("your-achievements")
      setHasMarkedVisit(true)
    }
  }, [visitTab, hasMarkedVisit])

  // Filter achievements based on selection
  const filteredAchievements = achievements.filter(achievement => {
    // Apply the selected filter
    if (filter === "all") {
      return true; // Show all achievements, including secret ones
    } else if (filter === "unlocked") {
      return achievementProgress[achievement.id]?.unlocked;
    } else if (filter === "locked") {
      return !achievementProgress[achievement.id]?.unlocked;
    } else if (filter === "secret") {
      // For the secret filter, only show secret achievements that have been unlocked
      return achievement.isSecret;
    } else {
      // Filter by category
      return achievement.category === filter;
    }
  })

  // Function to clear all achievements data
  const clearAchievementsData = () => {
    // Clear all localStorage data
    localStorage.clear();
    
    // Make sure the celebration shown flag is cleared
    localStorage.removeItem("portfolio-achievement-celebration-shown");
    
    // Refresh the page after clearing
    window.location.reload();
  }

  // Close modal when clicking outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('modal-backdrop')) {
      setIsModalOpen(false);
    }
  };

  // Function to check if all achievements are unlocked
  const areAllAchievementsUnlocked = () => {
    return Object.values(achievementProgress).filter(progress => progress.unlocked).length === achievements.length;
  }

  return (
    <div className="bg-black text-green-500 p-6 min-h-[70vh] font-mono relative custom-scrollbar">
      <div className="mb-6 border-b border-green-500 pb-2">
        <h2 className="text-2xl mb-4">Your Achievements</h2>
      </div>

      <div className="mt-8 p-4 bg-gray-900/50 border border-green-500 rounded-md">
        <h2 className="text-xl text-green-400 mb-2">This is Your Achievements!</h2>
        <p className="text-green-300 mb-4">
          Explore the portfolio and interact with different sections to unlock achievements. Some achievements are
          secret and will only be revealed once unlocked!
        </p>
        <p className="text-green-300/70 text-sm">
          Tip: Try using different terminal commands, visiting all tabs, and interacting with projects.
        </p>
      </div>

      {/* Progress Bar Section */}
      <div className="mt-4 p-4 bg-gray-900/50 border border-green-500 rounded-md">
        <h3 className="text-lg text-green-400 mb-2">Achievements Progress</h3>
        <Progress
          value={(Object.values(achievementProgress).filter(progress => progress.unlocked).length / achievements.length) * 100}
          className="h-2 bg-gray-800"
          indicatorClassName="bg-green-500"
        />
        <div className="flex justify-between text-xs mt-2">
          <span className="text-green-400"> Achievements Collected: {Object.values(achievementProgress).filter(progress => progress.unlocked).length} / {achievements.length} </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {filteredAchievements.map((achievement) => {
          const isUnlocked = achievementProgress[achievement.id]?.unlocked || false;
          const isSecret = achievement.isSecret;
          const showObfuscated = isSecret && !isUnlocked;
          const progressValue = getProgress(achievement.id);
          const { current, target } = getProgressDetails(achievement.id);
          
          return (
            <Card 
              key={achievement.id} 
              className={cn(
                "bg-gray-900 border-green-500 transition-all relative",
                isUnlocked ? "opacity-100" : "opacity-70 hover:opacity-90",
              )}
            >
              {isUnlocked && (
                <div className="absolute -top-2 -right-2 z-10">
                  <div className="bg-green-500 text-black p-1 rounded-full">
                    <Trophy className="h-4 w-4" />
                  </div>
                </div>
              )}
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className={cn(
                    "text-green-400",
                    !isUnlocked && "text-green-400/70"
                  )}>
                    {showObfuscated ? "???" : achievement.title}
                  </CardTitle>
                  <CardDescription className={cn(
                    "text-green-300/70",
                    !isUnlocked && "text-green-300/50"
                  )}>
                    {showObfuscated ? "Secret Achievement" : achievement.description}
                  </CardDescription>
                </div>
                <div className={cn(
                  "p-2 rounded-full", 
                  isUnlocked ? "bg-green-500/20" : "bg-gray-800/50 text-gray-400"
                )}>
                  {showObfuscated ? <HelpCircle className="h-6 w-6" /> : (achievement.icon || <Trophy 
                  className="h-6 w-6" />)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className={cn(
                      "text-green-400",
                      !isUnlocked && "text-green-400/70"
                    )}>Progress</span>
                    <span className={cn(
                      "text-green-400",
                      !isUnlocked && "text-green-400/70"
                    )}>
                      {showObfuscated ? "?/?" : `${current}/${target}`}
                    </span>
                  </div>
                  <Progress
                    value={showObfuscated ? 0 : progressValue}
                    className="h-2 bg-gray-800"
                    indicatorClassName={isUnlocked ? "bg-green-500" : "bg-green-700"}
                  />
                  <div className="flex justify-between mt-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        isUnlocked ? "border-green-500 text-green-400" : "border-gray-600 text-gray-400",
                      )}
                    >
                      {achievement.category}
                    </Badge>
                    {isUnlocked && (
                      <Badge
                        className="bg-green-500/20 text-green-400 border-none text-xs"
                      >
                        Unlocked
                      </Badge>
                    )}
                  </div>
                  {/* Show hint for secret achievements */}
                  {isSecret && showObfuscated && (
                    <p className="text-yellow-400/80 text-xs mt-2 italic">
                      Hint: {achievement.hint || "Explore the terminal at different times."}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
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

      <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-md">
        <h2 className="text-xl text-yellow-400 mb-2">Secret Achievements</h2>
        <p className="text-yellow-300/80 mb-2">
          There are several secret achievements hidden throughout the portfolio. These won&apos;t be visible until you unlock them!
        </p>
        <p className="text-yellow-300/60 text-sm">
          Hint: Try unusual interactions with the terminal, visit at unusual hours, explore all project links...
        </p>
      </div>

      {/* Buttons Section */}
      <div className="mt-4 flex justify-center gap-4 flex-wrap">
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-gray-900 border border-red-700 text-red-700 px-4 py-2 rounded-md transition-colors duration-300 hover:bg-red-900 hover:text-white"
        >
          Clear Achievements Data
        </button>
        
        {/* Show Cookie Button - Only visible after celebration notification has been shown once AND all achievements are unlocked */}
        {celebrationAlreadyShown && areAllAchievementsUnlocked() && (
          <button 
            onClick={() => showCookieNotification()} 
            className="bg-gray-900 border border-green-500 text-green-400 px-4 py-2 rounded-md transition-colors duration-300 hover:bg-green-900 hover:text-white flex items-center gap-2"
          >
            <span>Claim Your Cookie Reward</span>
            <span className="text-lg">🍪</span>
          </button>
        )}
      </div>

      {/* Warning Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 modal-backdrop"
          onClick={handleBackdropClick} // Handle clicks on the backdrop
        >
          <div className="bg-gray-800 p-4 rounded-md max-w-md w-full">
            <h3 className="text-lg text-red-500">Warning</h3>
            <p className="text-gray-300">
              This will delete all unlocked achievements, and there is no way to recover them except by completing the achievements again.
            </p>
            <div className="flex justify-end mt-4">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md mr-2 transition-colors duration-300"
              >
                Cancel
              </button>
              <button 
                onClick={clearAchievementsData} 
                className="bg-red-900 hover:bg-red-800 text-white px-4 py-2 rounded-md transition-colors duration-300"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 