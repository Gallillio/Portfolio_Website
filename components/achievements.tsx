"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Award, Code, BookOpen, Zap, Trophy, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  unlocked: boolean
  progress: number
  maxProgress: number
  category: "coding" | "learning" | "career" | "community"
}

export default function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: "code-master",
      title: "Code Master",
      description: "Completed 10 projects",
      icon: <Code className="h-6 w-6" />,
      unlocked: true,
      progress: 10,
      maxProgress: 10,
      category: "coding",
    },
    {
      id: "bug-hunter",
      title: "Bug Hunter",
      description: "Fixed 50 bugs",
      icon: <Zap className="h-6 w-6" />,
      unlocked: true,
      progress: 50,
      maxProgress: 50,
      category: "coding",
    },
    {
      id: "ai-specialist",
      title: "AI Specialist",
      description: "Completed 5 AI projects",
      icon: <Trophy className="h-6 w-6" />,
      unlocked: true,
      progress: 5,
      maxProgress: 5,
      category: "career",
    },
    {
      id: "continuous-learner",
      title: "Continuous Learner",
      description: "Completed 8 courses",
      icon: <BookOpen className="h-6 w-6" />,
      unlocked: true,
      progress: 8,
      maxProgress: 10,
      category: "learning",
    },
    {
      id: "open-source",
      title: "Open Source Contributor",
      description: "Contributed to 3 open source projects",
      icon: <Star className="h-6 w-6" />,
      unlocked: false,
      progress: 3,
      maxProgress: 5,
      category: "community",
    },
    {
      id: "speaker",
      title: "Tech Speaker",
      description: "Gave 2 tech talks",
      icon: <Award className="h-6 w-6" />,
      unlocked: false,
      progress: 2,
      maxProgress: 5,
      category: "community",
    },
  ])

  const [filter, setFilter] = useState<string>("all")
  const [visitProgress, setVisitProgress] = useState(0)
  const [explorerAchieved, setExplorerAchieved] = useState(false)

  useEffect(() => {
    // Simulate progress for the "Explorer" achievement as user navigates
    if (visitProgress < 100 && !explorerAchieved) {
      const timer = setTimeout(() => {
        setVisitProgress((prev) => {
          const newProgress = prev + 20
          if (newProgress >= 100 && !explorerAchieved) {
            setExplorerAchieved(true)
            setAchievements((prev) => [
              ...prev,
              {
                id: "explorer",
                title: "Site Explorer",
                description: "Explored all sections of the portfolio",
                icon: <Trophy className="h-6 w-6" />,
                unlocked: true,
                progress: 100,
                maxProgress: 100,
                category: "community",
              },
            ])
          }
          return newProgress
        })
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [visitProgress, explorerAchieved])

  const filteredAchievements =
    filter === "all"
      ? achievements
      : achievements.filter((achievement) =>
          filter === "unlocked"
            ? achievement.unlocked
            : filter === "locked"
              ? !achievement.unlocked
              : achievement.category === filter,
        )

  return (
    <div className="bg-black text-green-500 p-6 min-h-[70vh] font-mono">
      <div className="flex justify-between items-center mb-6 border-b border-green-500 pb-2">
        <h2 className="text-2xl">Achievements</h2>
        <div className="flex space-x-2">
          <Badge
            onClick={() => setFilter("all")}
            className={cn(
              "cursor-pointer hover:bg-green-500/20",
              filter === "all" ? "bg-green-500 text-black" : "bg-transparent",
            )}
          >
            All
          </Badge>
          <Badge
            onClick={() => setFilter("unlocked")}
            className={cn(
              "cursor-pointer hover:bg-green-500/20",
              filter === "unlocked" ? "bg-green-500 text-black" : "bg-transparent",
            )}
          >
            Unlocked
          </Badge>
          <Badge
            onClick={() => setFilter("locked")}
            className={cn(
              "cursor-pointer hover:bg-green-500/20",
              filter === "locked" ? "bg-green-500 text-black" : "bg-transparent",
            )}
          >
            Locked
          </Badge>
          <Badge
            onClick={() => setFilter("coding")}
            className={cn(
              "cursor-pointer hover:bg-green-500/20",
              filter === "coding" ? "bg-green-500 text-black" : "bg-transparent",
            )}
          >
            Coding
          </Badge>
          <Badge
            onClick={() => setFilter("career")}
            className={cn(
              "cursor-pointer hover:bg-green-500/20",
              filter === "career" ? "bg-green-500 text-black" : "bg-transparent",
            )}
          >
            Career
          </Badge>
          <Badge
            onClick={() => setFilter("learning")}
            className={cn(
              "cursor-pointer hover:bg-green-500/20",
              filter === "learning" ? "bg-green-500 text-black" : "bg-transparent",
            )}
          >
            Learning
          </Badge>
          <Badge
            onClick={() => setFilter("community")}
            className={cn(
              "cursor-pointer hover:bg-green-500/20",
              filter === "community" ? "bg-green-500 text-black" : "bg-transparent",
            )}
          >
            Community
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAchievements.map((achievement) => (
          <Card
            key={achievement.id}
            className={cn(
              "bg-gray-900 border-green-500 transition-all",
              achievement.unlocked ? "opacity-100" : "opacity-70 hover:opacity-90",
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-green-400">{achievement.title}</CardTitle>
                <CardDescription className="text-green-300/70">{achievement.description}</CardDescription>
              </div>
              <div className={cn("p-2 rounded-full", achievement.unlocked ? "bg-green-500/20" : "bg-gray-800")}>
                {achievement.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Progress</span>
                  <span>
                    {achievement.progress}/{achievement.maxProgress}
                  </span>
                </div>
                <Progress
                  value={(achievement.progress / achievement.maxProgress) * 100}
                  className="h-2 bg-gray-800"
                  indicatorClassName={achievement.unlocked ? "bg-green-500" : "bg-green-700"}
                />
                <div className="flex justify-end mt-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      achievement.unlocked ? "border-green-500 text-green-400" : "border-gray-600 text-gray-400",
                    )}
                  >
                    {achievement.category}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!explorerAchieved && (
        <Card className="mt-6 bg-gray-900 border-green-500">
          <CardHeader>
            <CardTitle className="text-green-400">Site Explorer</CardTitle>
            <CardDescription className="text-green-300/70">
              Explore all sections of the portfolio to unlock this achievement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={visitProgress} className="h-2 bg-gray-800" indicatorClassName="bg-green-700" />
            <p className="text-xs text-green-300/70 mt-2 text-right">{visitProgress}% complete</p>
          </CardContent>
        </Card>
      )}

      {filteredAchievements.length === 0 && (
        <div className="text-center py-12 text-green-400">
          <p>No achievements found with the selected filter.</p>
          <button onClick={() => setFilter("all")} className="text-green-500 underline mt-2">
            Show all achievements
          </button>
        </div>
      )}
    </div>
  )
}

