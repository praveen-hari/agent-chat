/**
 * CommandButton — styled button that fires a command callback.
 *
 * @module components/interactive/CommandButton
 */

import { memo, useCallback } from 'react';
import type { CommandButtonPart } from '../../types/content-parts';
import { cn } from '../../utils/cn';
import { useChatContext } from '../../provider/useChatContext';

export interface CommandButtonProps extends CommandButtonPart {
  /** Additional CSS class */
  className?: string;
}

export const CommandButton = memo(function CommandButton({
  label,
  commandId,
  args,
  className,
}: CommandButtonProps) {
  const { callbacks } = useChatContext();

  const handleClick = useCallback(() => {
    callbacks.onCommandClick?.(commandId, args);
  }, [commandId, args, callbacks]);

  return (
    <button
      className={cn('ac-btn', 'ac-btn--secondary', className)}
      onClick={handleClick}
      data-testid="command-button"
    >
      {label}
    </button>
  );
});
