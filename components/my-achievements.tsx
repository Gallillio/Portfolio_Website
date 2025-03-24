"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Trophy, Star, Languages, ExternalLink, ShieldCheck } from "lucide-react"
import { personalAchievements } from "@/lib/profile-data"
import { useAchievements } from "@/lib/achievements-context"

// Map of icon strings to Lucide components
const iconMap = {
  trophy: <Trophy className="h-6 w-6" />,
  star: <Star className="h-6 w-6" />,
  book: <BookOpen className="h-6 w-6" />,
  languages: <Languages className="h-6 w-6" />,
  shieldCheck: <ShieldCheck className="h-6 w-6" />,
} as const;

export default function MyAchievements() {
  const { visitTab } = useAchievements()
  const [hasMarkedVisit, setHasMarkedVisit] = useState(false)

  // Mark this tab as visited for the site explorer achievement - only once
  useEffect(() => {
    if (!hasMarkedVisit) {
      visitTab("my-achievements")
      setHasMarkedVisit(true)
    }
  }, [visitTab, hasMarkedVisit])

  return (
    <div className="bg-black text-green-500 p-6 min-h-[70vh] font-mono">
      <h2 className="text-2xl mb-6 border-b border-green-500 pb-2">My Achievements</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {personalAchievements.map((achievement) => (
          <Card
            key={achievement.id}
            className="bg-gray-900 border-green-500 hover:shadow-lg hover:shadow-green-500/20 transition-all hover:border-green-400 hover:scale-[1.02] hover:-translate-y-1 group flex flex-col"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-green-400 group-hover:text-green-300 transition-colors duration-200">
                  {achievement.title}
                  {achievement.link && (
                    <a 
                      href={achievement.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center ml-2 text-green-400 hover:text-green-300 mt-2"
                    >
                      <ExternalLink className="h-5 w-5 text-yellow-400 hover:text-yellow-300 transition duration-200" />
                      <span className="ml-1 text-sm text-yellow-400 hover:text-yellow-300 transition duration-200">{achievement.linkText}</span>
                    </a>
                  )}
                </CardTitle>
                <CardDescription className="text-green-300/80 whitespace-pre-line mt-1 text-base group-hover:text-green-300/90 transition-colors duration-200">
                  {achievement.description.split('\n')[0]}
                  {achievement.description.split('\n').length > 1 && (
                    <span className="block mt-2 text-sm text-green-300/60 group-hover:text-green-300/70 transition-colors duration-200">
                      {achievement.description.split('\n').slice(1).join('\n')}
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="p-2 rounded-full bg-green-500/20 group-hover:bg-green-500/30 transition-colors duration-200">{iconMap[achievement.icon]}</div>
            </CardHeader>

            <CardContent className="flex-grow">
              {/* Main content area that can grow */}
            </CardContent>
            
            <CardFooter className="mt-auto pt-2">
              <div className="flex justify-between items-center w-full">
                <span className="text-green-300/70 group-hover:text-green-300/90 transition-colors duration-200">{achievement.year}</span>
                <Badge variant="outline" className="border-green-500 text-green-400 group-hover:border-green-400 group-hover:text-green-300 transition-colors duration-200">
                  {achievement.category}
                </Badge>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

