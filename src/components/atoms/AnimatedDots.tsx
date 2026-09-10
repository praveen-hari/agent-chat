/**
 * AnimatedDots — three-dot typing indicator (pulsing animation).
 *
 * @module components/atoms/AnimatedDots
 */

import { memo } from 'react';
import { cn } from '../../utils/cn';

export interface AnimatedDotsProps {
  /** Number of dots (default: 3) */
  count?: number;
  /** Accessible label (default: 'Loading') */
  label?: string;
  /** Additional CSS class */
  className?: string;
}

export const AnimatedDots = memo(function AnimatedDots({
  count = 3,
  label = 'Loading',
  className,
}: AnimatedDotsProps) {
  return (
    <span className={cn('ac-animated-dots', className)} role="status" aria-label={label}>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="ac-dot" />
      ))}
    </span>
  );
});
