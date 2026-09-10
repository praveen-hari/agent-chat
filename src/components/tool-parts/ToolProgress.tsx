/**
 * ToolProgress — tool execution display matching VS Code's rendering.
 *
 * Visual structure (VS Code parity):
 * ┌──────────────────────────────────────────────────┐
 * │ [✓/⟳] 🔍 read_file                     Complete │  ← collapsible header
 * ├──────────────────────────────────────────────────┤
 * │  Input                                            │  ← h3 heading
 * │  { "path": "src/utils.ts" }                      │  ← compact JSON
 * │                                                   │
 * │  Output                                           │  ← h3 heading (only if output exists)
 * │  The file contents rendered as markdown...        │  ← markdown or formatted JSON
 * └──────────────────────────────────────────────────┘
 *
 * Key behaviors:
 * - Collapsed by default (lazy render on first expand)
 * - Input: compact single-line JSON, expandable to formatted
 * - Output: rendered as markdown if it's text, or formatted JSON
 * - Output section hidden until tool completes
 *
 * @module components/tool-parts/ToolProgress
 */

import { memo, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ToolCallStatus } from '../../types/content-parts';
import { cn } from '../../utils/cn';
import { resolveToolIcon, formatToolStatus } from './toolUtils';
import { CollapsibleSection } from '../atoms/CollapsibleSection';
import { Icon } from '../atoms/Icon';

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

const remarkPlugins = [remarkGfm];

/**
 * Format input as compact JSON (single line) or expanded.
 */
function formatInput(input: unknown): { compact: string; expanded: string } {
  if (!input) return { compact: '', expanded: '' };
  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input);
      return {
        compact: JSON.stringify(parsed).replace(/,/g, ', '),
        expanded: JSON.stringify(parsed, null, 2),
      };
    } catch {
      return { compact: input, expanded: input };
    }
  }
  return {
    compact: JSON.stringify(input).replace(/,/g, ', '),
    expanded: JSON.stringify(input, null, 2),
  };
}

/**
 * Detect if output looks like JSON.
 */
function isJsonOutput(output: string): boolean {
  const trimmed = output.trim();
  return (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
         (trimmed.startsWith('[') && trimmed.endsWith(']'));
}

/**
 * Format JSON output in a readable way — key: value pairs.
 */
function formatJsonOutput(output: string): string {
  try {
    const parsed = JSON.parse(output);
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return Object.entries(parsed)
        .map(([key, val]) => {
          const value = typeof val === 'string' ? val : JSON.stringify(val);
          return `**${key}:** ${value}`;
        })
        .join('\n\n');
    }
    return JSON.stringify(parsed, null, 2);
  } catch {
    return output;
  }
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
  const [inputExpanded, setInputExpanded] = useState(false);

  const formattedInput = useMemo(() => formatInput(input), [input]);
  const hasInput = Boolean(formattedInput.compact);
  const hasOutput = Boolean(output);

  // Format output: if it's JSON, render as key-value pairs; otherwise as markdown
  const renderedOutput = useMemo(() => {
    if (!output) return null;
    if (isJsonOutput(output)) {
      return formatJsonOutput(output);
    }
    return output;
  }, [output]);

  return (
    <div className={cn('ac-tool-progress', className)} data-testid="tool-progress">
      <CollapsibleSection
        title={displayTitle}
        icon={resolvedIcon}
        isLoading={status === 'running' || status === 'streaming'}
        isComplete={status === 'complete'}
        subtitle={statusLabel}
        defaultExpanded={false}
      >
        <div className="ac-tool-progress__body">
          {/* Input section */}
          {hasInput && (
            <div className="ac-tool-progress__section">
              <h3 className="ac-tool-progress__section-label">Input</h3>
              <div className="ac-tool-progress__input-block">
                <pre className="ac-tool-progress__input-code">
                  <code>{inputExpanded ? formattedInput.expanded : formattedInput.compact}</code>
                </pre>
                {formattedInput.expanded.length > formattedInput.compact.length + 10 && (
                  <button
                    className="ac-tool-progress__toggle"
                    onClick={() => setInputExpanded(!inputExpanded)}
                  >
                    <Icon name={inputExpanded ? 'chevron-up' : 'chevron-down'} size={12} />
                    {inputExpanded ? 'Less' : 'More'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Output section (only shown when output exists) */}
          {hasOutput && renderedOutput && (
            <div className="ac-tool-progress__section">
              <h3 className="ac-tool-progress__section-label">Output</h3>
              <div className="ac-tool-progress__output">
                <ReactMarkdown remarkPlugins={remarkPlugins}>
                  {renderedOutput}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </CollapsibleSection>
    </div>
  );
});
