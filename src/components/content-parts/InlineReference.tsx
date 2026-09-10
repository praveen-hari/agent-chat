/**
 * InlineReference — clickable file/symbol reference link.
 *
 * @module components/content-parts/InlineReference
 */

import { memo, useCallback } from 'react';
import type { InlineReferencePart } from '../../types/content-parts';
import { cn } from '../../utils/cn';
import { useChatContext } from '../../provider/useChatContext';

export interface InlineReferenceProps extends InlineReferencePart {
  /** Additional CSS class */
  className?: string;
}

export const InlineReference = memo(function InlineReference({
  text,
  uri,
  className,
}: InlineReferenceProps) {
  const { callbacks } = useChatContext();

  const handleClick = useCallback(() => {
    callbacks.onReferenceClick?.(uri);
  }, [uri, callbacks]);

  return (
    <span
      className={cn('ac-inline-ref', className)}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      role="link"
      tabIndex={0}
      data-testid="inline-reference"
    >
      <span className="ac-inline-ref__icon" aria-hidden="true">
        📄
      </span>
      {text}
    </span>
  );
});
