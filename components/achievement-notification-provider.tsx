"use client"

import { useState, useEffect } from 'react'
import { useAchievements } from '@/lib/achievements-context'
import AchievementNotification from './achievement-notification'
import AllAchievementsNotification from './all-achievements-notification'
import CookieConsentModal from './cookie-consent-modal'
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
    allAchievementsCompleted,
    clearAllAchievementsCompleted,
  } = useAchievements()
  
  const [isMobile, setIsMobile] = useState(false)
  const [showCookieModal, setShowCookieModal] = useState(false)
  
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

  // Listen for custom cookie modal events
  useEffect(() => {
    const handleCookieModalRequest = () => {
      setShowCookieModal(true);
    };
    
    window.addEventListener('show-cookie-modal', handleCookieModalRequest);
    return () => {
      window.removeEventListener('show-cookie-modal', handleCookieModalRequest);
    };
  }, []);

  // Automatically clear individual achievement notifications when all achievements are completed
  useEffect(() => {
    if (allAchievementsCompleted && lastUnlockedAchievement) {
      clearLastUnlockedAchievement();
    }
  }, [allAchievementsCompleted, lastUnlockedAchievement, clearLastUnlockedAchievement]);
  
  // Navigate to the achievements tab when notification is clicked
  const handleNavigateToAchievements = () => {
    router.push('/?tab=your-achievements')
  }
  
  return (
    <>
      {children}
      
      {/* Give priority to the all achievements notification over individual achievement notifications */}
      {allAchievementsCompleted && !showCookieModal ? (
        <AllAchievementsNotification 
          isMobile={isMobile}
          onClose={clearAllAchievementsCompleted}
          showCookieModal={() => setShowCookieModal(true)}
        />
      ) : lastUnlockedAchievement && (
        <AchievementNotification 
          achievement={lastUnlockedAchievement}
          onClose={clearLastUnlockedAchievement}
          onNavigate={handleNavigateToAchievements}
        />
      )}
      
      {/* Cookie consent modal */}
      {showCookieModal && (
        <CookieConsentModal 
          onClose={() => setShowCookieModal(false)}
        />
      )}
    </>
  )
} 