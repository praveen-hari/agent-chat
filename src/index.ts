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
