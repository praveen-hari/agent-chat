/**
 * QuotaExceeded — warning banner with upgrade action.
 *
 * @module components/notifications/QuotaExceeded
 */

import { memo, useCallback } from 'react';
import type { QuotaExceededPart } from '../../types/content-parts';
import { cn } from '../../utils/cn';

export interface QuotaExceededProps extends QuotaExceededPart {
  /** Additional CSS class */
  className?: string;
}

export const QuotaExceeded = memo(function QuotaExceeded({
  message,
  upgradeUrl,
  actionLabel,
  className,
}: QuotaExceededProps) {
  const handleAction = useCallback(() => {
    if (upgradeUrl) {
      window.open(upgradeUrl, '_blank', 'noopener,noreferrer');
    }
  }, [upgradeUrl]);

  return (
    <div
      className={cn('ac-notification', 'ac-notification--warning', className)}
      role="alert"
      data-testid="quota-exceeded"
    >
      <span className="ac-notification__icon" aria-hidden="true">
        ⚠
      </span>
      <span className="ac-notification__message">{message}</span>
      {upgradeUrl && (
        <button className="ac-btn ac-btn--small ac-btn--primary" onClick={handleAction}>
          {actionLabel ?? 'Manage Budget'}
        </button>
      )}
    </div>
  );
});
