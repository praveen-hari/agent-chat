/**
 * Icon — renders VS Code Codicons (the official VS Code icon font).
 *
 * Uses the @vscode/codicons font package for pixel-perfect VS Code icons.
 * All icons are rendered as `<i class="codicon codicon-{name}">` elements.
 *
 * @module components/atoms/Icon
 *
 * @example
 * ```tsx
 * <Icon name="search" />
 * <Icon name="check" size={16} className="my-icon" />
 * <Icon name="loading" spin />
 * ```
 */

import { memo } from 'react';
import { cn } from '../../utils/cn';

export interface IconProps {
  /** Codicon name (without "codicon-" prefix) */
  name: string;
  /** Size in pixels (default: inherits from font-size) */
  size?: number;
  /** Whether to apply spin animation (for loading icons) */
  spin?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Accessible label (if icon conveys meaning) */
  label?: string;
}

export const Icon = memo(function Icon({ name, size, spin = false, className, label }: IconProps) {
  return (
    <i
      className={cn('codicon', `codicon-${name}`, spin && 'ac-icon-spin', className)}
      style={size ? { fontSize: `${size}px` } : undefined}
      aria-hidden={!label}
      aria-label={label}
      role={label ? 'img' : undefined}
    />
  );
});

/**
 * Common icon name constants for type safety and discoverability.
 * These map to the most-used codicons in the chat UI.
 */
export const ICONS = {
  // ─── Status ───
  check: 'check',
  close: 'close',
  error: 'error',
  warning: 'warning',
  info: 'info',
  loading: 'loading',
  circle: 'circle-outline',
  circleFilled: 'circle-filled',
  pass: 'pass',
  stop: 'debug-stop',

  // ─── Actions ───
  copy: 'copy',
  edit: 'edit',
  trash: 'trash',
  refresh: 'refresh',
  send: 'send',
  attach: 'attach',
  expand: 'chevron-down',
  collapse: 'chevron-up',
  chevronRight: 'chevron-right',
  chevronDown: 'chevron-down',
  arrowUp: 'arrow-up',
  arrowDown: 'arrow-down',
  arrowLeft: 'arrow-left',
  arrowRight: 'arrow-right',

  // ─── Navigation ───
  search: 'search',
  filter: 'filter',
  menu: 'menu',
  more: 'more',
  pin: 'pin',

  // ─── Chat & AI ───
  comment: 'comment',
  commentDiscussion: 'comment-discussion',
  sparkle: 'sparkle',
  copilot: 'copilot',
  robot: 'robot',
  lightbulb: 'lightbulb',
  brain: 'symbol-misc',

  // ─── Tools ───
  wrench: 'wrench',
  gear: 'gear',
  terminal: 'terminal',
  globe: 'globe',
  beaker: 'beaker',
  play: 'play',
  debug: 'debug',
  database: 'database',
  key: 'key',
  shield: 'shield',
  rocket: 'rocket',

  // ─── Files ───
  file: 'file',
  fileCode: 'file-code',
  fileMedia: 'file-media',
  filePdf: 'file-pdf',
  fileZip: 'file-zip',
  folder: 'folder',
  folderOpened: 'folder-opened',
  newFile: 'new-file',
  diffAdded: 'diff-added',
  diffRemoved: 'diff-removed',
  diffModified: 'diff-modified',
  diffRenamed: 'diff-renamed',

  // ─── Git / Source Control ───
  gitMerge: 'git-merge',
  gitPullRequest: 'git-pull-request',
  gitCommit: 'git-commit',
  gitBranch: 'git-branch',
  sourceControl: 'source-control',
  repo: 'repo',

  // ─── UI ───
  thumbsup: 'thumbsup',
  thumbsdown: 'thumbsdown',
  eye: 'eye',
  link: 'link-external',
  bookmark: 'bookmark',
  star: 'star-full',
  person: 'person',
  organization: 'organization',

  // ─── Layout ───
  splitHorizontal: 'split-horizontal',
  splitVertical: 'split-vertical',
  listTree: 'list-tree',
  listFlat: 'list-flat',
} as const;

export type IconName = (typeof ICONS)[keyof typeof ICONS];
