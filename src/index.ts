/**
 * @agent-chat/react
 *
 * Reusable React component library for AI agent chat interfaces.
 * Inspired by VS Code's chat architecture, designed for any AI backend.
 *
 * @packageDocumentation
 */

// ═══════════════════════════════════════════
// TYPES — Core data models for consumers
// ═══════════════════════════════════════════
export type {
  // Session & Messages
  ChatSession,
  ChatMessage,
  ChatRequest,
  ChatResponse,
  ChatAgent,
  ChatFollowup,
  ChatError,
  ChatUsage,
  ChatRequestOrigin,
  ChatMode,
  ResponseState,
  VoteDirection,

  // Attachments
  ChatAttachment,
  FileAttachment,
  ImageAttachment,
  TerminalAttachment,
  ToolSetAttachment,
  SelectionAttachment,
  CustomAttachment,
} from './types/models';

export type {
  // Content Parts
  ChatContentPart,
  MarkdownPart,
  CollapsibleMarkdownPart,
  CodeBlockPart,
  CodeCitationPart,
  ThinkingPart,
  SubAgentPart,
  ToolCallPart,
  ToolConfirmationPart,
  ToolConfirmationCarouselPart,
  TerminalCommandPart,
  EditPillPart,
  FileChangesSummaryPart,
  TurnPillsPart,
  InlineDiffPart,
  WorkspaceEditPart,
  ProgressPart,
  WorkingPart,
  AutoModeResolutionPart,
  McpServersStartingPart,
  PlanReviewPart,
  TodoListPart,
  TodoItem,
  TodoItemStatus,
  ConfirmationPart,
  ElicitationPart,
  QuestionCarouselPart,
  ReferencesPart,
  InlineReferencePart,
  FileTreePart,
  ErrorPart,
  SystemNotificationPart,
  WorkspaceTransitionPart,
  HookResultPart,
  TipPart,
  QuotaExceededPart,
  RateLimitedPart,
  PullRequestPart,
  ExtensionsPart,
  McpAuthRequiredPart,
  ImagePart,
  CommandButtonPart,
  SuggestNextPart,
  FollowupPart,

  // Supporting types
  ToolCallStatus,
  RiskLevel,
  FileChangeEntry,
  FileReference,
  TreeNode,
  Vulnerability,
  ToolConfirmationAction,
  ActionButton,
  CarouselQuestion,
} from './types/content-parts';

export type { ChatCallbacks, SendMessageOptions } from './types/events';

export type {
  AgentChatConfig,
  ModelOption,
  ContentPartRendererMap,
  AttachmentRendererMap,
} from './types/config';

// ═══════════════════════════════════════════
// THEME
// ═══════════════════════════════════════════
export type { AgentChatTheme } from './theme/tokens';
export { darkTheme } from './theme/dark';
export { lightTheme } from './theme/light';
export { ThemeProvider } from './theme/ThemeProvider';
export type { ThemeProviderProps } from './theme/ThemeProvider';

// ═══════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════
export { ChatProvider } from './provider/ChatProvider';
export type { ChatProviderProps } from './provider/ChatProvider';
export { useChatContext, useChatSelector } from './provider/useChatContext';
export { useChatActions } from './provider/useChatActions';
export type { ChatContextValue } from './provider/ChatContext';

// ═══════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════
export { useRelativeTime, formatAbsoluteTime } from './hooks/useRelativeTime';
export { useCollapsible } from './hooks/useCollapsible';

// ═══════════════════════════════════════════
// ATOM COMPONENTS
// ═══════════════════════════════════════════
export { Avatar } from './components/atoms/Avatar';
export type { AvatarProps } from './components/atoms/Avatar';
export { Username } from './components/atoms/Username';
export type { UsernameProps } from './components/atoms/Username';
export { Timestamp } from './components/atoms/Timestamp';
export type { TimestampProps } from './components/atoms/Timestamp';
export { ShimmerText } from './components/atoms/ShimmerText';
export type { ShimmerTextProps } from './components/atoms/ShimmerText';
export { AnimatedDots } from './components/atoms/AnimatedDots';
export type { AnimatedDotsProps } from './components/atoms/AnimatedDots';
export { PixelSpinner } from './components/atoms/PixelSpinner';
export type { PixelSpinnerProps } from './components/atoms/PixelSpinner';
export { IconButton } from './components/atoms/IconButton';
export type { IconButtonProps } from './components/atoms/IconButton';
export { Chip } from './components/atoms/Chip';
export type { ChipProps } from './components/atoms/Chip';
export { Badge } from './components/atoms/Badge';
export type { BadgeProps } from './components/atoms/Badge';
export { CollapsibleSection } from './components/atoms/CollapsibleSection';
export type { CollapsibleSectionProps } from './components/atoms/CollapsibleSection';
export { RiskBadge } from './components/atoms/RiskBadge';
export type { RiskBadgeProps } from './components/atoms/RiskBadge';
export { StatusIcon } from './components/atoms/StatusIcon';
export type { StatusIconProps, StatusIconStatus } from './components/atoms/StatusIcon';
