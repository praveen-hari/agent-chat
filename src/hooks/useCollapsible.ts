/**
 * Hook for managing collapsible section state with animation.
 *
 * @module hooks/useCollapsible
 */

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Manages expand/collapse state with height animation support.
 *
 * @param defaultExpanded - Initial expanded state (default: false)
 * @param options - Configuration
 * @returns State and handlers for the collapsible
 *
 * @example
 * const { isExpanded, toggle, contentRef, style } = useCollapsible(false);
 */
export function useCollapsible(
  defaultExpanded = false,
  options?: {
    /** Callback when expansion state changes */
    onToggle?: (expanded: boolean) => void;
  },
) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const contentRef = useRef<HTMLDivElement>(null);
  const onToggleRef = useRef(options?.onToggle);
  onToggleRef.current = options?.onToggle;

  const toggle = useCallback(() => {
    setIsExpanded((prev) => {
      const next = !prev;
      onToggleRef.current?.(next);
      return next;
    });
  }, []);

  const expand = useCallback(() => {
    setIsExpanded(true);
    onToggleRef.current?.(true);
  }, []);

  const collapse = useCallback(() => {
    setIsExpanded(false);
    onToggleRef.current?.(false);
  }, []);

  // Sync with defaultExpanded changes (e.g., autoExpand in SubAgent)
  useEffect(() => {
    setIsExpanded(defaultExpanded);
  }, [defaultExpanded]);

  return {
    /** Whether currently expanded */
    isExpanded,
    /** Toggle between expanded and collapsed */
    toggle,
    /** Force expand */
    expand,
    /** Force collapse */
    collapse,
    /** Ref to attach to the collapsible content container */
    contentRef,
    /** Inline styles for height animation */
    style: {
      height: isExpanded ? 'auto' : '0',
      overflow: 'hidden' as const,
    },
  };
}
