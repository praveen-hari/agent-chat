/**
 * Badge — notification-style count or text badge.
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
  /** Hide badge when count is 0 (default: false) */
  hideZero?: boolean;
  /** Additional CSS class */
  className?: string;
}

export const Badge = memo(function Badge({
  count,
  text,
  variant = 'default',
  hideZero = false,
  className,
}: BadgeProps) {
  // Hide when count is 0 and hideZero is enabled
  if (hideZero && count === 0 && !text) {
    return null;
  }

  const display = text ?? String(count ?? 0);
  const ariaLabel = text ?? `${count ?? 0} items`;

  return (
    <span
      className={cn('ac-badge', variant !== 'default' && `ac-badge--${variant}`, className)}
      aria-label={ariaLabel}
    >
      {display}
    </span>
  );
});
