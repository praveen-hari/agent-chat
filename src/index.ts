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

// ═══════════════════════════════════════════
// CONTENT PART COMPONENTS
// ═══════════════════════════════════════════
export { ContentPartRenderer } from './components/content-parts/ContentPartRenderer';
export type { ContentPartRendererProps } from './components/content-parts/ContentPartRenderer';
export { MarkdownContent } from './components/content-parts/MarkdownContent';
export type { MarkdownContentProps } from './components/content-parts/MarkdownContent';
export { CodeBlock } from './components/content-parts/CodeBlock';
export type { CodeBlockProps } from './components/content-parts/CodeBlock';
export { ThinkingBlock } from './components/content-parts/ThinkingBlock';
export type { ThinkingBlockProps } from './components/content-parts/ThinkingBlock';
export { SubAgentDisplay } from './components/content-parts/SubAgentDisplay';
export type { SubAgentDisplayProps } from './components/content-parts/SubAgentDisplay';
export { ProgressStep } from './components/content-parts/ProgressStep';
export type { ProgressStepProps } from './components/content-parts/ProgressStep';
export { WorkingIndicator } from './components/content-parts/WorkingIndicator';
export type { WorkingIndicatorProps } from './components/content-parts/WorkingIndicator';
export { EditPill } from './components/content-parts/EditPill';
export type { EditPillProps } from './components/content-parts/EditPill';
export { FileChangesSummary } from './components/content-parts/FileChangesSummary';
export type { FileChangesSummaryProps } from './components/content-parts/FileChangesSummary';
export { TurnPills } from './components/content-parts/TurnPills';
export type { TurnPillsProps } from './components/content-parts/TurnPills';
export { InlineDiff } from './components/content-parts/InlineDiff';
export type { InlineDiffProps } from './components/content-parts/InlineDiff';
export { WorkspaceEdit } from './components/content-parts/WorkspaceEdit';
export type { WorkspaceEditProps } from './components/content-parts/WorkspaceEdit';
export { TodoList } from './components/content-parts/TodoList';
export type { TodoListProps } from './components/content-parts/TodoList';
export { PlanReviewCard } from './components/content-parts/PlanReviewCard';
export type { PlanReviewCardProps } from './components/content-parts/PlanReviewCard';
export { FileTree } from './components/content-parts/FileTree';
export type { FileTreeProps } from './components/content-parts/FileTree';
export { ReferencesList } from './components/content-parts/ReferencesList';
export type { ReferencesListProps } from './components/content-parts/ReferencesList';
export { InlineReference } from './components/content-parts/InlineReference';
export type { InlineReferenceProps } from './components/content-parts/InlineReference';
export { ImageContent } from './components/content-parts/ImageContent';
export type { ImageContentProps } from './components/content-parts/ImageContent';

// ═══════════════════════════════════════════
// NOTIFICATION COMPONENTS
// ═══════════════════════════════════════════
export { ErrorMessage } from './components/notifications/ErrorMessage';
export type { ErrorMessageProps } from './components/notifications/ErrorMessage';
export { SystemNotification } from './components/notifications/SystemNotification';
export type { SystemNotificationProps } from './components/notifications/SystemNotification';
export { WorkspaceTransition } from './components/notifications/WorkspaceTransition';
export type { WorkspaceTransitionProps } from './components/notifications/WorkspaceTransition';
export { HookResult } from './components/notifications/HookResult';
export type { HookResultProps } from './components/notifications/HookResult';
export { TipContent } from './components/notifications/TipContent';
export type { TipContentProps } from './components/notifications/TipContent';
export { QuotaExceeded } from './components/notifications/QuotaExceeded';
export type { QuotaExceededProps } from './components/notifications/QuotaExceeded';
export { RateLimited } from './components/notifications/RateLimited';
export type { RateLimitedProps } from './components/notifications/RateLimited';

// ═══════════════════════════════════════════
// INTERACTIVE COMPONENTS
// ═══════════════════════════════════════════
export { ConfirmationDialog } from './components/interactive/ConfirmationDialog';
export type { ConfirmationDialogProps } from './components/interactive/ConfirmationDialog';
export { ElicitationDialog } from './components/interactive/ElicitationDialog';
export type { ElicitationDialogProps } from './components/interactive/ElicitationDialog';
export { CommandButton } from './components/interactive/CommandButton';
export type { CommandButtonProps } from './components/interactive/CommandButton';
export { FollowupButton } from './components/interactive/FollowupButton';
export type { FollowupButtonProps } from './components/interactive/FollowupButton';
export { SuggestNext } from './components/interactive/SuggestNext';
export type { SuggestNextProps } from './components/interactive/SuggestNext';
export { PullRequestCard } from './components/interactive/PullRequestCard';
export type { PullRequestCardProps } from './components/interactive/PullRequestCard';

// ═══════════════════════════════════════════
// TOOL INVOCATION COMPONENTS
// ═══════════════════════════════════════════
export { ToolCallDisplay } from './components/tool-parts/ToolCallDisplay';
export type { ToolCallDisplayProps } from './components/tool-parts/ToolCallDisplay';
export { ToolStreaming } from './components/tool-parts/ToolStreaming';
export type { ToolStreamingProps } from './components/tool-parts/ToolStreaming';
export { ToolConfirmation } from './components/tool-parts/ToolConfirmation';
export type { ToolConfirmationProps } from './components/tool-parts/ToolConfirmation';
export { ToolProgress } from './components/tool-parts/ToolProgress';
export type { ToolProgressProps } from './components/tool-parts/ToolProgress';
export { TerminalToolDisplay } from './components/tool-parts/TerminalToolDisplay';
export type { TerminalToolDisplayProps } from './components/tool-parts/TerminalToolDisplay';
export { ToolConfirmationCarousel } from './components/tool-parts/ToolConfirmationCarousel';
export type { ToolConfirmationCarouselProps } from './components/tool-parts/ToolConfirmationCarousel';
export { McpAppDisplay } from './components/tool-parts/McpAppDisplay';
export type { McpAppDisplayProps } from './components/tool-parts/McpAppDisplay';
export {
  resolveToolIcon,
  isTerminalTool,
  truncate,
  formatToolStatus,
} from './components/tool-parts/toolUtils';

// ═══════════════════════════════════════════
// MESSAGE LAYOUT COMPONENTS
// ═══════════════════════════════════════════
export { MessageHeader } from './components/messages/MessageHeader';
export type { MessageHeaderProps } from './components/messages/MessageHeader';
export { RequestRow } from './components/messages/RequestRow';
export type { RequestRowProps } from './components/messages/RequestRow';
export { ResponseRow } from './components/messages/ResponseRow';
export type { ResponseRowProps } from './components/messages/ResponseRow';
export { ResponseFooter } from './components/messages/ResponseFooter';
export type { ResponseFooterProps } from './components/messages/ResponseFooter';
export { AttachmentsRow } from './components/messages/AttachmentsRow';
export type { AttachmentsRowProps } from './components/messages/AttachmentsRow';
export { MessageList } from './components/messages/MessageList';
export type { MessageListProps } from './components/messages/MessageList';
