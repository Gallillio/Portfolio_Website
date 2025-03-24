"use client"

import { useState, useEffect } from 'react'
import { useAchievements } from '@/lib/achievements-context'
import AchievementNotification from './achievement-notification'
import { useRouter } from 'next/navigation'

export default function AchievementNotificationProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const router = useRouter()
  const { 
    lastUnlockedAchievement, 
    clearLastUnlockedAchievement,
  } = useAchievements()
  
  const [isMobile, setIsMobile] = useState(false)
  
  // Check window size for mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    // Set initial value
    handleResize()
    
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])
  
  // Navigate to the achievements tab when notification is clicked
  const handleNavigateToAchievements = () => {
    router.push('/?tab=your-achievements')
  }
  
  return (
    <>
      {children}
      
      {lastUnlockedAchievement && (
        <AchievementNotification 
          achievement={lastUnlockedAchievement}
          onClose={clearLastUnlockedAchievement}
          onNavigate={handleNavigateToAchievements}
          isMobile={isMobile}
        />
      )}
    </>
  )
} 