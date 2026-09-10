/**
 * ThinkingBlock — production-ready collapsible reasoning/chain-of-thought block.
 *
 * Features:
 * - Markdown rendering inside reasoning content
 * - Shimmer animation on title during streaming
 * - Auto-expand when streaming, collapse when done
 * - Nested tool calls with status icons
 * - Nested edit pills with diff stats
 * - Aggregate diff subtitle
 * - Progressive reasoning content (appended during streaming)
 * - Accessible with keyboard navigation
 *
 * @module components/content-parts/ThinkingBlock
 */

import { memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ThinkingPart } from '../../types/content-parts';
import { cn } from '../../utils/cn';
import { CollapsibleSection } from '../atoms/CollapsibleSection';
import { ShimmerText } from '../atoms/ShimmerText';
import { StatusIcon } from '../atoms/StatusIcon';
import { PixelSpinner } from '../atoms/PixelSpinner';

export interface ThinkingBlockProps extends ThinkingPart {
  /** Whether the parent response is streaming */
  isStreaming: boolean;
  /** Additional CSS class */
  className?: string;
}

/** Markdown plugins (shared, no re-allocation) */
const remarkPlugins = [remarkGfm];

/**
 * Extract a display title from thinking content.
 * Priority: explicit title > first **bold** line > first sentence > "Thinking"
 */
function extractTitle(content: string, explicitTitle?: string): string {
  if (explicitTitle) return explicitTitle;

  // Try **bold** at start
  const boldMatch = content.match(/^\*\*(.+?)\*\*/);
  if (boldMatch) return boldMatch[1];

  // Try first sentence (up to 60 chars)
  const firstLine = content.split('\n')[0]?.trim() ?? '';
  if (firstLine.length > 0 && firstLine.length <= 60) return firstLine;
  if (firstLine.length > 60) return `${firstLine.slice(0, 57)}…`;

  return 'Thinking';
}

export const ThinkingBlock = memo(function ThinkingBlock({
  content,
  isStreaming,
  title: explicitTitle,
  nestedToolCalls,
  nestedEditPills,
  aggregateDiff,
  className,
}: ThinkingBlockProps) {
  const title = useMemo(() => extractTitle(content, explicitTitle), [content, explicitTitle]);

  const subtitle = useMemo(() => {
    const parts: string[] = [];

    // Aggregate diff
    if (aggregateDiff) {
      const { added, removed } = aggregateDiff;
      if (added > 0 || removed > 0) {
        parts.push(`+${added} -${removed}`);
      }
    }

    // Tool count
    if (nestedToolCalls && nestedToolCalls.length > 0) {
      const running = nestedToolCalls.filter((t) => t.status === 'running').length;
      const total = nestedToolCalls.length;
      if (running > 0) {
        parts.push(`${running}/${total} tools running`);
      } else {
        parts.push(`${total} tool${total !== 1 ? 's' : ''}`);
      }
    }

    // Edit count
    if (nestedEditPills && nestedEditPills.length > 0) {
      parts.push(`${nestedEditPills.length} file${nestedEditPills.length !== 1 ? 's' : ''}`);
    }

    return parts.length > 0 ? parts.join(' · ') : undefined;
  }, [aggregateDiff, nestedToolCalls, nestedEditPills]);

  // Count completed vs total for progress display
  const completedTools = nestedToolCalls?.filter((t) => t.status === 'complete').length ?? 0;
  const totalTools = nestedToolCalls?.length ?? 0;

  return (
    <div
      className={cn('ac-thinking', isStreaming && 'ac-thinking--active', className)}
      data-testid="thinking-block"
      role="region"
      aria-label={`Reasoning: ${title}`}
    >
      <CollapsibleSection
        title={typeof title === 'string' ? title : 'Thinking'}
        isLoading={isStreaming}
        isComplete={!isStreaming && totalTools > 0 ? completedTools === totalTools : !isStreaming}
        subtitle={subtitle}
        defaultExpanded={isStreaming}
      >
        <div className="ac-thinking__body">
          {/* Reasoning content — rendered as markdown */}
          {content && (
            <div className="ac-thinking__reasoning" data-testid="thinking-reasoning">
              <ReactMarkdown remarkPlugins={remarkPlugins}>{content}</ReactMarkdown>
            </div>
          )}

          {/* Nested tool calls */}
          {nestedToolCalls && nestedToolCalls.length > 0 && (
            <div className="ac-thinking__tools" data-testid="thinking-tools">
              {nestedToolCalls.map((tool) => (
                <div
                  key={tool.id}
                  className={cn('ac-thinking__tool-item', `ac-thinking__tool-item--${tool.status}`)}
                >
                  <StatusIcon status={tool.status} size={14} />
                  {tool.icon && (
                    <span className="ac-thinking__tool-icon" aria-hidden="true">
                      {tool.icon}
                    </span>
                  )}
                  <span className="ac-thinking__tool-label">{tool.label}</span>
                  {tool.status === 'running' && (
                    <span className="ac-thinking__tool-status">
                      <ShimmerText text="running" mode="full" />
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Nested edit pills */}
          {nestedEditPills && nestedEditPills.length > 0 && (
            <div className="ac-thinking__edits" data-testid="thinking-edits">
              {nestedEditPills.map((pill) => (
                <div
                  key={pill.filename}
                  className={cn('ac-thinking__edit-item', `ac-thinking__edit-item--${pill.status}`)}
                >
                  <StatusIcon status="complete" size={14} />
                  <span className="ac-thinking__edit-icon" aria-hidden="true">
                    {pill.status === 'created'
                      ? '+'
                      : pill.status === 'deleted'
                        ? '×'
                        : pill.status === 'renamed'
                          ? '→'
                          : '✓'}
                  </span>
                  <span className="ac-edit-pill__filename">{pill.filename}</span>
                  <span className="ac-edit-pill__added">+{pill.linesAdded}</span>
                  <span className="ac-edit-pill__removed">-{pill.linesRemoved}</span>
                </div>
              ))}
            </div>
          )}

          {/* Thinking spinner when actively streaming */}
          {isStreaming && (
            <div className="ac-thinking__spinner">
              <PixelSpinner label="Thinking" />
              <span>Thinking…</span>
            </div>
          )}
        </div>
      </CollapsibleSection>
    </div>
  );
});
