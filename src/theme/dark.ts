/**
 * VS Code Dark theme preset.
 * Based on VS Code's chat color tokens from chatColors.ts.
 *
 * @module theme/dark
 */

import type { AgentChatTheme } from './tokens';

export const darkTheme: AgentChatTheme = {
  // ─── Backgrounds ───
  bgPrimary: '#1e1e1e',
  bgList: '#1e1e1e',
  bgRequest: 'rgba(30, 30, 30, 0.62)',
  bgResponse: 'transparent',
  bgInput: '#2d2d2d',
  bgInputFocus: '#2d2d2d',
  bgCode: '#1e1e1e',
  bgHover: 'rgba(255, 255, 255, 0.05)',
  bgStatus: 'rgba(204, 204, 204, 0.08)',
  bgAvatar: '#1f1f1f',
  bgCard: '#252526',
  bgTooltip: '#2d2d30',
  bgThinking: 'rgba(255, 255, 255, 0.03)',
  bgTerminal: '#1a1a1a',

  // ─── Foregrounds ───
  fgPrimary: '#cccccc',
  fgSecondary: '#999999',
  fgTertiary: '#6b6b6b',
  fgLink: '#4daafc',
  fgAvatar: '#cccccc',
  fgIcon: '#c5c5c5',
  fgIconHover: '#ffffff',
  fgPlaceholder: '#6b6b6b',

  // ─── Semantic ───
  success: '#3fb950',
  error: '#f85149',
  warning: '#d29922',
  info: '#4daafc',
  diffAdded: '#3fb950',
  diffRemoved: '#f85149',
  diffAddedBg: 'rgba(63, 185, 80, 0.15)',
  diffRemovedBg: 'rgba(248, 81, 73, 0.15)',

  // ─── Borders ───
  border: 'rgba(255, 255, 255, 0.08)',
  borderRequest: 'rgba(255, 255, 255, 0.10)',
  borderInput: 'rgba(255, 255, 255, 0.12)',
  borderInputFocus: '#0078d4',
  borderInputActive1: '#0078d4',
  borderInputActive2: '#4daafc',
  borderCode: 'rgba(255, 255, 255, 0.08)',
  borderCard: 'rgba(255, 255, 255, 0.10)',
  borderSeparator: 'rgba(255, 255, 255, 0.08)',
  borderCheckpoint: 'rgba(255, 255, 255, 0.10)',

  // ─── Interactive ───
  buttonPrimaryBg: '#0078d4',
  buttonPrimaryFg: '#ffffff',
  buttonSecondaryBg: 'rgba(255, 255, 255, 0.08)',
  buttonSecondaryFg: '#cccccc',
  buttonHoverOverlay: 'rgba(255, 255, 255, 0.05)',
  bgFollowup: 'rgba(255, 255, 255, 0.06)',
  fgFollowup: '#cccccc',

  // ─── Special ───
  shimmer: 'rgba(255, 255, 255, 0.12)',
  shimmerBase: 'transparent',
  findMatchHighlight: 'rgba(234, 92, 0, 0.33)',
  bgSlashCommand: 'rgba(255, 255, 255, 0.12)',
  fgSlashCommand: '#cccccc',
  fgEditedFile: '#4daafc',
  bgSelection: 'rgba(0, 120, 212, 0.3)',

  // ─── Risk Levels ───
  riskLow: '#3fb950',
  riskMedium: '#d29922',
  riskHigh: '#f85149',

  // ─── Todo Status ───
  todoCompleted: '#3fb950',
  todoInProgress: '#4daafc',
  todoNotStarted: '#6b6b6b',

  // ─── Spacing ───
  spaceXxs: '2px',
  spaceXs: '4px',
  spaceSm: '6px',
  spaceMd: '8px',
  spaceLg: '12px',
  spaceXl: '16px',
  spaceXxl: '24px',
  space3xl: '36px',

  // ─── Typography ───
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
  fontFamilyMono:
    "'SF Mono', Monaco, Menlo, Consolas, 'Ubuntu Mono', 'Liberation Mono', 'DejaVu Sans Mono', 'Courier New', monospace",
  fontSizeBase: '13px',
  fontSizeXs: '0.846em',
  fontSizeSm: '0.923em',
  fontSizeMd: '1em',
  fontSizeLg: '1.077em',
  fontSizeXl: '1.231em',
  fontSizeXxl: '1.538em',
  lineHeight: '1.4',
  lineHeightCode: '1.5',
  fontWeightBold: '600',

  // ─── Radii ───
  radiusSm: '4px',
  radiusMd: '6px',
  radiusLg: '8px',
  radiusCircle: '50%',

  // ─── Sizes ───
  avatarSize: '24px',
  iconSize: '16px',
  iconSizeSm: '14px',
  strokeWidth: '1px',
  controlHeight: '22px',
  todoRowHeight: '22px',
  fileRowHeight: '22px',

  // ─── Shadows ───
  shadowCard: '0 2px 8px rgba(0, 0, 0, 0.4)',
  shadowTooltip: '0 2px 4px rgba(0, 0, 0, 0.5)',
  shadowDropdown: '0 4px 12px rgba(0, 0, 0, 0.5)',

  // ─── Transitions ───
  transitionFast: '100ms ease',
  transitionMedium: '200ms ease',
  transitionSlow: '300ms ease',
};
