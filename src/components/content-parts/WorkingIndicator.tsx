/**
 * WorkingIndicator — animated dots shown while waiting for response start.
 *
 * @module components/content-parts/WorkingIndicator
 */

import { memo } from 'react';
import type { WorkingPart } from '../../types/content-parts';
import { cn } from '../../utils/cn';
import { AnimatedDots } from '../atoms/AnimatedDots';

export interface WorkingIndicatorProps extends WorkingPart {
  /** Additional CSS class */
  className?: string;
}

export const WorkingIndicator = memo(function WorkingIndicator({
  message,
  className,
}: WorkingIndicatorProps) {
  return (
    <div className={cn('ac-working', className)} data-testid="working-indicator">
      <AnimatedDots />
      {message && <span className="ac-working__message">{message}</span>}
    </div>
  );
});
