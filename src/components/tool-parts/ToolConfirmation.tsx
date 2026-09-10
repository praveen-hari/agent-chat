/**
 * ToolConfirmation — approval/denial dialog for tool execution.
 * Shows tool details, risk level, optional input preview, and action buttons.
 *
 * @module components/tool-parts/ToolConfirmation
 */

import { memo, useCallback } from 'react';
import type { ToolConfirmationPart } from '../../types/content-parts';
import { cn } from '../../utils/cn';
import { resolveToolIcon } from './toolUtils';
import { RiskBadge } from '../atoms/RiskBadge';
import { CollapsibleSection } from '../atoms/CollapsibleSection';
import { CodeBlock } from '../content-parts/CodeBlock';
import { useChatContext } from '../../provider/useChatContext';

export interface ToolConfirmationProps extends ToolConfirmationPart {
  /** Additional CSS class */
  className?: string;
}

export const ToolConfirmation = memo(function ToolConfirmation({
  toolId,
  toolCallId,
  title,
  message,
  input,
  riskLevel,
  subtitle,
  actions,
  className,
}: ToolConfirmationProps) {
  const { callbacks } = useChatContext();
  const icon = resolveToolIcon(toolId);

  const handleAction = useCallback(
    (actionId: string) => {
      callbacks.onToolAction?.(toolCallId, actionId, toolId);
    },
    [toolCallId, toolId, callbacks],
  );

  return (
    <div
      className={cn('ac-tool-confirmation', 'ac-card', className)}
      data-testid="tool-confirmation"
    >
      <div className="ac-tool-confirmation__header">
        <span className="ac-tool-confirmation__icon" aria-hidden="true">
          {icon}
        </span>
        <div className="ac-tool-confirmation__title-group">
          <span className="ac-tool-confirmation__title">{title}</span>
          {subtitle && <span className="ac-tool-confirmation__subtitle">{subtitle}</span>}
        </div>
        {riskLevel && <RiskBadge level={riskLevel} />}
      </div>

      {message && <div className="ac-tool-confirmation__message">{message}</div>}

      {input && (
        <div className="ac-tool-confirmation__input">
          <CollapsibleSection title="Tool Input" defaultExpanded={false}>
            <CodeBlock kind="code" code={input} language="json" showToolbar={false} />
          </CollapsibleSection>
        </div>
      )}

      <div className="ac-tool-confirmation__actions">
        {actions.map((action) => (
          <button
            key={action.id}
            className={cn(
              'ac-btn',
              action.primary && 'ac-btn--primary',
              !action.primary && 'ac-btn--secondary',
            )}
            onClick={() => handleAction(action.id)}
          >
            {action.label}
            {action.keybinding && <kbd className="ac-keybinding">{action.keybinding}</kbd>}
            {action.children && action.children.length > 0 && (
              <span className="ac-btn__dropdown-arrow" aria-hidden="true">
                ▾
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
});
