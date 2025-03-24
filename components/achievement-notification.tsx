"use client"

import { useEffect, useState, useRef } from 'react';
import { Trophy } from 'lucide-react';
import type { Achievement } from '@/lib/achievements-context';

interface AchievementNotificationProps {
  achievement: Achievement | null;
  onClose: () => void;
  onNavigate: () => void;
  isMobile: boolean;
}

export default function AchievementNotification({ 
  achievement, 
  onClose, 
  onNavigate,
  isMobile
}: AchievementNotificationProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swiping, setSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDismissing, setIsDismissing] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Minimum distance (in pixels) to consider a swipe
  const minSwipeDistance = 50;

  // Auto-dismiss notification after 7 seconds
  useEffect(() => {
    if (achievement) {
      const timer = setTimeout(() => {
        onClose();
      }, 7000);
      
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  // Handle swipe animation and dismiss
  useEffect(() => {
    if (isDismissing && notificationRef.current) {
      const timer = setTimeout(() => {
        onClose();
      }, 300); // Match the duration of the swipe-out animation
      
      return () => clearTimeout(timer);
    }
  }, [isDismissing, onClose]);

  // Handle touch start
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(null);
    setSwiping(true);
  };

  // Handle touch move
  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);
    
    // Calculate swipe offset for animation
    const offset = currentTouch - touchStart;
    setSwipeOffset(offset);
    
    // Determine swipe direction
    if (offset > 0) {
      setSwipeDirection('right');
    } else if (offset < 0) {
      setSwipeDirection('left');
    }
  };

  // Handle touch end
  const onTouchEnd = () => {
    setSwiping(false);
    
    if (!touchStart || !touchEnd) return;
    
    const distance = touchEnd - touchStart;
    const isLeftSwipe = distance < -minSwipeDistance;
    const isRightSwipe = distance > minSwipeDistance;
    
    // If swipe distance exceeds threshold, dismiss notification
    if (isLeftSwipe || isRightSwipe) {
      setIsDismissing(true);
    } else {
      // Reset position if swipe was not enough
      setSwipeOffset(0);
      setSwipeDirection(null);
    }
    
    // Reset touch coordinates
    setTouchStart(null);
    setTouchEnd(null);
  };

  if (!achievement) return null;
  
  const isSecret = achievement.isSecret;
  
  // Position class based on mobile or desktop
  const positionClass = isMobile
    ? "top-4 left-[45%] transform -translate-x-1/2 w-[95%] max-w-sm"
    : "top-4 right-4 w-80";

  // Padding and styling based on mobile or desktop
  const paddingClass = isMobile
    ? "p-2"
    : "p-4";

  const animationClass = isMobile
    ? "animate-slide-down"
    : "animate-slide-down";

  return (
    <div 
      ref={notificationRef}
      className={`fixed ${positionClass} bg-gray-900 border-2 border-green-500 ${paddingClass} rounded-md shadow-lg z-50 ${animationClass} cursor-pointer transition-transform duration-300`}
      style={{ 
        transform: isDismissing && swipeDirection === 'left' 
          ? 'translateX(-100vw)' 
          : isDismissing && swipeDirection === 'right' 
          ? 'translateX(100vw)' 
          : swiping 
          ? `translateX(${swipeOffset}px)` 
          : 'translateX(0)' 
      }}
      onClick={() => {
        if (!swiping) {
          onNavigate(); // Navigate to YourAchievements
          onClose(); // Close the notification
        }
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {isMobile ? (
        // Mobile optimized layout
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-full ${isSecret ? 'bg-yellow-400/80' : 'bg-green-500/20'}`}>
            {achievement.icon || <Trophy className="h-4 w-4 text-green-400" />}
          </div>
          <div className="flex-grow truncate">
            <div className="flex items-center justify-between">
              <h3 className={`font-bold text-sm ${isSecret ? 'text-yellow-400' : 'text-green-400'}`}>
                {isSecret ? '🌟 Secret Unlocked!' : 'Achievement!'}
              </h3>
              <button 
                className="text-green-500 hover:text-green-400 -mr-1"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the onNavigate
                  onClose(); // Close the notification
                }}
                aria-label="Close notification"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <p className="text-green-300 text-xs font-medium truncate">{achievement.title}</p>
          </div>
        </div>
      ) : (
        // Desktop layout remains the same
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-full ${isSecret ? 'bg-yellow-400' : 'bg-green-500/20'}`}>
            {achievement.icon || <Trophy className="h-6 w-6 text-green-400" />}
          </div>
          <div className="flex-grow">
            <h3 className={`font-bold ${isSecret ? 'text-yellow-400' : 'text-green-400'}`}>
              {isSecret ? '🌟 Secret Achievement Unlocked!' : 'Achievement Unlocked!'}
            </h3>
            <p className="text-green-300 text-sm font-medium">{achievement.title}</p>
          </div>
          
          <button 
            className="text-green-500 hover:text-green-400"
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering the onNavigate
              onClose(); // Close the notification
            }}
            aria-label="Close notification"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      )}

      {isMobile && (
        <div className="mt-1 opacity-70 text-[0.6rem] text-green-400 text-center">
          Swipe to dismiss • Tap to view
        </div>
      )}
    </div>
  );
}

