/**
 * TurnPills — compact per-turn changes summary.
 *
 * @module components/content-parts/TurnPills
 */

import { memo, useCallback } from 'react';
import type { TurnPillsPart } from '../../types/content-parts';
import { cn } from '../../utils/cn';
import { useChatContext } from '../../provider/useChatContext';

export interface TurnPillsProps extends TurnPillsPart {
  /** Additional CSS class */
  className?: string;
}

/** Extract basename from file path */
function basename(filepath: string): string {
  const parts = filepath.split('/');
  return parts[parts.length - 1] ?? filepath;
}

export const TurnPills = memo(function TurnPills({
  label,
  files,
  totalAdded,
  totalRemoved,
  className,
}: TurnPillsProps) {
  const { callbacks } = useChatContext();

  const handleFileClick = useCallback(
    (uri?: string) => {
      if (uri) {
        callbacks.onFileOpen?.(uri);
      }
    },
    [callbacks],
  );

  return (
    <details className={cn('ac-turn-pills', className)} data-testid="turn-pills">
      <summary>
        <span>{label}</span>
        <span className="ac-turn-pills__counts">
          <span className="ac-turn-pills__insertions">+{totalAdded}</span>
          <span className="ac-turn-pills__deletions">-{totalRemoved}</span>
        </span>
      </summary>
      <div className="ac-file-changes-summary__list">
        {files.map((file) => (
          <div
            key={file.filename}
            className="ac-file-changes-summary__row"
            onClick={() => handleFileClick(file.uri)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleFileClick(file.uri);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <span className="ac-file-changes-summary__name">{basename(file.filename)}</span>
            <span className="ac-file-changes-summary__added">+{file.linesAdded}</span>
            <span className="ac-file-changes-summary__removed">-{file.linesRemoved}</span>
          </div>
        ))}
      </div>
    </details>
  );
});
