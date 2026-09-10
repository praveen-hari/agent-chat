/**
 * ToolProgress — tool execution progress with optional input/output display.
 *
 * @module components/tool-parts/ToolProgress
 */

import { memo, useMemo } from 'react';
import type { ToolCallStatus } from '../../types/content-parts';
import { cn } from '../../utils/cn';
import { resolveToolIcon, formatToolStatus } from './toolUtils';
import { CollapsibleSection } from '../atoms/CollapsibleSection';
import { CodeBlock } from '../content-parts/CodeBlock';

export interface ToolProgressProps {
  /** Tool identifier */
  toolId: string;
  /** Tool call identifier */
  toolCallId: string;
  /** Current status */
  status: ToolCallStatus;
  /** Display label */
  label?: string;
  /** Explicit icon */
  icon?: string;
  /** Tool input data */
  input?: unknown;
  /** Tool output text */
  output?: string;
  /** Progress message */
  progressMessage?: string;
  /** Additional CSS class */
  className?: string;
}

export const ToolProgress = memo(function ToolProgress({
  toolId,
  status,
  label,
  icon,
  input,
  output,
  progressMessage,
  className,
}: ToolProgressProps) {
  const resolvedIcon = resolveToolIcon(toolId, icon);
  const statusLabel = formatToolStatus(status);
  const displayTitle = label ?? progressMessage ?? toolId;

  const inputString = useMemo(() => {
    if (!input) return undefined;
    if (typeof input === 'string') return input;
    try {
      return JSON.stringify(input, null, 2);
    } catch {
      return String(input);
    }
  }, [input]);

  const hasContent = Boolean(inputString || output);

  return (
    <div className={cn('ac-tool-progress', className)} data-testid="tool-progress">
      <CollapsibleSection
        title={`${resolvedIcon} ${displayTitle}`}
        isLoading={status === 'running' || status === 'streaming'}
        isComplete={status === 'complete'}
        subtitle={statusLabel}
        defaultExpanded={false}
      >
        {hasContent && (
          <div className="ac-tool-progress__body">
            {inputString && (
              <div className="ac-tool-progress__section">
                <div className="ac-tool-progress__section-label">Input</div>
                <CodeBlock kind="code" code={inputString} language="json" showToolbar={false} />
              </div>
            )}
            {output && (
              <div className="ac-tool-progress__section">
                <div className="ac-tool-progress__section-label">Output</div>
                <CodeBlock kind="code" code={output} language="text" showToolbar={false} />
              </div>
            )}
          </div>
        )}
      </CollapsibleSection>
    </div>
  );
});
