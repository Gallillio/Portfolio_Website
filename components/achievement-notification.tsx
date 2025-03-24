"use client"

import { useEffect } from 'react';
import { Trophy } from 'lucide-react';
import type { Achievement } from '@/lib/achievements-context';

interface AchievementNotificationProps {
  achievement: Achievement | null;
  onClose: () => void;
  onNavigate: () => void;
}

export default function AchievementNotification({ 
  achievement, 
  onClose, 
  onNavigate 
}: AchievementNotificationProps) {
  // Auto-dismiss notification after 7 seconds
  useEffect(() => {
    if (achievement) {
      const timer = setTimeout(() => {
        onClose();
      }, 7000);
      
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  if (!achievement) return null;
  
  const isSecret = achievement.isSecret;

  return (
    <div 
      className="fixed top-4 right-4 bg-gray-900 border-2 border-green-500 p-4 rounded-md shadow-lg z-50 max-w-sm animate-slide-down cursor-pointer"
      onClick={() => {
        onNavigate(); // Navigate to YourAchievements
        onClose(); // Close the notification
      }}
    >
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-full ${isSecret ? 'bg-yellow-400' : 'bg-green-500/20'}`}>
          {achievement.icon || <Trophy className="h-6 w-6 text-green-400" />}
        </div>
        <div className="flex-grow">
          <h3 className={`font-bold ${isSecret ? 'text-yellow-400' : 'text-green-400'}`}>
            {isSecret ? '🌟 Secret Achievement Unlocked!' : 'Achievement Unlocked!'}
          </h3>
          <p className="text-green-300 text-sm font-medium">{achievement.title}</p>
          {/* <p className="text-green-300/70 text-xs mt-1">{achievement.description}</p> */}
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
    </div>
  );
}

