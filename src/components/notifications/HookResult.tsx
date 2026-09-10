/**
 * HookResult — displays blocked/warning hook results.
 *
 * @module components/notifications/HookResult
 */

import { memo } from 'react';
import type { HookResultPart } from '../../types/content-parts';
import { cn } from '../../utils/cn';
import { CollapsibleSection } from '../atoms/CollapsibleSection';

export interface HookResultProps extends HookResultPart {
  /** Additional CSS class */
  className?: string;
}

export const HookResult = memo(function HookResult({
  hookType,
  toolName,
  outcome,
  reason,
  message: hookMessage,
  className,
}: HookResultProps) {
  const level = outcome === 'blocked' ? 'error' : 'warning';
  const icon = outcome === 'blocked' ? '🚫' : '⚠';
  const title = `${outcome === 'blocked' ? 'Blocked' : 'Warning'}: ${toolName}`;

  return (
    <div
      className={cn('ac-notification', `ac-notification--${level}`, className)}
      data-testid="hook-result"
    >
      <CollapsibleSection title={title} icon={icon}>
        <div className="ac-notification__message">
          <div>
            <strong>Hook:</strong> {hookType}
          </div>
          <div>
            <strong>Tool:</strong> {toolName}
          </div>
          {reason && (
            <div>
              <strong>Reason:</strong> {reason}
            </div>
          )}
          {hookMessage && <div>{hookMessage}</div>}
        </div>
      </CollapsibleSection>
    </div>
  );
});
