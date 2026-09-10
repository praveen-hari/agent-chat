/**
 * WorkspaceTransition — horizontal separator with workspace name.
 *
 * @module components/notifications/WorkspaceTransition
 */

import { memo } from 'react';
import type { WorkspaceTransitionPart } from '../../types/content-parts';
import { cn } from '../../utils/cn';

export interface WorkspaceTransitionProps extends WorkspaceTransitionPart {
  /** Additional CSS class */
  className?: string;
}

export const WorkspaceTransition = memo(function WorkspaceTransition({
  workspaceName,
  icon,
  className,
}: WorkspaceTransitionProps) {
  return (
    <div
      className={cn('ac-workspace-transition', className)}
      role="separator"
      aria-label={`Workspace: ${workspaceName}`}
      data-testid="workspace-transition"
    >
      <div className="ac-workspace-transition__line" />
      <span className="ac-workspace-transition__label">
        <span aria-hidden="true">{icon ?? '📁'}</span>
        {workspaceName}
      </span>
      <div className="ac-workspace-transition__line" />
    </div>
  );
});
