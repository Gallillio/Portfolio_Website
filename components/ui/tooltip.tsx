import React, { useState, useEffect, useRef } from 'react';

interface TooltipProps {
  children: React.ReactNode;
  text: string;
  isMobile?: boolean;
  isTablet?: boolean;
  showTooltip?: boolean;
}

export function Tooltip({ children, text, isMobile, isTablet, showTooltip = false }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Handle hover events
  const handleMouseEnter = () => {
    if (!isMobile && !isTablet) {
      setIsVisible(true);
      startAutoHideTimer();
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile && !isTablet) {
      setIsVisible(false);
      clearAutoHideTimer();
    }
  };

  // Handle click events for mobile/tablet
  const handleClick = (e: React.MouseEvent) => {
    if (isMobile || isTablet) {
      e.preventDefault();
      setIsVisible(!isVisible);
      if (!isVisible) {
        startAutoHideTimer();
      } else {
        clearAutoHideTimer();
      }
    }
  };

  // Start the auto-hide timer
  const startAutoHideTimer = () => {
    clearAutoHideTimer(); // Clear any existing timer
    timerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 5000); // 5 seconds
  };

  // Clear the auto-hide timer
  const clearAutoHideTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Close tooltip when clicking outside or scrolling
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isVisible && 
        tooltipRef.current && 
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    const handleScroll = () => {
      if (isVisible) {
        setIsVisible(false);
      }
    };

    const handleInteraction = () => {
      if (isVisible) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('scroll', handleScroll, true);
      document.addEventListener('touchstart', handleInteraction, { passive: true });
      document.addEventListener('keydown', handleInteraction);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
      clearAutoHideTimer();
    };
  }, [isVisible]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      clearAutoHideTimer();
    };
  }, []);

  if (!showTooltip) return <>{children}</>;

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      ref={tooltipRef}
    >
      {children}
      {isVisible && (
        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 ${isMobile || isTablet ? 'w-28' : 'w-64'} opacity-100 transition-opacity duration-200 z-50`}>
          <div className="bg-gray-900 border border-green-500 p-2 rounded-md shadow-lg text-xs text-green-400">
            <p className="text-center whitespace-pre-line">{text}</p>
            {/* Triangle Pointer */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 border-r border-b border-green-500 transform rotate-45"></div>
          </div>
        </div>
      )}
    </div>
  );
}
