"use client"

import { useEffect, useState, useRef } from 'react';
import { Trophy, X, ChevronRight } from 'lucide-react';
import type { Achievement } from '@/lib/achievements-context';

interface AchievementNotificationProps {
  achievement: Achievement | null;
  onClose: () => void;
  onNavigate: () => void;
  isMobile: boolean;
}

// Long enough to read twice; the timer holds while a finger or the mouse is on
// the toast (WCAG 2.2.1).
const SHOW_MS = 7000;

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
  const [held, setHeld] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Minimum distance (in pixels) to consider a swipe
  const minSwipeDistance = 50;

  // Each toast starts fresh: a swipe from the last one mustn't carry over.
  useEffect(() => {
    setIsDismissing(false);
    setSwipeOffset(0);
    setSwipeDirection(null);
    setHeld(false);
  }, [achievement]);

  // Auto-dismiss, unless someone is holding or pointing at it.
  useEffect(() => {
    if (achievement && !held) {
      const timer = setTimeout(() => {
        onClose();
      }, SHOW_MS);

      return () => clearTimeout(timer);
    }
  }, [achievement, onClose, held]);

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
    setHeld(true);
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
    setHeld(false);

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

  const isSecret = achievement?.isSecret;
  const heading = isSecret ? 'Secret achievement unlocked' : 'Achievement unlocked';

  // Desktop: the top right corner. Phone: under the terminal's pinned header
  // (it publishes its height as --terminal-header-h), so the menu, chat and
  // tabs stay reachable while it shows; the prompt is at the bottom. Centred
  // with inset-x-0 + mx-auto rather than left-1/2 + -translate-x-1/2: the
  // slide-down animation and the swipe both set `transform`.
  const positionClass = isMobile
    ? "inset-x-0 mx-auto w-[calc(100%-1.5rem)] max-w-sm"
    : "top-4 right-4 w-80";
  const positionStyle = isMobile
    ? { top: "calc(var(--terminal-header-h, env(safe-area-inset-top, 0px)) + 0.5rem)" }
    : undefined;

  return (
    <>
      {/* Always in the page, so screen readers hear each unlock without the
          toast taking focus (WCAG 4.1.3). */}
      <div role="status" className="sr-only">
        {achievement ? `${heading}: ${achievement.title}` : ""}
      </div>

      {achievement && (
        <div
          ref={notificationRef}
          className={`fixed ${positionClass} bg-gray-900 border-2 ${isSecret ? 'border-yellow-400' : 'border-green-500'} rounded-md shadow-lg shadow-black/60 z-[60] animate-slide-down motion-reduce:animate-none cursor-pointer transition-transform duration-300 motion-reduce:transition-none`}
          style={{
            ...positionStyle,
            transform: isDismissing && swipeDirection === 'left'
              ? 'translateX(-100vw)'
              : isDismissing && swipeDirection === 'right'
              ? 'translateX(100vw)'
              : swiping
              ? `translateX(${swipeOffset}px)`
              : 'translateX(0)',
            touchAction: 'pan-y',
          }}
          onClick={() => {
            if (!swiping) {
              onNavigate(); // Navigate to YourAchievements
              onClose(); // Close the notification
            }
          }}
          onPointerEnter={(e) => e.pointerType === 'mouse' && setHeld(true)}
          onPointerLeave={(e) => e.pointerType === 'mouse' && setHeld(false)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className={`flex items-center ${isMobile ? 'gap-3 py-1.5 pl-3' : 'gap-3 p-4 pr-1'}`}>
            <div className={`shrink-0 rounded-full ${isMobile ? 'p-2' : 'p-3'} ${isSecret ? 'bg-yellow-400/80' : 'bg-green-500/20'}`}>
              {achievement.icon || <Trophy className={isMobile ? "h-4 w-4 text-green-400" : "h-6 w-6 text-green-400"} />}
            </div>
            <div className="min-w-0 flex-grow">
              <h3 className={`font-bold ${isMobile ? 'text-sm' : ''} ${isSecret ? 'text-yellow-400' : 'text-green-400'}`}>
                {isSecret ? '🌟 ' : ''}{heading}
              </h3>
              <p className="text-green-300 font-medium line-clamp-2 text-sm">{achievement.title}</p>
              {isMobile && (
                <p className="mt-0.5 flex items-center text-xs text-green-400/80">
                  View your achievements <ChevronRight size={12} aria-hidden="true" />
                </p>
              )}
            </div>
            {/* 44px, so a finger closes it without opening it. */}
            <button
              className="flex h-11 w-11 shrink-0 items-center justify-center text-green-500 hover:text-green-400"
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the onNavigate
                onClose(); // Close the notification
              }}
              aria-label="Close notification"
            >
              <X size={isMobile ? 18 : 16} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
