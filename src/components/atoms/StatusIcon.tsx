/**
 * Reusable status indicator icon used across multiple components.
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
  /** Whether to animate (spin the running spinner) */
  animate?: boolean;
  /** Accessible label override (default: status-specific text) */
  label?: string;
  /** Additional CSS class */
  className?: string;
}

/** Mapping of status to visual icon and accessible label */
const STATUS_MAP: Record<StatusIconStatus, { icon: string; label: string }> = {
  running: { icon: '◌', label: 'In progress' },
  complete: { icon: '✓', label: 'Complete' },
  failed: { icon: '✕', label: 'Failed' },
  cancelled: { icon: '●', label: 'Cancelled' },
  pending: { icon: '○', label: 'Pending' },
  warning: { icon: '⚠', label: 'Warning' },
  info: { icon: 'ℹ', label: 'Information' },
};

/**
 * Renders a status indicator icon with appropriate color and animation.
 *
 * @example
 * ```tsx
 * <StatusIcon status="running" />
 * <StatusIcon status="complete" />
 * <StatusIcon status="failed" size={20} />
 * ```
 */
export const StatusIcon = memo(function StatusIcon({
  status,
  size = 16,
  animate = true,
  label,
  className,
}: StatusIconProps) {
  const { icon, label: defaultLabel } = STATUS_MAP[status];
  const accessibleLabel = label ?? defaultLabel;

  return (
    <span
      className={cn('ac-status-icon', `ac-status-icon--${status}`, className)}
      role="img"
      aria-label={accessibleLabel}
      style={{ width: size, height: size, fontSize: size }}
    >
      {/* Spinner rotates when running and animate is enabled */}
      <span className={cn(status === 'running' && animate && 'ac-spinner')} aria-hidden="true">
        {icon}
      </span>
    </span>
  );
});
