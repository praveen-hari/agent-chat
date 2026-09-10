/**
 * Icon resolution utilities for tools, files, and change statuses.
 *
 * @module utils/iconMap
 */

const TOOL_ICON_PATTERNS: Array<[RegExp, string]> = [
  [/comment/i, '💬'],
  [/search|grep|find|list|semantic|changes|codebase/i, '🔍'],
  [/read|get_file|problems/i, '📖'],
  [/edit|create|replace|patch|write/i, '✏️'],
  [/test|spec|assert/i, '🧪'],
  [/terminal|shell|exec|run/i, '💻'],
  [/browser|fetch|url|web/i, '🌐'],
  [/git|commit|push|pull|branch/i, '📦'],
  [/database|sql|query/i, '🗄️'],
  [/image|screenshot|visual/i, '🖼️'],
  [/deploy|build|compile/i, '🚀'],
  [/auth|login|token/i, '🔐'],
];

const DEFAULT_TOOL_ICON = '🔧';

/**
 * Resolves a tool ID to a display icon (emoji).
 * Matches VS Code's getToolInvocationIcon() logic.
 */
export function resolveToolIcon(toolId: string): string {
  for (const [pattern, icon] of TOOL_ICON_PATTERNS) {
    if (pattern.test(toolId)) return icon;
  }
  return DEFAULT_TOOL_ICON;
}

const FILE_EXT_ICONS: Record<string, string> = {
  ts: '📘',
  tsx: '📘',
  js: '📒',
  jsx: '📒',
  json: '📋',
  md: '📝',
  css: '🎨',
  scss: '🎨',
  html: '🌐',
  py: '🐍',
  rs: '🦀',
  go: '🐹',
  java: '☕',
  rb: '💎',
  sh: '💻',
  yaml: '⚙️',
  yml: '⚙️',
  toml: '⚙️',
  sql: '🗄️',
  svg: '🖼️',
  png: '🖼️',
  jpg: '🖼️',
  gif: '🖼️',
};

const DEFAULT_FILE_ICON = '📄';

/**
 * Resolves a filename to a file type icon based on extension.
 */
export function resolveFileIcon(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext && ext in FILE_EXT_ICONS) {
    return FILE_EXT_ICONS[ext]!;
  }
  return DEFAULT_FILE_ICON;
}

const CHANGE_STATUS_ICONS: Record<string, string> = {
  created: '+',
  modified: '✓',
  deleted: '×',
  renamed: '→',
};

/**
 * Maps file change status to a status icon string.
 */
export function resolveChangeStatusIcon(
  status: 'created' | 'modified' | 'deleted' | 'renamed',
): string {
  return CHANGE_STATUS_ICONS[status] ?? '?';
}
