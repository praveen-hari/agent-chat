/**
 * Chip — pill/tag element for attachments, references, and labels.
 *
 * @module components/atoms/Chip
 */

import { memo } from 'react';
import { cn } from '../../utils/cn';

export interface ChipProps {
  /** Display label */
  label: string;
  /** Icon (emoji or identifier) */
  icon?: string;
  /** Variant */
  variant?: 'default' | 'file' | 'image' | 'tool' | 'terminal' | 'error';
  /** Whether removable (shows × button) */
  removable?: boolean;
  /** Remove handler */
  onRemove?: () => void;
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS class */
  className?: string;
}

export const Chip = memo(function Chip({
  label,
  icon,
  variant = 'default',
  removable = false,
  onRemove,
  onClick,
  className,
}: ChipProps) {
  return (
    <span
      className={cn(
        'ac-chip',
        variant !== 'default' && `ac-chip--${variant}`,
        onClick && 'ac-chip--clickable',
        className,
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {icon && (
        <span className="ac-chip__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="ac-chip__label">{label}</span>
      {removable && (
        <span
          className="ac-chip__remove"
          role="button"
          tabIndex={0}
          aria-label={`Remove ${label}`}
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              onRemove?.();
            }
          }}
        >
          ×
        </span>
      )}
    </span>
  );
});
