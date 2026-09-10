/**
 * StatusIcon — reusable status indicator icon.
 * Used across ProgressStep, ToolCallDisplay, TodoList, ThinkingBlock.
 *
 * @module components/atoms/StatusIcon
 */

import { memo } from 'react';
import { cn } from '../../utils/cn';

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

const STATUS_ICONS: Record<StatusIconStatus, string> = {
  running: '⟳',
  complete: '✓',
  failed: '✕',
  cancelled: '○',
  pending: '◯',
  warning: '⚠',
  info: 'ℹ',
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
      className={cn(
        'ac-status-icon',
        `ac-status-icon--${status}`,
        shouldAnimate && 'ac-spinner',
        className,
      )}
      style={{ width: `${size}px`, height: `${size}px`, fontSize: `${size}px` }}
      aria-hidden="true"
    >
      {STATUS_ICONS[status]}
    </span>
  );
});
