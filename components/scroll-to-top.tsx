"use client";

import { useEffect, useState, useRef } from "react";
import { ArrowUp } from "lucide-react";

export const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentScrollableElement, setCurrentScrollableElement] = useState<Element | null>(null);
  const scrollableContainersRef = useRef<Element[]>([]);

  // Function to detect scrollable containers
  const detectScrollableContainers = () => {
    // Find all tab content elements that have overflow-y-auto
    const scrollableElements = Array.from(
      document.querySelectorAll('[class*="overflow-y-auto"]')
    );
    
    scrollableContainersRef.current = scrollableElements;
  };

  // Reset visibility when tabs change
  useEffect(() => {
    const handleTabChange = () => {
      setIsVisible(false);
      setCurrentScrollableElement(null);
    };

    // Listen for tab changes
    window.addEventListener('switch-terminal-tab', handleTabChange);
    
    // Also listen for clicks on tab triggers
    const handleTabClick = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.closest('[role="tab"]')) {
        handleTabChange();
      }
    };
    
    document.addEventListener('click', handleTabClick);
    
    return () => {
      window.removeEventListener('switch-terminal-tab', handleTabChange);
      document.removeEventListener('click', handleTabClick);
    };
  }, []);

  // Toggle visibility based on scroll position
  useEffect(() => {
    // Initial detection of scrollable containers
    detectScrollableContainers();

    const toggleVisibility = () => {
      // Check window scroll for normal pages
      if (window.scrollY > 300) {
        setIsVisible(true);
        setCurrentScrollableElement(null);
        return;
      }

      // Check each scrollable container
      let foundScrollable = false;
      
      for (const container of scrollableContainersRef.current) {
        if (container && container.scrollTop > 300) {
          setIsVisible(true);
          setCurrentScrollableElement(container);
          foundScrollable = true;
          break;
        }
      }
      
      if (!foundScrollable) {
        setIsVisible(false);
        setCurrentScrollableElement(null);
      }
    };

    // Add scroll event listener to window
    window.addEventListener("scroll", toggleVisibility);
    
    // Add scroll event listeners to each scrollable container
    const addScrollListeners = () => {
      // Re-detect containers (in case DOM changed)
      detectScrollableContainers();
      
      // Add listeners to each container
      scrollableContainersRef.current.forEach(container => {
        container.addEventListener("scroll", toggleVisibility);
      });
    };
    
    // Initial addition of scroll listeners
    addScrollListeners();
    
    // Set up an interval to periodically recheck for scrollable containers
    // This handles dynamically created containers (e.g., when switching tabs)
    const intervalId = setInterval(addScrollListeners, 1000);

    // Clean up event listeners
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
      scrollableContainersRef.current.forEach(container => {
        container.removeEventListener("scroll", toggleVisibility);
      });
      clearInterval(intervalId);
    };
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    if (currentScrollableElement) {
      // Scroll the specific container to top
      currentScrollableElement.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      // Scroll the main window to top
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-2 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors duration-300 z-50 flex items-center justify-center"
          aria-label="Scroll to top"
        >
          <ArrowUp size={24} />
        </button>
      )}
    </>
  );
};

export default ScrollToTop; 