/**
 * ElicitationDialog — similar to ConfirmationDialog but with resolved state.
 *
 * @module components/interactive/ElicitationDialog
 */

import { memo, useCallback } from 'react';
import type { ElicitationPart } from '../../types/content-parts';
import { cn } from '../../utils/cn';
import { useChatContext } from '../../provider/useChatContext';

export interface ElicitationDialogProps extends ElicitationPart {
  /** Additional CSS class */
  className?: string;
}

export const ElicitationDialog = memo(function ElicitationDialog({
  title,
  message,
  actions,
  isResolved = false,
  result,
  className,
}: ElicitationDialogProps) {
  const { callbacks } = useChatContext();

  const handleAction = useCallback(
    (actionId: string) => {
      callbacks.onElicitationAction?.(title, actionId);
    },
    [title, callbacks],
  );

  if (isResolved && result) {
    return (
      <div className={cn('ac-confirmation', 'ac-card', className)} data-testid="elicitation-dialog">
        <div className="ac-confirmation__title">{title}</div>
        <div className="ac-confirmation__message">
          <span className="ac-notification--info">Resolved: {result}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('ac-confirmation', 'ac-card', className)} data-testid="elicitation-dialog">
      <div className="ac-confirmation__title">{title}</div>
      <div className="ac-confirmation__message">{message}</div>
      <div className="ac-confirmation__buttons">
        {actions.map((btn) => (
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
