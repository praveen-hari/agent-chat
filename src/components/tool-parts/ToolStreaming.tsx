/**
 * ToolStreaming — shown while tool arguments are being generated.
 *
 * @module components/tool-parts/ToolStreaming
 */

import { memo } from 'react';
import { cn } from '../../utils/cn';
import { resolveToolIcon } from './toolUtils';
import { ProgressStep } from '../content-parts/ProgressStep';

export interface ToolStreamingProps {
  /** Tool identifier */
  toolId: string;
  /** Tool call identifier */
  toolCallId: string;
  /** Progress message override */
  progressMessage?: string;
  /** Explicit icon */
  icon?: string;
  /** Additional CSS class */
  className?: string;
}

export const ToolStreaming = memo(function ToolStreaming({
  toolId,
  progressMessage,
  icon,
  className,
}: ToolStreamingProps) {
  const resolvedIcon = resolveToolIcon(toolId, icon);

  return (
    <div className={cn('ac-tool-streaming', className)} data-testid="tool-streaming">
      <ProgressStep
        kind="progress"
        message={`${resolvedIcon} ${progressMessage ?? `Preparing ${toolId}…`}`}
        isActive
        shimmer
      />
    </div>
  );
});
