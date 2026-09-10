/**
 * InlineDiff — unified diff view for a single file.
 * Renders added/removed lines with line-by-line coloring.
 *
 * @module components/content-parts/InlineDiff
 */

import { memo, useMemo } from 'react';
import type { InlineDiffPart } from '../../types/content-parts';
import { cn } from '../../utils/cn';

export interface InlineDiffProps extends InlineDiffPart {
  /** Additional CSS class */
  className?: string;
}

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
}

/**
 * Simple line-by-line diff. For production, replace with a proper diff algorithm.
 */
function computeDiff(original: string, modified: string): DiffLine[] {
  const origLines = original.split('\n');
  const modLines = modified.split('\n');
  const lines: DiffLine[] = [];

  const maxLen = Math.max(origLines.length, modLines.length);
  let oi = 0;
  let mi = 0;

  while (oi < origLines.length || mi < modLines.length) {
    if (oi >= origLines.length) {
      lines.push({ type: 'added', content: modLines[mi++]! });
    } else if (mi >= modLines.length) {
      lines.push({ type: 'removed', content: origLines[oi++]! });
    } else if (origLines[oi] === modLines[mi]) {
      lines.push({ type: 'unchanged', content: origLines[oi]! });
      oi++;
      mi++;
    } else {
      // Simple heuristic: check if current original line appears later in modified
      const modIdx = modLines.indexOf(origLines[oi]!, mi);
      const origIdx = origLines.indexOf(modLines[mi]!, oi);

      if (modIdx >= 0 && (origIdx < 0 || modIdx - mi < origIdx - oi)) {
        // Modified has extra lines before the match
        while (mi < modIdx) {
          lines.push({ type: 'added', content: modLines[mi++]! });
        }
      } else if (origIdx >= 0) {
        // Original has extra lines before the match
        while (oi < origIdx) {
          lines.push({ type: 'removed', content: origLines[oi++]! });
        }
      } else {
        // No match found — treat as remove + add
        lines.push({ type: 'removed', content: origLines[oi++]! });
        lines.push({ type: 'added', content: modLines[mi++]! });
      }
    }

    // Safety check to prevent infinite loop
    if (lines.length > maxLen * 3) break;
  }

  return lines;
}

export const InlineDiff = memo(function InlineDiff({
  filename,
  originalCode,
  modifiedCode,
  language,
  className,
}: InlineDiffProps) {
  const diffLines = useMemo(
    () => computeDiff(originalCode, modifiedCode),
    [originalCode, modifiedCode],
  );

  return (
    <div className={cn('ac-inline-diff', className)} data-testid="inline-diff">
      <div className="ac-code-block__header">
        {language && <span className="ac-code-block__language">{language}</span>}
        <span className="ac-code-block__filename">{filename}</span>
      </div>
      <div className="ac-inline-diff__content">
        {diffLines.map((line, i) => (
          <div key={i} className={`ac-inline-diff__line ac-inline-diff__line--${line.type}`}>
            <span className="ac-inline-diff__prefix">
              {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
            </span>
            {line.content}
          </div>
        ))}
      </div>
    </div>
  );
});
