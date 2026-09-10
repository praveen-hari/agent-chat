/**
 * Text with animated shimmer gradient effect.
 * Used in thinking titles and progress messages.
 *
 * @module components/atoms/ShimmerText
 */

import { memo } from 'react';
import { cn } from '../../utils/cn';

export interface ShimmerTextProps {
  /** Text content */
  text: string;
  /** Whether shimmer is active (default: true) */
  active?: boolean;
  /** Shimmer mode: 'full' shimmers all text, 'partial' only shimmers the leading word */
  mode?: 'full' | 'partial';
  /** Additional CSS class */
  className?: string;
}

/**
 * Renders text with a shimmer gradient animation when active.
 * In 'partial' mode, only the first word shimmers; the rest is static.
 *
 * @example
 * ```tsx
 * <ShimmerText text="Thinking..." active />
 * <ShimmerText text="Searching files in workspace" active mode="partial" />
 * ```
 */
export const ShimmerText = memo(function ShimmerText({
  text,
  active = true,
  mode = 'full',
  className,
}: ShimmerTextProps) {
  if (!active) {
    return (
      <span className={cn('ac-shimmer-text', 'ac-shimmer-text--inactive', className)}>{text}</span>
    );
  }

  if (mode === 'partial') {
    const spaceIndex = text.indexOf(' ');
    const firstWord = spaceIndex === -1 ? text : text.slice(0, spaceIndex);
    const rest = spaceIndex === -1 ? '' : text.slice(spaceIndex);

    return (
      <span className={cn('ac-shimmer-text-wrapper', className)}>
        <span className="ac-shimmer-text">{firstWord}</span>
        {rest && <span className="ac-shimmer-text-static">{rest}</span>}
      </span>
    );
  }

  return <span className={cn('ac-shimmer-text', className)}>{text}</span>;
});
