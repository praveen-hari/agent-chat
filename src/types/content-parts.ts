/**
 * ChatContentPart — Discriminated union of all renderable content parts.
 * The `kind` field determines which React component renders each part.
 *
 * @module types/content-parts
 */

// ═══════════════════════════════════════════
// MAIN UNION TYPE
// ═══════════════════════════════════════════

export type ChatContentPart =
  // Text & Markdown
  | MarkdownPart
  | CollapsibleMarkdownPart
  | CodeBlockPart
  | CodeCitationPart
  // Thinking & Reasoning
  | ThinkingPart
  | SubAgentPart
  // Tool Invocations
  | ToolCallPart
  | ToolConfirmationPart
  | ToolConfirmationCarouselPart
  | TerminalCommandPart
  // File Changes & Diffs
  | EditPillPart
  | FileChangesSummaryPart
  | TurnPillsPart
  | InlineDiffPart
  | WorkspaceEditPart
  // Progress & Status
  | ProgressPart
  | WorkingPart
  | AutoModeResolutionPart
  | McpServersStartingPart
  // Plan & Todo
  | PlanReviewPart
  | TodoListPart
  // User Input / Interactive
  | ConfirmationPart
  | ElicitationPart
  | QuestionCarouselPart
  // References & Links
  | ReferencesPart
  | InlineReferencePart
  | FileTreePart
  // Notifications & Alerts
  | ErrorPart
  | SystemNotificationPart
  | WorkspaceTransitionPart
  | HookResultPart
  | TipPart
  | QuotaExceededPart
  | RateLimitedPart
  // Rich Content
  | PullRequestPart
  | ExtensionsPart
  | McpAuthRequiredPart
  | ImagePart
  // Actions
  | CommandButtonPart
  | SuggestNextPart
  | FollowupPart;

// ═══════════════════════════════════════════
// TEXT & MARKDOWN
// ═══════════════════════════════════════════

export interface MarkdownPart {
  kind: 'markdown';
  content: string;
  vulnerabilities?: Vulnerability[];
}

export interface CollapsibleMarkdownPart {
  kind: 'collapsible-markdown';
  title: string;
  content: string;
  defaultExpanded?: boolean;
}

export interface CodeBlockPart {
  kind: 'code';
  code: string;
  language: string;
  filename?: string;
  uri?: string;
  vulnerabilities?: Vulnerability[];
}

export interface CodeCitationPart {
  kind: 'code-citation';
  code: string;
  license: string;
  url?: string;
}

export interface Vulnerability {
  startLine: number;
  endLine: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
}

// ═══════════════════════════════════════════
// THINKING & REASONING
// ═══════════════════════════════════════════

export interface ThinkingPart {
  kind: 'thinking';
  content: string;
  isStreaming: boolean;
  title?: string;
  nestedToolCalls?: NestedToolCallItem[];
  nestedEditPills?: NestedEditPillItem[];
  aggregateDiff?: { added: number; removed: number };
}

export interface NestedToolCallItem {
  id: string;
  toolId: string;
  label: string;
  icon?: string;
  status: 'running' | 'complete' | 'failed';
}

export interface NestedEditPillItem {
  filename: string;
  status: 'created' | 'modified' | 'deleted' | 'renamed';
  linesAdded: number;
  linesRemoved: number;
}

export interface SubAgentPart {
  kind: 'sub-agent';
  agentName: string;
  description: string;
  status: 'running' | 'complete' | 'failed';
  children?: ChatContentPart[];
  modelName?: string;
  credits?: number;
  autoExpand?: boolean;
}

// ═══════════════════════════════════════════
// TOOL INVOCATIONS
// ═══════════════════════════════════════════

export type ToolCallStatus =
  'streaming' | 'confirming' | 'running' | 'complete' | 'failed' | 'cancelled';

export type RiskLevel = 'low' | 'medium' | 'high' | 'assessing';

