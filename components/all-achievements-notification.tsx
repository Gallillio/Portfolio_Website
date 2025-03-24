"use client"

import { useState, useEffect, useCallback } from 'react';
import { Trophy, Cookie } from 'lucide-react';

interface AllAchievementsNotificationProps {
  isMobile: boolean;
  onClose: () => void;
  showCookieModal: () => void;
}

export default function AllAchievementsNotification({ 
  isMobile, 
  onClose, 
  showCookieModal
}: AllAchievementsNotificationProps) {
  const [isClosing, setIsClosing] = useState(false);
  
  // Wrap handleClose in useCallback
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 600); // Match animation duration
  }, [onClose]); // Add onClose as a dependency

  // Auto-dismiss notification after 15 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 15000);
    
    return () => clearTimeout(timer);
  }, [handleClose]); // Add handleClose as a dependency

  const handleCollectCookie = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      showCookieModal();
    }, 600); // Match animation duration
  };

  // Position based on mobile or desktop
  const positionClass = isMobile
    ? "top-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-sm"
    : "top-4 right-4 max-w-md";

  return (
    <div 
      className={`fixed ${positionClass} bg-gray-900 border-2 border-green-500 p-5 rounded-md shadow-lg z-50 ${isClosing ? 'animate-slide-up' : 'animate-slide-down'}`}
    >
      <div className="flex items-center gap-4 mb-3">
        <div className="p-3 rounded-full bg-green-500/30">
          <Trophy className="h-8 w-8 text-green-400" />
        </div>
        <div className="flex-grow">
          <h3 className="font-bold text-lg text-green-400">
            🏆 All Achievements Collected!
          </h3>
          <p className="text-green-300 text-sm mt-1">
            You&apos;ve successfully unlocked all achievements. Impressive work!
          </p>
        </div>
        <button 
          className="text-green-500 hover:text-green-400 p-1 rounded-full hover:bg-black/30"
          onClick={handleClose}
          aria-label="Close notification"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div className="mt-4">
        <p className="text-green-300/90 text-sm">
          For all your hard work exploring my portfolio, here&apos;s a cookie 🍪
        </p>
        
        <button
          onClick={handleCollectCookie}
          className="w-full mt-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500 rounded-md py-2 px-4 flex items-center justify-center gap-2 transition-colors duration-300"
        >
          <Cookie className="h-5 w-5" />
          <span>Collect Cookie 🍪</span>
        </button>
      </div>
    </div>
  );
} 