/**
 * useAutoScroll — smart auto-scroll with user-scroll-lock detection.
 *
 * @module hooks/useAutoScroll
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseAutoScrollOptions {
  /** Threshold in pixels to consider "at bottom" (default: 100) */
  threshold?: number;
  /** Scroll behavior (default: 'smooth') */
  behavior?: ScrollBehavior;
  /** Whether auto-scroll is enabled (default: true) */
  enabled?: boolean;
}

export interface UseAutoScrollReturn {
  /** Whether the container is currently scrolled to bottom */
  isAtBottom: boolean;
  /** Manually scroll to bottom */
  scrollToBottom: () => void;
  /** Whether auto-scroll is locked (user scrolled up) */
  isLocked: boolean;
}

/**
 * Hook that auto-scrolls a container to the bottom on new content,
 * with user-scroll-lock detection.
 */
export function useAutoScroll(
  containerRef: React.RefObject<HTMLElement | null>,
  dependencies: unknown[],
  options: UseAutoScrollOptions = {},
): UseAutoScrollReturn {
  const { threshold = 100, behavior = 'smooth', enabled = true } = options;
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const userScrolledRef = useRef(false);

  const checkIsAtBottom = useCallback(() => {
    const el = containerRef.current;
    if (!el) return true;
    const { scrollTop, scrollHeight, clientHeight } = el;
    return scrollHeight - scrollTop - clientHeight < threshold;
  }, [containerRef, threshold]);

  const scrollToBottom = useCallback(() => {
    const el = containerRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior });
      setIsLocked(false);
      setIsAtBottom(true);
    }
  }, [containerRef, behavior]);

  // Track scroll position
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = () => {
      const atBottom = checkIsAtBottom();
      setIsAtBottom(atBottom);

      if (!atBottom && !userScrolledRef.current) {
        userScrolledRef.current = true;
        setIsLocked(true);
      } else if (atBottom) {
        userScrolledRef.current = false;
        setIsLocked(false);
      }
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [containerRef, checkIsAtBottom]);

  // Auto-scroll on dependency changes
  useEffect(() => {
    if (!enabled || isLocked) return;
    if (checkIsAtBottom()) {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        scrollToBottom();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { isAtBottom, scrollToBottom, isLocked };
}
