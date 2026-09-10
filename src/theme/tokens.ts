/**
 * Theme token interface — defines all visual properties.
 * All CSS uses `var(--ac-*)` variables derived from these tokens.
 *
 * @module theme/tokens
 */

export interface AgentChatTheme {
  // ─── Backgrounds ───
  bgPrimary: string;
  bgList: string;
  bgRequest: string;
  bgResponse: string;
  bgInput: string;
  bgInputFocus: string;
  bgCode: string;
  bgHover: string;
  bgStatus: string;
  bgAvatar: string;
  bgCard: string;
  bgTooltip: string;
  bgThinking: string;
  bgTerminal: string;

  // ─── Foregrounds ───
  fgPrimary: string;
  fgSecondary: string;
  fgTertiary: string;
  fgLink: string;
  fgAvatar: string;
  fgIcon: string;
  fgIconHover: string;
  fgPlaceholder: string;

  // ─── Semantic ───
  success: string;
  error: string;
  warning: string;
  info: string;
  diffAdded: string;
  diffRemoved: string;
  diffAddedBg: string;
  diffRemovedBg: string;

  // ─── Borders ───
  border: string;
  borderRequest: string;
  borderInput: string;
  borderInputFocus: string;
  borderInputActive1: string;
  borderInputActive2: string;
  borderCode: string;
  borderCard: string;
  borderSeparator: string;
  borderCheckpoint: string;

  // ─── Interactive ───
  buttonPrimaryBg: string;
  buttonPrimaryFg: string;
  buttonSecondaryBg: string;
  buttonSecondaryFg: string;
  buttonHoverOverlay: string;
  bgFollowup: string;
  fgFollowup: string;

  // ─── Special ───
  shimmer: string;
  shimmerBase: string;
  findMatchHighlight: string;
  bgSlashCommand: string;
  fgSlashCommand: string;
  fgEditedFile: string;
  bgSelection: string;

  // ─── Risk Levels ───
  riskLow: string;
  riskMedium: string;
  riskHigh: string;

  // ─── Todo Status ───
  todoCompleted: string;
  todoInProgress: string;
  todoNotStarted: string;

  // ─── Spacing ───
  spaceXxs: string;
  spaceXs: string;
  spaceSm: string;
  spaceMd: string;
  spaceLg: string;
  spaceXl: string;
  spaceXxl: string;
  space3xl: string;

  // ─── Typography ───
  fontFamily: string;
  fontFamilyMono: string;
  fontSizeBase: string;
  fontSizeXs: string;
  fontSizeSm: string;
  fontSizeMd: string;
  fontSizeLg: string;
  fontSizeXl: string;
  fontSizeXxl: string;
  lineHeight: string;
  lineHeightCode: string;
  fontWeightBold: string;

  // ─── Radii ───
  radiusSm: string;
  radiusMd: string;
  radiusLg: string;
  radiusCircle: string;

  // ─── Sizes ───
  avatarSize: string;
  iconSize: string;
  iconSizeSm: string;
  strokeWidth: string;
  controlHeight: string;
  todoRowHeight: string;
  fileRowHeight: string;

  // ─── Shadows ───
  shadowCard: string;
  shadowTooltip: string;
  shadowDropdown: string;

  // ─── Transitions ───
  transitionFast: string;
  transitionMedium: string;
  transitionSlow: string;
}
