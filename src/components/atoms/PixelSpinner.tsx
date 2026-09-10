/**
 * PixelSpinner — small pixel-art-style loading spinner.
 * Matches VS Code's createPixelSpinner() pattern.
 *
 * @module components/atoms/PixelSpinner
 */

import { memo } from 'react';
import { cn } from '../../utils/cn';

export interface PixelSpinnerProps {
  /** Size in pixels (default: 14) */
  size?: number;
  /** Accessible label (default: 'Loading') */
  label?: string;
  /** Additional CSS class */
  className?: string;
}

export const PixelSpinner = memo(function PixelSpinner({
  size = 14,
  label = 'Loading',
  className,
}: PixelSpinnerProps) {
  return (
    <span
      className={cn('ac-pixel-spinner', 'ac-spinner', className)}
      style={{ width: `${size}px`, height: `${size}px` }}
      role="status"
      aria-label={label}
    >
      <svg viewBox="0 0 16 16" width={size} height={size} fill="currentColor">
        <rect x="7" y="1" width="2" height="4" rx="1" opacity="0.9" />
        <rect x="7" y="11" width="2" height="4" rx="1" opacity="0.3" />
        <rect x="1" y="7" width="4" height="2" rx="1" opacity="0.5" />
        <rect x="11" y="7" width="4" height="2" rx="1" opacity="0.7" />
      </svg>
    </span>
  );
});