export interface ToolCallPart {
  kind: 'tool-call';
  toolId: string;
  toolCallId: string;
  status: ToolCallStatus;
  label?: string;
  icon?: string;
  input?: unknown;
  output?: string;
  progressMessage?: string;
  riskLevel?: RiskLevel;
  hasCustomOutput?: boolean;
  mcpApp?: { html: string; resources?: McpResource[] };
}

export interface McpResource {
  name: string;
  uri: string;
  mimeType?: string;
}

export interface ToolConfirmationPart {
  kind: 'tool-confirmation';
  toolId: string;
  toolCallId: string;
  title: string;
  message: string;
  input?: string;
  riskLevel?: RiskLevel;
  subtitle?: string;
  actions: ToolConfirmationAction[];
}

export interface ToolConfirmationAction {
  id: string;
  label: string;
  primary?: boolean;
  keybinding?: string;
  children?: ToolConfirmationAction[];
}

export interface ToolConfirmationCarouselPart {
  kind: 'tool-confirmation-carousel';
  tools: ToolConfirmationPart[];
  currentIndex: number;
}

export interface TerminalCommandPart {
  kind: 'terminal-command';
  command: string;
  output: string;
  exitCode: number | null;
  isRunning: boolean;
  visibleRows?: number;
  cwd?: string;
}

// ═══════════════════════════════════════════
// FILE CHANGES & DIFFS
// ═══════════════════════════════════════════

export interface EditPillPart {
  kind: 'edit-pill';
  filename: string;
  uri?: string;
  status: 'created' | 'modified' | 'deleted' | 'renamed';
  linesAdded: number;
  linesRemoved: number;
  progress?: number;
  newFilename?: string;
}

export interface FileChangeEntry {
  filename: string;
  uri?: string;
  status: 'created' | 'modified' | 'deleted' | 'renamed';
  linesAdded: number;
  linesRemoved: number;
}

export interface FileChangesSummaryPart {
  kind: 'file-changes-summary';
  files: FileChangeEntry[];
  totalAdded: number;
  totalRemoved: number;
  defaultExpanded?: boolean;
}

export interface TurnPillsPart {
  kind: 'turn-pills';
  label: string;
  files: FileChangeEntry[];
  totalAdded: number;
  totalRemoved: number;
}

export interface InlineDiffPart {
  kind: 'inline-diff';
  filename: string;
  originalCode: string;
  modifiedCode: string;
  language: string;
}

export interface WorkspaceEditPart {
  kind: 'workspace-edit';
  operations: WorkspaceEditOperation[];
}

export interface WorkspaceEditOperation {
  type: 'created' | 'deleted' | 'renamed';
  filename: string;
  uri?: string;
  newFilename?: string;
}

// ═══════════════════════════════════════════
// PROGRESS & STATUS
// ═══════════════════════════════════════════

export interface ProgressPart {
  kind: 'progress';
  message: string;
  isActive: boolean;
  icon?: string;
  shimmer?: boolean;
  shimmerMode?: 'full' | 'partial';
}

export interface WorkingPart {
  kind: 'working';
  message?: string;
}

export interface AutoModeResolutionPart {
  kind: 'auto-mode-resolution';
  modelName: string;
  isResolving: boolean;
}

export interface McpServersStartingPart {
  kind: 'mcp-servers-starting';
  servers: string[];
}

// ═══════════════════════════════════════════
// PLAN & TODO
// ═══════════════════════════════════════════

export interface PlanReviewPart {
  kind: 'plan-review';
  title: string;
  content: string;
  isOutdated: boolean;
  status: 'pending' | 'approved' | 'rejected';
  comments?: PlanComment[];
}

export interface PlanComment {
  id: string;
  line: number;
  text: string;
  author: string;
}

export type TodoItemStatus = 'not-started' | 'in-progress' | 'completed';

export interface TodoItem {
  id: number;
  title: string;
  status: TodoItemStatus;
}

export interface TodoListPart {
  kind: 'todo-list';
  items: TodoItem[];
}

// ═══════════════════════════════════════════
// USER INPUT / INTERACTIVE
// ═══════════════════════════════════════════

