/**
 * ToolConfirmationCarousel — navigable carousel for multiple tool confirmations.
 *
 * @module components/tool-parts/ToolConfirmationCarousel
 */

import { memo, useCallback } from 'react';
import type { ToolConfirmationCarouselPart } from '../../types/content-parts';
import { cn } from '../../utils/cn';
import { IconButton } from '../atoms/IconButton';
import { ToolConfirmation } from './ToolConfirmation';
import { useChatContext } from '../../provider/useChatContext';

export interface ToolConfirmationCarouselProps extends ToolConfirmationCarouselPart {
  /** Additional CSS class */
  className?: string;
}

export const ToolConfirmationCarousel = memo(function ToolConfirmationCarousel({
  tools,
  currentIndex,
  className,
}: ToolConfirmationCarouselProps) {
  const { callbacks } = useChatContext();

  const handleNavigate = useCallback(
    (index: number) => {
      callbacks.onQuestionNavigate?.(index);
    },
    [callbacks],
  );

  if (tools.length === 0) return null;

  const current = tools[currentIndex] ?? tools[0]!;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < tools.length - 1;

  return (
    <div
      className={cn('ac-tool-confirmation-carousel', className)}
      data-testid="tool-confirmation-carousel"
    >
      {tools.length > 1 && (
        <div className="ac-tool-confirmation-carousel__nav">
          <IconButton
            icon="◀"
            label="Previous"
            onClick={() => handleNavigate(currentIndex - 1)}
            disabled={!hasPrev}
            size="small"
          />
          <span className="ac-tool-confirmation-carousel__counter">
            {currentIndex + 1} of {tools.length}
          </span>
          <IconButton
            icon="▶"
            label="Next"
            onClick={() => handleNavigate(currentIndex + 1)}
            disabled={!hasNext}
            size="small"
          />
        </div>
      )}
      <ToolConfirmation {...current} />
    </div>
  );
});
