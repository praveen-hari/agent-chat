/**
 * Small pixel-art-style loading spinner.
 * Matches VS Code's createPixelSpinner() aesthetic.
 *
 * @module components/atoms/PixelSpinner
 */

import { memo } from 'react';
import { cn } from '../../utils/cn';

export interface PixelSpinnerProps {
  /** Size in pixels (default: 14) */
  size?: number;
  /** Accessible label for screen readers */
  label?: string;
  /** Additional CSS class */
  className?: string;
}

/**
 * Renders a rotating pixel spinner for loading states.
 *
 * @example
 * ```tsx
 * <PixelSpinner />
 * <PixelSpinner size={12} label="Loading servers" />
 * ```
 */
export const PixelSpinner = memo(function PixelSpinner({
  size = 14,
  label = 'Loading',
  className,
}: PixelSpinnerProps) {
  return (
    <span
      className={cn('ac-pixel-spinner', className)}
      role="status"
      aria-label={label}
      style={{ width: size, height: size }}
    >
      <span className="ac-pixel-spinner__square ac-spinner" aria-hidden="true" />
    </span>
  );
});
