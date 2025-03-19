"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Trophy, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Achievement } from "@/lib/achievements-context"

interface AchievementNotificationProps {
  achievement: Achievement | null
  onClose: () => void
  onNavigate: () => void
}

export default function AchievementNotification({ achievement, onClose, onNavigate }: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (achievement) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 300) // Wait for animation to complete
      }, 5000) // Show for 5 seconds

      return () => clearTimeout(timer)
    }
  }, [achievement, onClose])

  if (!achievement) return null

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event from bubbling up to parent
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 transition-all duration-300 transform",
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
      )}
    >
      <Card
        className="bg-gray-900 border-green-500 shadow-lg shadow-green-500/20 cursor-pointer hover:shadow-green-500/40 relative overflow-hidden"
        onClick={onNavigate}
      >
        {/* Header with close button */}
        <div className="absolute top-0 right-0 pt-2 pr-2">
          <div 
            className="rounded-full hover:bg-gray-800 transition-colors text-green-400 hover:text-green-300 cursor-pointer z-10 h-6 w-6 flex items-center justify-center"
            onClick={handleClose}
            title="Dismiss"
          >
            <X className="h-4 w-4" />
          </div>
        </div>
        
        {/* Main content with increased right padding to avoid overlap */}
        <CardContent className="p-4 pr-8 flex items-center space-x-3">
          <div className="p-2 rounded-full bg-green-500/20 text-green-400 flex-shrink-0">
            {achievement.icon || <Trophy className="h-6 w-6" />}
          </div>
          <div className="flex-grow min-w-0"> {/* Allow text container to shrink if needed */}
            <h4 className="text-green-400 font-bold truncate">Achievement Unlocked!</h4>
            <p className="text-green-300 text-sm truncate">{achievement.title}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

