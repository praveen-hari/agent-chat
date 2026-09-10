/**
 * Pill/tag element for attachments, references, and labels.
 *
 * @module components/atoms/Chip
 */

import { memo, useCallback } from 'react';
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
  /** Remove handler (required when removable) */
  onRemove?: () => void;
  /** Click handler */
  onClick?: () => void;
  /** Accessible label override (default: the label prop) */
  ariaLabel?: string;
  /** Additional CSS class */
  className?: string;
}

/**
 * Renders a compact pill/tag chip.
 *
 * @example
 * ```tsx
 * <Chip label="src/app.ts" icon="📄" variant="file" onClick={() => openFile()} />
 * <Chip label="screenshot.png" icon="🖼️" removable onRemove={remove} />
 * ```
 */
export const Chip = memo(function Chip({
  label,
  icon,
  variant = 'default',
  removable = false,
  onRemove,
  onClick,
  ariaLabel,
  className,
}: ChipProps) {
  const isClickable = Boolean(onClick);

  const handleRemoveClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onRemove?.();
    },
    [onRemove],
  );

  const content = (
    <>
      {icon && (
        <span className="ac-chip__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="ac-chip__label">{label}</span>
      {removable && (
        <button
          type="button"
          className="ac-chip__remove"
          onClick={handleRemoveClick}
          aria-label={`Remove ${label}`}
          aria-hidden={false}
        >
          ×
        </button>
      )}
    </>
  );

  if (isClickable) {
    return (
      <button
        type="button"
        className={cn(
          'ac-chip',
          'ac-chip--clickable',
          variant !== 'default' && `ac-chip--${variant}`,
          className,
        )}
        onClick={onClick}
        aria-label={ariaLabel ?? label}
      >
        {content}
      </button>
    );
  }

  return (
    <span className={cn('ac-chip', variant !== 'default' && `ac-chip--${variant}`, className)}>
      {content}
    </span>
  );
});
