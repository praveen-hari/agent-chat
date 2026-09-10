/**
 * ProgressStep — a progress message row with status icon and optional shimmer.
 *
 * @module components/content-parts/ProgressStep
 */

import { memo } from 'react';
import type { ProgressPart } from '../../types/content-parts';
import { cn } from '../../utils/cn';
import { StatusIcon } from '../atoms/StatusIcon';
import { ShimmerText } from '../atoms/ShimmerText';

export interface ProgressStepProps extends ProgressPart {
  /** Additional CSS class */
  className?: string;
}

export const ProgressStep = memo(function ProgressStep({
  message,
  isActive,
  shimmer = false,
  shimmerMode = 'full',
  className,
}: ProgressStepProps) {
  return (
    <div
      className={cn('ac-progress-step', isActive && 'ac-progress-step--active', className)}
      data-testid="progress-step"
    >
      <StatusIcon status={isActive ? 'running' : 'complete'} size={14} />
      <span className="ac-progress-step__message">
        {shimmer && isActive ? <ShimmerText text={message} mode={shimmerMode} /> : message}
      </span>
    </div>
  );
});
