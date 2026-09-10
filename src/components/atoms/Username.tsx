/**
 * Displays a username with bold heading style.
 *
 * @module components/atoms/Username
 */

import { memo } from 'react';
import { cn } from '../../utils/cn';

export interface UsernameProps {
  /** Display name */
  name: string;
  /** Visual variant */
  variant?: 'default' | 'compact';
  /** Additional CSS class */
  className?: string;
}

/**
 * Renders a username as a bold span.
 *
 * @example
 * ```tsx
 * <Username name="Copilot" />
 * ```
 */
export const Username = memo(function Username({
  name,
  variant = 'default',
  className,
}: UsernameProps) {
  return (
    <span className={cn('ac-username', variant === 'compact' && 'ac-username--compact', className)}>
      {name}
    </span>
  );
});
