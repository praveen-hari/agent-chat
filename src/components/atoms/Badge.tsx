/**
 * Notification-style count or text badge.
 *
 * @module components/atoms/Badge
 */

import { memo } from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps {
  /** Count to display */
  count?: number;
  /** Text to display (alternative to count) */
  text?: string;
  /** Color variant */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  /** Whether to hide when count is zero */
  hideZero?: boolean;
  /** Additional CSS class */
  className?: string;
}

/**
 * Renders a small rounded badge showing a count or text.
 *
 * @example
 * ```tsx
 * <Badge count={3} />
 * <Badge text="Outdated" variant="warning" />
 * <Badge count={0} hideZero /> // renders nothing
 * ```
 */
export const Badge = memo(function Badge({
  count,
  text,
  variant = 'default',
  hideZero = false,
  className,
}: BadgeProps) {
  const display = text ?? (count !== undefined ? String(count) : '');

  if (hideZero && count === 0) {
    return null;
  }

  return (
    <span
      className={cn('ac-badge', variant !== 'default' && `ac-badge--${variant}`, className)}
      aria-label={text ? text : `${count} items`}
    >
      {display}
    </span>
  );
});
