/**
 * ReferencesList — collapsible list of file/resource references.
 *
 * @module components/content-parts/ReferencesList
 */

import { memo, useCallback } from 'react';
import type { ReferencesPart } from '../../types/content-parts';
import { cn } from '../../utils/cn';
import { CollapsibleSection } from '../atoms/CollapsibleSection';
import { Chip } from '../atoms/Chip';
import { useChatContext } from '../../provider/useChatContext';

export interface ReferencesListProps extends ReferencesPart {
  /** Additional CSS class */
  className?: string;
}

export const ReferencesList = memo(function ReferencesList({
  title,
  references,
  className,
}: ReferencesListProps) {
  const { callbacks } = useChatContext();

  const handleRefClick = useCallback(
    (uri: string) => {
      callbacks.onReferenceClick?.(uri);
    },
    [callbacks],
  );

  return (
    <div className={cn('ac-references-list', className)} data-testid="references-list">
      <CollapsibleSection
        title={title ?? `Used ${references.length} reference${references.length !== 1 ? 's' : ''}`}
        count={references.length}
      >
        <div className="ac-references-list__items">
          {references.map((ref) => (
            <Chip
              key={ref.uri}
              label={ref.label}
              icon={ref.icon ?? '📄'}
              onClick={() => handleRefClick(ref.uri)}
            />
          ))}
        </div>
      </CollapsibleSection>
    </div>
  );
});
