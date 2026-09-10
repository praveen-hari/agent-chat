/**
 * ThinkingBlock — collapsible reasoning block with nested tool calls,
 * edit pills, and shimmer animation.
 *
 * @module components/content-parts/ThinkingBlock
 */

import { memo, useMemo } from 'react';
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

/**
 * Extract a title from the thinking content.
 * Looks for **bold** text on the first line, else falls back to "Thinking".
 */
function extractTitle(content: string, explicitTitle?: string): string {
  if (explicitTitle) return explicitTitle;

  const boldMatch = content.match(/^\*\*(.+?)\*\*/);
  if (boldMatch) return boldMatch[1];

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
    if (!aggregateDiff) return undefined;
    const { added, removed } = aggregateDiff;
    if (added === 0 && removed === 0) return undefined;
    return `+${added} -${removed}`;
  }, [aggregateDiff]);

  const thinkingTitle = isStreaming ? <ShimmerText text={title} mode="partial" /> : title;

  return (
    <div
      className={cn('ac-thinking', isStreaming && 'ac-thinking--active', className)}
      data-testid="thinking-block"
    >
      <CollapsibleSection
        title={typeof thinkingTitle === 'string' ? thinkingTitle : title}
        isLoading={isStreaming}
        isComplete={!isStreaming}
        subtitle={subtitle}
        defaultExpanded={isStreaming}
      >
        <div className="ac-thinking__body">
          {/* Reasoning text */}
          {content && (
            <div className="ac-thinking__reasoning" data-testid="thinking-reasoning">
              {content}
            </div>
          )}

          {/* Nested tool calls */}
          {nestedToolCalls?.map((tool) => (
            <div key={tool.id} className="ac-thinking__tool-item">
              <StatusIcon status={tool.status} size={14} />
              {tool.icon && (
                <span className="ac-thinking__tool-icon" aria-hidden="true">
                  {tool.icon}
                </span>
              )}
              <span className="ac-thinking__tool-label">{tool.label}</span>
            </div>
          ))}

          {/* Nested edit pills */}
          {nestedEditPills?.map((pill) => (
            <div key={pill.filename} className="ac-thinking__tool-item">
              <StatusIcon status="complete" size={14} />
              <span className="ac-edit-pill__filename">{pill.filename}</span>
              <span className="ac-edit-pill__added">+{pill.linesAdded}</span>
              <span className="ac-edit-pill__removed">-{pill.linesRemoved}</span>
            </div>
          ))}

          {/* Working spinner when streaming */}
          {isStreaming && (
            <div className="ac-thinking__spinner">
              <PixelSpinner label="Thinking" />
              <span>Thinking...</span>
            </div>
          )}
        </div>
      </CollapsibleSection>
    </div>
  );
});
