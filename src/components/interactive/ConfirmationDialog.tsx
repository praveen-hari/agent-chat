/**
 * ConfirmationDialog — card with title, message, and action buttons.
 * Used for tool confirmations, plan approvals, and general confirmations.
 *
 * @module components/interactive/ConfirmationDialog
 */

import { memo, useCallback } from 'react';
import type { ConfirmationPart } from '../../types/content-parts';
import { cn } from '../../utils/cn';
import { useChatContext } from '../../provider/useChatContext';

export interface ConfirmationDialogProps extends ConfirmationPart {
  /** Additional CSS class */
  className?: string;
}

export const ConfirmationDialog = memo(function ConfirmationDialog({
  title,
  message,
  subtitle,
  buttons,
  className,
}: ConfirmationDialogProps) {
  const { callbacks } = useChatContext();

  const handleAction = useCallback(
    (actionId: string) => {
      callbacks.onConfirmationAction?.(actionId);
    },
    [callbacks],
  );

  return (
    <div className={cn('ac-confirmation', 'ac-card', className)} data-testid="confirmation-dialog">
      <div className="ac-confirmation__title">{title}</div>
      {subtitle && <div className="ac-confirmation__subtitle">{subtitle}</div>}
      <div className="ac-confirmation__message">{message}</div>
      <div className="ac-confirmation__buttons">
        {buttons.map((btn) => (
          <button
            key={btn.id}
            className={cn(
              'ac-btn',
              btn.primary && 'ac-btn--primary',
              !btn.primary && 'ac-btn--secondary',
            )}
            onClick={() => handleAction(btn.id)}
          >
            {btn.label}
            {btn.keybinding && <kbd className="ac-keybinding">{btn.keybinding}</kbd>}
          </button>
        ))}
      </div>
    </div>
  );
});
