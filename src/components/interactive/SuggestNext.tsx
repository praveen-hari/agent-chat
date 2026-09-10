/**
 * SuggestNext — grid/list of suggestion buttons.
 *
 * @module components/interactive/SuggestNext
 */

import { memo, useCallback } from 'react';
import type { SuggestNextPart } from '../../types/content-parts';
import { cn } from '../../utils/cn';
import { useChatContext } from '../../provider/useChatContext';

export interface SuggestNextProps extends SuggestNextPart {
  /** Additional CSS class */
  className?: string;
}

export const SuggestNext = memo(function SuggestNext({ suggestions, className }: SuggestNextProps) {
  const { callbacks } = useChatContext();

  const handleClick = useCallback(
    (message: string) => {
      callbacks.onSendMessage?.(message);
    },
    [callbacks],
  );

  return (
    <div className={cn('ac-suggest-next', className)} data-testid="suggest-next">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion.label}
          className="ac-followup-btn"
          onClick={() => handleClick(suggestion.message)}
        >
          {suggestion.label}
        </button>
      ))}
    </div>
  );
});
