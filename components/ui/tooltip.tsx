import React, { useState, useEffect } from 'react';

interface TooltipProps {
  children: React.ReactNode;
  text: string;
  isMobile?: boolean;
  isTablet?: boolean;
  showTooltip?: boolean;
}

export function Tooltip({ children, text, isMobile, isTablet, showTooltip = false }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Handle hover events
  const handleMouseEnter = () => {
    if (!isMobile && !isTablet) {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile && !isTablet) {
      setIsVisible(false);
    }
  };

  // Handle click events for mobile/tablet
  const handleClick = (e: React.MouseEvent) => {
    if (isMobile || isTablet) {
      e.preventDefault();
      setIsVisible(!isVisible);
    }
  };

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isVisible && (isMobile || isTablet)) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, isMobile, isTablet]);

  if (!showTooltip) return <>{children}</>;

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {children}
      {isVisible && (
        <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 ${isMobile || isTablet ? 'w-28' : 'w-64'} opacity-100 transition-opacity duration-200 z-50`}>
          <div className="bg-gray-900 border border-green-500 p-2 rounded-md shadow-lg text-xs text-green-400">
            <p className="text-center">{text}</p>
            {/* Triangle Pointer */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 border-r border-b border-green-500 transform rotate-45"></div>
          </div>
        </div>
      )}
    </div>
  );
}
