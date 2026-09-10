/**
 * Toolbar-style action button with icon, optional label, and keybinding hint.
 *
 * @module components/atoms/IconButton
 */

import { memo, useCallback } from 'react';
import { cn } from '../../utils/cn';

export interface IconButtonProps {
  /** Icon identifier or emoji */
  icon: string;
  /** Accessible label (also used as tooltip via title) */
  label: string;
  /** Click handler */
  onClick: () => void;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Visual variant */
  variant?: 'default' | 'primary' | 'danger';
  /** Size */
  size?: 'small' | 'medium';
  /** Whether to show the label text alongside icon */
  showLabel?: boolean;
  /** Keyboard shortcut hint (e.g., "⌘Enter") */
  keybinding?: string;
  /** Additional CSS class */
  className?: string;
}

/**
 * Renders a toolbar-style icon button with accessible label.
 *
 * @example
 * ```tsx
 * <IconButton icon="📋" label="Copy" onClick={handleCopy} />
 * <IconButton icon="↑" label="Send" onClick={handleSend} variant="primary" keybinding="Enter" />
 * ```
 */
export const IconButton = memo(function IconButton({
  icon,
  label,
  onClick,
  disabled = false,
  variant = 'default',
  size = 'medium',
  showLabel = false,
  keybinding,
  className,
}: IconButtonProps) {
  const handleClick = useCallback(() => {
    if (!disabled) onClick();
  }, [disabled, onClick]);

  return (
    <button
      type="button"
      className={cn(
        'ac-icon-button',
        variant !== 'default' && `ac-icon-button--${variant}`,
        size === 'small' && 'ac-icon-button--small',
        className,
      )}
      onClick={handleClick}
      disabled={disabled}
      aria-label={label}
      title={keybinding ? `${label} (${keybinding})` : label}
    >
      <span className="ac-icon-button__icon" aria-hidden="true">
        {icon}
      </span>
      {showLabel && <span className="ac-icon-button__label">{label}</span>}
      {keybinding && showLabel && <kbd className="ac-keybinding">{keybinding}</kbd>}
    </button>
  );
});
