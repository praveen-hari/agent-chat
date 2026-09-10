/**
 * ErrorMessage — notification banner with error/warning/info severity.
 *
 * @module components/notifications/ErrorMessage
 */

import { memo } from 'react';
import type { ErrorPart } from '../../types/content-parts';
import { cn } from '../../utils/cn';
import { Icon } from '../atoms/Icon';

export interface ErrorMessageProps extends ErrorPart {
  /** Additional CSS class */
  className?: string;
}

const LEVEL_CODICONS: Record<ErrorPart['level'], string> = {
  error: 'error',
  warning: 'warning',
  info: 'info',
};

export const ErrorMessage = memo(function ErrorMessage({
  message,
  level,
  className,
}: ErrorMessageProps) {
  return (
    <div
      className={cn('ac-notification', `ac-notification--${level}`, className)}
      role="alert"
      data-testid="error-message"
    >
      <span className="ac-notification__icon" aria-hidden="true">
        <Icon name={LEVEL_CODICONS[level]} />
      </span>
      <span className="ac-notification__message">{message}</span>
    </div>
  );
});
