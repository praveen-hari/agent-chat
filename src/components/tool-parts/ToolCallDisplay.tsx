/**
 * ToolCallDisplay — renders tool calls matching VS Code's style.
 *
 * Most tools render as a **single-line progress step** (VS Code default):
 *   ✓ 📖 Read `utils.ts`, lines 10 to 25
 *   ✓ ✏️ Edited `ProgressStep.tsx` +7 -0
 *   ⟳ 🔍 Searching for "function add"
 *   ✓ 💻 $ npm test
 *
 * Only tools with `hasCustomOutput: true` or MCP apps use the
 * expandable ToolProgress view with INPUT/OUTPUT sections.
 *
 * @module components/tool-parts/ToolCallDisplay
 */

import { memo } from 'react';
import type { ToolCallPart } from '../../types/content-parts';
import { cn } from '../../utils/cn';
import { resolveToolIcon } from './toolUtils';
import { isTerminalTool } from './toolUtils';
import { ToolStreaming } from './ToolStreaming';
import { ToolConfirmation } from './ToolConfirmation';
import { ToolProgress } from './ToolProgress';
import { TerminalToolDisplay } from './TerminalToolDisplay';
import { McpAppDisplay } from './McpAppDisplay';
import { ProgressStep } from '../content-parts/ProgressStep';

export interface ToolCallDisplayProps extends ToolCallPart {
  /** Whether the parent response is streaming */
  isStreaming: boolean;
  /** Additional CSS class */
  className?: string;
}

/**
 * Build a human-readable single-line label for a tool call (VS Code style).
 * Examples:
 *   "Read utils.ts" / "Read utils.ts, lines 10 to 25"
 *   "Edited ProgressStep.tsx +7 -0"
 *   "Searching for 'function add'"
 *   "Listed 5 files"
 */
function buildToolLabel(toolId: string, label?: string, input?: unknown, output?: string): string {
  // If consumer provided a label, use it
  if (label) return label;

  const id = toolId.toLowerCase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const args = (typeof input === 'object' && input !== null ? input : {}) as any;

  // Parse output for stats if available
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let outputData: any = null;
  if (output) {
    try { outputData = JSON.parse(output); } catch { /* ignore */ }
  }

  // Read file → "Read {filename}"
  if (id.includes('read') && args.path) {
    const filename = String(args.path).split('/').pop();
    const lines = outputData?.lines;
    return lines ? `Read \`${filename}\`, ${lines} lines` : `Read \`${filename}\``;
  }

  // Write/edit file → "Edited {filename} +N -M" or "Created {filename}"
  if ((id.includes('write') || id.includes('edit') || id.includes('create') || id.includes('replace')) && args.path) {
    const filename = String(args.path).split('/').pop();
    const action = outputData?.action === 'created' ? 'Created' : 'Edited';
    const lines = outputData?.lines;
    return lines ? `${action} \`${filename}\` ${lines} lines` : `${action} \`${filename}\``;
  }

  // List files → "Listed N files"
  if (id.includes('list')) {
    const total = outputData?.total;
    return total ? `Listed ${total} files` : 'Listed files';
  }

  // Search → "Searched for 'query'"
  if (id.includes('search') || id.includes('grep') || id.includes('find')) {
    const query = args.query || args.pattern;
    const matches = outputData?.matches;
    if (query && matches != null) return `Searched \`${query}\` — ${matches} match${matches !== 1 ? 'es' : ''}`;
    if (query) return `Searching for \`${query}\``;
    return 'Searching…';
  }

  // Run command → "$ command"
  if (id.includes('run') || id.includes('terminal') || id.includes('command') || id.includes('exec')) {
    const cmd = args.command || args.cmd;
    if (cmd) return `\`$ ${String(cmd).slice(0, 50)}\``;
  }

  // Web search → "Searched web for 'query'"
  if (id.includes('web')) {
    const query = args.query;
    if (query) return `Searched web for \`${query}\``;
  }

  // Todo/plan → "Updated N tasks"
  if (id.includes('todo') || id.includes('plan')) {
    const items = args.items;
    if (Array.isArray(items)) return `Updated ${items.length} task${items.length !== 1 ? 's' : ''}`;
    return 'Updated tasks';
  }

  // Fallback: just the tool name
  return toolId;
}

export const ToolCallDisplay = memo(function ToolCallDisplay(
  props: ToolCallDisplayProps,
) {
  const { status, toolId, mcpApp, hasCustomOutput, className, ...rest } = props;

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
  const icon = resolveToolIcon(toolId, rest.icon);
  const label = buildToolLabel(toolId, rest.label, rest.input, rest.output);

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
            title={label}
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
      // Terminal tools get special display
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

      // Running: single-line progress step (VS Code default)
      return (
        <div className={wrapperClass} data-testid="tool-call-display">
          <ProgressStep
            kind="progress"
            message={label}
            icon={icon}
            isActive
            shimmer
          />
        </div>
      );

    case 'complete':
    case 'failed':
    case 'cancelled':
    default:
      // If tool has custom output, show expandable ToolProgress
      if (hasCustomOutput) {
        return (
          <div className={wrapperClass} data-testid="tool-call-display">
            <ToolProgress
              toolId={toolId}
              toolCallId={rest.toolCallId}
              status={status}
              label={label}
              icon={rest.icon}
              input={rest.input}
              output={rest.output}
              progressMessage={rest.progressMessage}
            />
          </div>
        );
      }

      // Default: simple single-line (VS Code style)
      return (
        <div className={wrapperClass} data-testid="tool-call-display">
          <ProgressStep
            kind="progress"
            message={label}
            icon={icon}
            isActive={false}
          />
        </div>
      );
  }
});
