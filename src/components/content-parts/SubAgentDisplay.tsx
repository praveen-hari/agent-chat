/**
 * SubAgentDisplay — displays a sub-agent invocation as a collapsible block.
 * Children are lazy-rendered (only on expand) for performance.
 *
 * @module components/content-parts/SubAgentDisplay
 */

import { memo, useState } from 'react';
import type { SubAgentPart } from '../../types/content-parts';
import { cn } from '../../utils/cn';
import { CollapsibleSection } from '../atoms/CollapsibleSection';

export interface SubAgentDisplayProps extends SubAgentPart {
  /** Whether the parent response is streaming */
  isStreaming: boolean;
  /** Additional CSS class */
  className?: string;
}

export const SubAgentDisplay = memo(function SubAgentDisplay({
  agentName,
  description,
  status,
  children,
  modelName,
  credits,
  autoExpand = false,
  isStreaming,
  className,
}: SubAgentDisplayProps) {
  const [hasExpanded, setHasExpanded] = useState(autoExpand);

  const truncatedDescription =
    description.length > 100 ? `${description.slice(0, 100)}…` : description;

  return (
    <div className={cn('ac-sub-agent', className)} data-testid="sub-agent-display">
      <CollapsibleSection
        title={truncatedDescription}
        icon="🤖"
        isLoading={status === 'running'}
        isComplete={status === 'complete'}
        defaultExpanded={autoExpand || (isStreaming && status === 'running')}
        onToggle={(expanded) => {
          if (expanded) setHasExpanded(true);
        }}
      >
        <div className="ac-sub-agent__body">
          {/* Lazy render children only after first expand */}
          {hasExpanded && children && children.length > 0 && (
            <div data-testid="sub-agent-children">
              {children.map((child, i) => (
                <div key={i} className="ac-sub-agent__child">
                  {/* Children are rendered by ContentPartRenderer in the parent */}
                  <span>{child.kind}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {(modelName || credits != null) && (
          <div className="ac-sub-agent__footer">
            {agentName && <span className="ac-sub-agent__name">{agentName}</span>}
            {modelName && <span className="ac-sub-agent__model">{modelName}</span>}
            {credits != null && (
              <span className="ac-sub-agent__credits">
                {credits} credit{credits !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}
      </CollapsibleSection>
    </div>
  );
});
