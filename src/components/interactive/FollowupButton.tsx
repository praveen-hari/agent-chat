/**
 * FollowupButton — suggestion chip for follow-up messages.
 *
 * @module components/interactive/FollowupButton
 */

import { memo, useCallback } from 'react';
import type { FollowupPart } from '../../types/content-parts';
import { cn } from '../../utils/cn';
import { useChatContext } from '../../provider/useChatContext';

export interface FollowupButtonProps {
  /** The followup part data */
  followup: FollowupPart;
  /** Additional CSS class */
  className?: string;
}

export const FollowupButton = memo(function FollowupButton({
  followup,
  className,
}: FollowupButtonProps) {
  const { callbacks } = useChatContext();

  const handleClick = useCallback(() => {
    callbacks.onFollowupClick?.({
      id: followup.label,
      label: followup.label,
      message: followup.message,
      type: 'reply',
    });
  }, [followup, callbacks]);

  return (
    <button
      className={cn('ac-followup-btn', className)}
      onClick={handleClick}
      data-testid="followup-button"
    >
      {followup.label}
    </button>
  );
});
