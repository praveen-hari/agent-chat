/**
 * IconButton — toolbar-style action button with icon, optional label, and tooltip.
 *
 * @module components/atoms/IconButton
 */

import { memo } from 'react';
import { cn } from '../../utils/cn';
import { Icon } from './Icon';

export interface IconButtonProps {
  /** Icon identifier or emoji */
  icon: string;
  /** Accessible label (also used as tooltip) */
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
  /** Keyboard shortcut hint */
  keybinding?: string;
  /** Additional CSS class */
  className?: string;
}

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
  return (
    <button
      className={cn(
        'ac-icon-button',
        variant !== 'default' && `ac-icon-button--${variant}`,
        size === 'small' && 'ac-icon-button--small',
        className,
      )}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={keybinding ? `${label} (${keybinding})` : label}
      type="button"
    >
      <span className="ac-icon-button__icon" aria-hidden="true">
        {/^[a-z]/.test(icon) ? <Icon name={icon} /> : icon}
      </span>
      {showLabel && <span className="ac-icon-button__label">{label}</span>}
      {keybinding && <kbd className="ac-keybinding">{keybinding}</kbd>}
    </button>
  );
});
