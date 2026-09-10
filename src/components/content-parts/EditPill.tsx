/**
 * EditPill — inline file change chip showing filename, status, and diff stats.
 *
 * @module components/content-parts/EditPill
 */

import { memo, useCallback } from 'react';
import type { EditPillPart } from '../../types/content-parts';
import { cn } from '../../utils/cn';
import { useChatContext } from '../../provider/useChatContext';

export interface EditPillProps extends EditPillPart {
  /** Compact mode (used inside thinking blocks) */
  compact?: boolean;
  /** Additional CSS class */
  className?: string;
}

/** Extract basename from a file path */
function basename(filepath: string): string {
  const parts = filepath.split('/');
  return parts[parts.length - 1] ?? filepath;
}

const STATUS_ICONS: Record<EditPillPart['status'], string> = {
  created: '+',
  modified: '✓',
  deleted: '×',
  renamed: '→',
};

export const EditPill = memo(function EditPill({
  filename,
  uri,
  status,
  linesAdded,
  linesRemoved,
  progress,
  compact = false,
  className,
}: EditPillProps) {
  const { callbacks } = useChatContext();

  const handleClick = useCallback(() => {
    if (uri) {
      callbacks.onFileOpen?.(uri);
    }
  }, [uri, callbacks]);

  return (
    <div
      className={cn(
        'ac-edit-pill',
        `ac-edit-pill--${status}`,
        compact && 'ac-edit-pill--compact',
        className,
      )}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`${basename(filename)}: ${linesAdded} added, ${linesRemoved} removed`}
      data-testid="edit-pill"
    >
      {progress != null && (
        <div
          className="ac-edit-pill__progress"
          style={{ width: `${Math.min(progress, 100)}%` }}
          aria-hidden="true"
        />
      )}
      <span className="ac-edit-pill__status-icon" aria-hidden="true">
        {STATUS_ICONS[status]}
      </span>
      <span className="ac-edit-pill__filename">{basename(filename)}</span>
      {!compact && (
        <>
          <span className="ac-edit-pill__added">+{linesAdded}</span>
          <span className="ac-edit-pill__removed">-{linesRemoved}</span>
        </>
      )}
    </div>
  );
});
