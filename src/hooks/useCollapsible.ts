/**
 * useCollapsible — animated expand/collapse state management.
 *
 * @module hooks/useCollapsible
 */

import { useState, useCallback, useRef } from 'react';
import type { CSSProperties, RefObject } from 'react';

export interface UseCollapsibleOptions {
  /** Animation duration in ms (default: 200) */
  duration?: number;
  /** Callback when expansion state changes */
  onToggle?: (expanded: boolean) => void;
}

export interface UseCollapsibleReturn {
  /** Current expanded state */
  isExpanded: boolean;
  /** Toggle expand/collapse */
  toggle: () => void;
  /** Expand the section */
  expand: () => void;
  /** Collapse the section */
  collapse: () => void;
  /** Ref to attach to the collapsible content container */
  contentRef: RefObject<HTMLDivElement | null>;
  /** Inline styles for the collapsible container */
  style: CSSProperties;
}

/**
 * Hook for managing collapsible section state.
 *
 * @param defaultExpanded - Initial expanded state (default: false)
 * @param options - Configuration options
 */
export function useCollapsible(
  defaultExpanded = false,
  options: UseCollapsibleOptions = {},
): UseCollapsibleReturn {
  const { duration = 200, onToggle } = options;
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const contentRef = useRef<HTMLDivElement>(null);

  const expand = useCallback(() => {
    setIsExpanded(true);
    onToggle?.(true);
  }, [onToggle]);

  const collapse = useCallback(() => {
    setIsExpanded(false);
    onToggle?.(false);
  }, [onToggle]);

  const toggle = useCallback(() => {
    setIsExpanded((prev) => {
      const next = !prev;
      onToggle?.(next);
      return next;
    });
  }, [onToggle]);

  const style: CSSProperties = {
    overflow: 'hidden',
    transition: `height ${duration}ms ease`,
    height: isExpanded ? 'auto' : 0,
  };

  return {
    isExpanded,
    toggle,
    expand,
    collapse,
    contentRef,
    style,
  };
}
