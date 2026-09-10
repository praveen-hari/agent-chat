/**
 * TipContent — light info banner with dismissible tip.
 *
 * @module components/notifications/TipContent
 */

import { memo, useState, useCallback } from 'react';
import type { TipPart } from '../../types/content-parts';
import { cn } from '../../utils/cn';
import { IconButton } from '../atoms/IconButton';

export interface TipContentProps extends TipPart {
  /** Additional CSS class */
  className?: string;
}

export const TipContent = memo(function TipContent({
  message,
  dismissible,
  className,
}: TipContentProps) {
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
  }, []);

  if (dismissed) return null;

  return (
    <div
      className={cn('ac-notification', 'ac-notification--info', className)}
      role="note"
      data-testid="tip-content"
    >
      <span className="ac-notification__icon" aria-hidden="true">
        💡
      </span>
      <span className="ac-notification__message">{message}</span>
      {dismissible && <IconButton icon="✕" label="Dismiss" onClick={handleDismiss} size="small" />}
    </div>
  );
});
