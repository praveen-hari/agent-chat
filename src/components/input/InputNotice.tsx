/**
 * InputNotice — notice/tip banner displayed above or within the input area.
 *
 * @module components/input/InputNotice
 */

import { memo } from 'react';
import { cn } from '../../utils/cn';
import { IconButton } from '../atoms/IconButton';

export interface InputNoticeProps {
  /** Notice type */
  variant: 'tip' | 'warning' | 'info';
  /** Notice message */
  message: string;
  /** Icon */
  icon?: string;
  /** Whether dismissible */
  dismissible?: boolean;
  /** Dismiss handler */
  onDismiss?: () => void;
  /** Action button */
  action?: { label: string; onClick: () => void };
  /** Additional CSS class */
  className?: string;
}

const VARIANT_ICONS: Record<string, string> = {
  tip: '💡',
  warning: '⚠',
  info: 'ℹ',
};

export const InputNotice = memo(function InputNotice({
  variant,
  message,
  icon,
  dismissible = false,
  onDismiss,
  action,
  className,
}: InputNoticeProps) {
  return (
    <div
      className={cn('ac-input-notice', `ac-input-notice--${variant}`, className)}
      role={variant === 'warning' ? 'alert' : 'status'}
      data-testid="input-notice"
    >
      <span className="ac-input-notice__icon" aria-hidden="true">
        {icon ?? VARIANT_ICONS[variant]}
      </span>
      <span className="ac-input-notice__message">{message}</span>
      {action && (
        <button className="ac-btn ac-btn--small" onClick={action.onClick}>
          {action.label}
        </button>
      )}
      {dismissible && onDismiss && (
        <IconButton icon="✕" label="Dismiss" onClick={onDismiss} size="small" />
      )}
    </div>
  );
});
