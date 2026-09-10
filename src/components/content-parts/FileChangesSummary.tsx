/**
 * FileChangesSummary — collapsible summary showing changed files with per-file details.
 *
 * @module components/content-parts/FileChangesSummary
 */

import { memo, useCallback } from 'react';
import type { FileChangesSummaryPart } from '../../types/content-parts';
import { cn } from '../../utils/cn';
import { CollapsibleSection } from '../atoms/CollapsibleSection';
import { useChatContext } from '../../provider/useChatContext';

export interface FileChangesSummaryProps extends FileChangesSummaryPart {
  /** Additional CSS class */
  className?: string;
}

/** Extract basename from file path */
function basename(filepath: string): string {
  const parts = filepath.split('/');
  return parts[parts.length - 1] ?? filepath;
}

export const FileChangesSummary = memo(function FileChangesSummary({
  files,
  totalAdded,
  totalRemoved,
  defaultExpanded = false,
  className,
}: FileChangesSummaryProps) {
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
    <div className={cn('ac-file-changes-summary', className)} data-testid="file-changes-summary">
      <CollapsibleSection
        title={`Changed ${files.length} file${files.length !== 1 ? 's' : ''}`}
        count={files.length}
        subtitle={`+${totalAdded} -${totalRemoved}`}
        defaultExpanded={defaultExpanded}
      >
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
              aria-label={`${basename(file.filename)}: ${file.linesAdded} added, ${file.linesRemoved} removed`}
            >
              <span className="ac-file-changes-summary__name">{basename(file.filename)}</span>
              <span className="ac-file-changes-summary__added">+{file.linesAdded}</span>
              <span className="ac-file-changes-summary__removed">-{file.linesRemoved}</span>
            </div>
          ))}
        </div>
      </CollapsibleSection>
    </div>
  );
});
