/**
 * VS Code Light theme preset.
 * Overrides the dark theme with light-appropriate values.
 *
 * @module theme/light
 */

import type { AgentChatTheme } from './tokens';
import { darkTheme } from './dark';

export const lightTheme: AgentChatTheme = {
  ...darkTheme,

  // ─── Backgrounds ───
  bgPrimary: '#ffffff',
  bgList: '#ffffff',
  bgRequest: 'rgba(255, 255, 255, 0.62)',
  bgResponse: 'transparent',
  bgInput: '#f3f3f3',
  bgInputFocus: '#ffffff',
  bgCode: '#f5f5f5',
  bgHover: 'rgba(0, 0, 0, 0.04)',
  bgStatus: 'rgba(0, 0, 0, 0.06)',
  bgAvatar: '#f2f2f2',
  bgCard: '#f8f8f8',
  bgTooltip: '#f2f2f2',
  bgThinking: 'rgba(0, 0, 0, 0.02)',
  bgTerminal: '#f5f5f5',

  // ─── Foregrounds ───
  fgPrimary: '#333333',
  fgSecondary: '#616161',
  fgTertiary: '#999999',
  fgLink: '#006ab1',
  fgAvatar: '#333333',
  fgIcon: '#424242',
  fgIconHover: '#000000',
  fgPlaceholder: '#999999',

  // ─── Semantic ───
  success: '#22863a',
  error: '#cb2431',
  warning: '#b08800',
  info: '#006ab1',
  diffAdded: '#22863a',
  diffRemoved: '#cb2431',
  diffAddedBg: 'rgba(34, 134, 58, 0.10)',
  diffRemovedBg: 'rgba(203, 36, 49, 0.10)',

  // ─── Borders ───
  border: 'rgba(0, 0, 0, 0.08)',
  borderRequest: 'rgba(0, 0, 0, 0.10)',
  borderInput: 'rgba(0, 0, 0, 0.12)',
  borderInputFocus: '#0078d4',
  borderInputActive1: '#0078d4',
  borderInputActive2: '#4daafc',
  borderCode: 'rgba(0, 0, 0, 0.08)',
  borderCard: 'rgba(0, 0, 0, 0.10)',
  borderSeparator: 'rgba(0, 0, 0, 0.08)',
  borderCheckpoint: 'rgba(0, 0, 0, 0.10)',

  // ─── Interactive ───
  buttonPrimaryBg: '#0078d4',
  buttonPrimaryFg: '#ffffff',
  buttonSecondaryBg: 'rgba(0, 0, 0, 0.06)',
  buttonSecondaryFg: '#333333',
  buttonHoverOverlay: 'rgba(0, 0, 0, 0.04)',
  bgFollowup: 'rgba(0, 0, 0, 0.04)',
  fgFollowup: '#333333',

  // ─── Special ───
  shimmer: 'rgba(0, 0, 0, 0.08)',
  shimmerBase: 'transparent',
  findMatchHighlight: 'rgba(234, 92, 0, 0.22)',
  bgSlashCommand: 'rgba(0, 0, 0, 0.06)',
  fgSlashCommand: '#333333',
  fgEditedFile: '#006ab1',
  bgSelection: 'rgba(0, 120, 212, 0.15)',

  // ─── Risk Levels ───
  riskLow: '#22863a',
  riskMedium: '#b08800',
  riskHigh: '#cb2431',

  // ─── Todo Status ───
  todoCompleted: '#22863a',
  todoInProgress: '#006ab1',
  todoNotStarted: '#999999',

  // ─── Shadows ───
  shadowCard: '0 2px 8px rgba(0, 0, 0, 0.12)',
  shadowTooltip: '0 2px 4px rgba(0, 0, 0, 0.15)',
  shadowDropdown: '0 4px 12px rgba(0, 0, 0, 0.15)',
};
