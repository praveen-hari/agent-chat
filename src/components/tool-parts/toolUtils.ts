/**
 * Shared utilities for tool invocation components.
 *
 * @module components/tool-parts/toolUtils
 */

/**
 * Resolve an icon emoji for a tool based on its toolId.
 * Matches VS Code's `getToolInvocationIcon()` patterns.
 */
export function resolveToolIcon(toolId: string, explicitIcon?: string): string {
  if (explicitIcon) return explicitIcon;

  const id = toolId.toLowerCase();
  if (id.includes('comment')) return 'comment-discussion';
  if (/search|grep|find|list|semantic|changes|codebase/.test(id)) return 'search';
  if (/read|get_file|problems/.test(id)) return 'file-code';
  if (/edit|create|replace|patch|write/.test(id)) return 'edit';
  if (id.includes('terminal')) return 'terminal';
  if (id.includes('browser')) return 'globe';
  if (id.includes('test')) return 'beaker';
  if (id.includes('git')) return 'source-control';
  return 'wrench';
}

/** Check if a tool ID represents a terminal/shell command tool. */
export function isTerminalTool(toolId: string): boolean {
  const id = toolId.toLowerCase();
  return (
    id.includes('terminal') ||
    id.includes('shell') ||
    id.includes('run_in_terminal') ||
    id.includes('run_command')
  );
}

/** Truncate a string to a maximum length, adding ellipsis. */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}…`;
}

/**
 * Format tool status into a human-readable label.
 */
export function formatToolStatus(status: string): string {
  switch (status) {
    case 'streaming':
      return 'Preparing…';
    case 'confirming':
      return 'Awaiting approval';
    case 'running':
      return 'Running';
    case 'complete':
      return 'Complete';
    case 'failed':
      return 'Failed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
}
