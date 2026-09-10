/**
 * ShimmerText — text with animated shimmer gradient effect.
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
  /** Shimmer mode: 'full' shimmers all text, 'partial' only shimmers the leading verb */
  mode?: 'full' | 'partial';
  /** Additional CSS class */
  className?: string;
}

export const ShimmerText = memo(function ShimmerText({
  text,
  active = true,
  mode = 'full',
  className,
}: ShimmerTextProps) {
  // Partial mode: split into first word (shimmer) + rest (static)
  if (mode === 'partial' && active) {
    const spaceIndex = text.indexOf(' ');
    if (spaceIndex > 0) {
      const firstWord = text.slice(0, spaceIndex);
      const rest = text.slice(spaceIndex);
      return (
        <span className={cn('ac-shimmer-text-wrapper', className)}>
          <span className="ac-shimmer-text">{firstWord}</span>
          <span>{rest}</span>
        </span>
      );
    }
  }

  return (
    <span className={cn('ac-shimmer-text', !active && 'ac-shimmer-text--inactive', className)}>
      {text}
    </span>
  );
});
