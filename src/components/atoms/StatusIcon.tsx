/**
 * StatusIcon — reusable status indicator icon.
 * Used across ProgressStep, ToolCallDisplay, TodoList, ThinkingBlock.
 *
 * @module components/atoms/StatusIcon
 */

import { memo } from 'react';
import { cn } from '../../utils/cn';
import { Icon } from './Icon';

export type StatusIconStatus =
  'running' | 'complete' | 'failed' | 'cancelled' | 'pending' | 'warning' | 'info';

export interface StatusIconProps {
  /** Status to display */
  status: StatusIconStatus;
  /** Size in pixels (default: 16) */
  size?: number;
  /** Whether to animate (spin) — auto-enabled for 'running' */
  animate?: boolean;
  /** Additional CSS class */
  className?: string;
}

const STATUS_CODICONS: Record<StatusIconStatus, string> = {
  running: 'loading',
  complete: 'pass',
  failed: 'error',
  cancelled: 'circle-outline',
  pending: 'circle-outline',
  warning: 'warning',
  info: 'info',
};

export const StatusIcon = memo(function StatusIcon({
  status,
  size = 16,
  animate,
  className,
}: StatusIconProps) {
  const shouldAnimate = animate ?? status === 'running';

  return (
    <span
      className={cn('ac-status-icon', `ac-status-icon--${status}`, className)}
      style={{ width: `${size}px`, height: `${size}px` }}
      aria-hidden="true"
    >
      <Icon name={STATUS_CODICONS[status]} size={size} spin={shouldAnimate} />
    </span>
  );
});
