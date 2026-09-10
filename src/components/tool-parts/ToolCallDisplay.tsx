/**
 * ToolCallDisplay — orchestrator that renders a tool call across its lifecycle.
 * Picks the correct sub-part based on status and tool type.
 *
 * @module components/tool-parts/ToolCallDisplay
 */

import { memo } from 'react';
import type { ToolCallPart } from '../../types/content-parts';
import { cn } from '../../utils/cn';
import { isTerminalTool } from './toolUtils';
import { ToolStreaming } from './ToolStreaming';
import { ToolConfirmation } from './ToolConfirmation';
import { ToolProgress } from './ToolProgress';
import { TerminalToolDisplay } from './TerminalToolDisplay';
import { McpAppDisplay } from './McpAppDisplay';

export interface ToolCallDisplayProps extends ToolCallPart {
  /** Whether the parent response is streaming */
  isStreaming: boolean;
  /** Additional CSS class */
  className?: string;
}

export const ToolCallDisplay = memo(function ToolCallDisplay(props: ToolCallDisplayProps) {
  const { status, toolId, mcpApp, className, ...rest } = props;

  // MCP App takes precedence
  if (mcpApp) {
    return (
      <McpAppDisplay
        toolId={toolId}
        toolCallId={rest.toolCallId}
        mcpApp={mcpApp}
        status={status}
        className={className}
      />
    );
  }

  const wrapperClass = cn('ac-tool-call', className);

  switch (status) {
    case 'streaming':
      return (
        <div className={wrapperClass} data-testid="tool-call-display">
          <ToolStreaming
            toolId={toolId}
            toolCallId={rest.toolCallId}
            progressMessage={rest.progressMessage}
            icon={rest.icon}
          />
        </div>
      );

    case 'confirming':
      return (
        <div className={wrapperClass} data-testid="tool-call-display">
          <ToolConfirmation
            kind="tool-confirmation"
            toolId={toolId}
            toolCallId={rest.toolCallId}
            title={rest.label ?? toolId}
            message={rest.progressMessage ?? ''}
            input={typeof rest.input === 'string' ? rest.input : undefined}
            riskLevel={rest.riskLevel}
            actions={[
              { id: 'allow-once', label: 'Allow Once', primary: true, keybinding: '⌘Enter' },
              { id: 'skip', label: 'Skip' },
            ]}
          />
        </div>
      );

    case 'running':
      if (isTerminalTool(toolId)) {
        return (
          <div className={wrapperClass} data-testid="tool-call-display">
            <TerminalToolDisplay
              kind="terminal-command"
              command={rest.label ?? toolId}
              output={rest.output ?? ''}
              exitCode={null}
              isRunning
            />
          </div>
        );
      }
      return (
        <div className={wrapperClass} data-testid="tool-call-display">
          <ToolProgress
            toolId={toolId}
            toolCallId={rest.toolCallId}
            status={status}
            label={rest.label}
            icon={rest.icon}
            input={rest.input}
            output={rest.output}
            progressMessage={rest.progressMessage}
          />
        </div>
      );

    case 'complete':
    case 'failed':
    case 'cancelled':
    default:
      return (
        <div className={wrapperClass} data-testid="tool-call-display">
          <ToolProgress
            toolId={toolId}
            toolCallId={rest.toolCallId}
            status={status}
            label={rest.label}
            icon={rest.icon}
            input={rest.input}
            output={rest.output}
            progressMessage={rest.progressMessage}
          />
        </div>
      );
  }
});
