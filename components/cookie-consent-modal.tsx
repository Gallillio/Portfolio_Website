"use client"

import { useState, useEffect, useCallback } from 'react';
import { Cookie, ShieldAlert, X } from 'lucide-react';

interface CookieConsentModalProps {
  onClose: () => void;
}

export default function CookieConsentModal({ onClose }: CookieConsentModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Wrap handleClose in useCallback
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  // Handle clicking outside the modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('modal-backdrop')) {
      handleClose();
    }
  };

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [handleClose]);

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 modal-backdrop"
      onClick={handleBackdropClick}
    >
      <div 
        className={`relative bg-gray-900 border-2 border-green-500 rounded-md p-6 max-w-md w-[90%] mx-4 font-mono overflow-hidden shadow-2xl shadow-green-500/20 ${isClosing ? 'animate-contract' : 'animate-expand'}`}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500/30 via-green-500 to-green-500/30"></div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-500/20">
              <Cookie className="h-5 w-5 text-green-400" />
            </div>
            <h3 className="text-green-400 font-bold">Cookie Policy</h3>
          </div>
          
          <button 
            onClick={handleClose}
            className="text-green-500 hover:text-green-400 p-1 rounded-full hover:bg-black/30"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mt-4 text-green-300/90 text-sm space-y-3">
          <div className="flex gap-2">
            <span className="text-green-500/70">$</span>
            <p className="typing-effect">
              We use cookies to improve your experience on our site. By continuing to use this portfolio, you agree to our use of cookies.
            </p>
          </div>
          
          {showDetails && (
            <div className="border border-green-500/30 bg-black/30 p-3 rounded-md mt-3 animate-fade-in">
              <div className="flex items-start gap-2 mb-2">
                <ShieldAlert className="h-4 w-4 text-green-400 mt-0.5" />
                <p className="text-xs text-green-300/80">
                  Just kidding! This portfolio doesn&apos;t actually use any tracking cookies or collect any personal data. This is just a fun little Easter egg for completing all the achievements. Congratulations!
                </p>
              </div>
              <div className="mt-2 p-2 bg-black/40 rounded border border-green-500/20">
                <code className="text-xs text-green-400/80 block">
                  <span className="text-yellow-400">function</span> <span className="text-blue-400">getAchievements</span>() &#123;<br/>
                  &nbsp;&nbsp;<span className="text-yellow-400">return</span> <span className="text-green-400">&ldquo;All achieved! Great job!&ldquo;</span>;<br/>
                  &#125;
                </code>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 mt-6">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="bg-transparent border border-green-500 text-green-400 hover:bg-green-500/10 px-4 py-2 rounded transition-colors duration-300"
          >
            {showDetails ? 'Hide Details' : 'View Details'}
          </button>
          
          <button
            onClick={handleClose}
            className="bg-green-500 hover:bg-green-600 text-black font-medium px-4 py-2 rounded transition-colors duration-300"
          >
            Accept &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
} 