export interface ActionButton {
  id: string;
  label: string;
  primary?: boolean;
  keybinding?: string;
}

export interface ConfirmationPart {
  kind: 'confirmation';
  title: string;
  message: string;
  subtitle?: string;
  buttons: ActionButton[];
}

export interface ElicitationPart {
  kind: 'elicitation';
  title: string;
  message: string;
  actions: ActionButton[];
  isResolved?: boolean;
  result?: string;
}

export interface QuestionCarouselPart {
  kind: 'question-carousel';
  questions: CarouselQuestion[];
  currentStep: number;
  isSubmitted?: boolean;
  answers?: Record<number, string | string[]>;
}

export interface CarouselQuestion {
  type: 'text' | 'single-select' | 'multi-select' | 'freeform';
  label: string;
  options?: string[];
  required?: boolean;
  placeholder?: string;
}

// ═══════════════════════════════════════════
// REFERENCES & LINKS
// ═══════════════════════════════════════════

export interface FileReference {
  label: string;
  uri: string;
  icon?: string;
  range?: { startLine: number; endLine: number };
  status?: 'complete' | 'partial' | 'omitted';
}

export interface ReferencesPart {
  kind: 'references';
  title?: string;
  references: FileReference[];
}

export interface InlineReferencePart {
  kind: 'inline-reference';
  text: string;
  uri: string;
  range?: { startLine: number; endLine: number };
}

export interface TreeNode {
  label: string;
  uri?: string;
  isDirectory: boolean;
  children?: TreeNode[];
}

export interface FileTreePart {
  kind: 'file-tree';
  root: TreeNode;
}

// ═══════════════════════════════════════════
// NOTIFICATIONS & ALERTS
// ═══════════════════════════════════════════

export interface ErrorPart {
  kind: 'error';
  message: string;
  level: 'error' | 'warning' | 'info';
}

export interface SystemNotificationPart {
  kind: 'system-notification';
  message: string;
  icon?: string;
  style: 'standard' | 'separator' | 'collapsible';
  detail?: string;
  timing?: string;
}

export interface WorkspaceTransitionPart {
  kind: 'workspace-transition';
  workspaceName: string;
  icon?: string;
}

export interface HookResultPart {
  kind: 'hook-result';
  hookType: string;
  toolName: string;
  outcome: 'blocked' | 'warning';
  reason?: string;
  message?: string;
}

export interface TipPart {
  kind: 'tip';
  message: string;
  dismissible: boolean;
}

export interface QuotaExceededPart {
  kind: 'quota-exceeded';
  message: string;
  upgradeUrl?: string;
  actionLabel?: string;
}

export interface RateLimitedPart {
  kind: 'rate-limited';
  message: string;
  signInUrl?: string;
}

// ═══════════════════════════════════════════
// RICH CONTENT
// ═══════════════════════════════════════════

export interface PullRequestPart {
  kind: 'pull-request';
  title: string;
  author: string;
  url: string;
  state?: 'open' | 'merged' | 'closed';
}

export interface ExtensionsPart {
  kind: 'extensions';
  extensions: ExtensionItem[];
  isLoading?: boolean;
}

export interface ExtensionItem {
  id: string;
  name: string;
  publisher: string;
  icon?: string;
  description?: string;
  installUrl?: string;
}

export interface McpAuthRequiredPart {
  kind: 'mcp-auth-required';
  servers: Array<{
    name: string;
    authUrl: string;
    isAuthenticating?: boolean;
  }>;
}

export interface ImagePart {
  kind: 'image';
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

// ═══════════════════════════════════════════
// ACTIONS
// ═══════════════════════════════════════════

export interface CommandButtonPart {
  kind: 'command';
  label: string;
  commandId: string;
  args?: unknown[];
}

export interface SuggestNextPart {
  kind: 'suggest-next';
  suggestions: Array<{
    label: string;
    message: string;
    icon?: string;
  }>;
}

export interface FollowupPart {
  kind: 'followup';
  label: string;
  message: string;
  type: 'reply' | 'command';
}
