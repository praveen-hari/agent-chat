/**
 * WorkspaceEdit — displays file operations (create, delete, rename) as progress steps.
 *
 * @module components/content-parts/WorkspaceEdit
 */

import { memo } from 'react';
import type { WorkspaceEditPart } from '../../types/content-parts';
import { cn } from '../../utils/cn';
import { ProgressStep } from './ProgressStep';

export interface WorkspaceEditProps extends WorkspaceEditPart {
  /** Additional CSS class */
  className?: string;
}

const OPERATION_LABELS: Record<string, string> = {
  created: '+ Created',
  deleted: '× Deleted',
  renamed: '→ Renamed',
};

export const WorkspaceEdit = memo(function WorkspaceEdit({
  operations,
  className,
}: WorkspaceEditProps) {
  return (
    <div className={cn('ac-workspace-edit', className)} data-testid="workspace-edit">
      {operations.map((op, i) => {
        const label =
          op.type === 'renamed'
            ? `${OPERATION_LABELS[op.type]} ${op.filename} to ${op.newFilename}`
            : `${OPERATION_LABELS[op.type]} ${op.filename}`;

        return (
          <ProgressStep
            key={`${op.filename}-${i}`}
            kind="progress"
            message={label}
            isActive={false}
          />
        );
      })}
    </div>
  );
});
