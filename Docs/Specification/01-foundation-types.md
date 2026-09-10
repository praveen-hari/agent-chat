# Phase 1: Foundation & Types

## Files

- `src/types/models.ts`
- `src/types/content-parts.ts`
- `src/types/events.ts`
- `src/types/config.ts`

---

## 1.1 `models.ts` — Core Data Models

### ChatSession

The top-level container representing a single conversation.

```typescript
export interface ChatSession {
  /** Unique session identifier */
  id: string;

  /** Ordered list of messages (alternating request/response pairs) */
  messages: ChatMessage[];

  /** Session creation timestamp (ms epoch) */
  createdAt: number;

  /** Optional session title (auto-generated or user-defined) */
  title?: string;

  /** Optional metadata bag for consumer use */
  metadata?: Record<string, unknown>;
}
```

### ChatMessage

A single message in the conversation. Discriminated union on `role`.

```typescript
export type ChatMessage = ChatRequest | ChatResponse;

export interface ChatRequest {
  role: 'user';

  /** Unique message ID */
  id: string;

  /** Unix timestamp (ms) when message was sent */
  timestamp: number;

  /** The user's text message */
  message: string;

  /** Parsed content parts (usually just markdown of the user's text) */
  content: ChatContentPart[];

  /** File/image/tool attachments the user included */
  attachments?: ChatAttachment[];

  /** Which AI model was selected for this request */
  modelId?: string;

  /** Chat mode: ask (read-only), agent (can edit), edit (focused edit) */
  mode?: ChatMode;

  /** Whether this request was system-initiated (not typed by user) */
  isSystemInitiated?: boolean;

  /** Where this request was delegated from (sub-agent, another tool) */
  origin?: ChatRequestOrigin;

  /** Attempt number (for retries) */
  attempt?: number;
}

export interface ChatResponse {
  role: 'assistant';

  /** Unique message ID */
  id: string;

  /** ID of the request this responds to */
  requestId: string;

  /** Unix timestamp (ms) when response started */
  timestamp: number;

  /** Unix timestamp (ms) when response completed */
  completedAt?: number;

  /** Current state of the response */
  state: ResponseState;

  /** The heterogeneous array of content parts (the core data) */
  content: ChatContentPart[];

  /** Which agent produced this response */
  agent?: ChatAgent;

  /** Follow-up suggestions shown after completion */
  followups?: ChatFollowup[];

  /** Error details if state is 'failed' */
  error?: ChatError;

  /** User's vote on this response */
  vote?: VoteDirection;

  /** Token usage statistics */
  usage?: ChatUsage;

  /** Elapsed time in milliseconds */
  elapsedMs?: number;

  /** Optional metadata */
  metadata?: Record<string, unknown>;
}
```

### Supporting Types

```typescript
export type ChatMode = 'ask' | 'agent' | 'edit';

export type ResponseState =
  | 'pending'        // Waiting to start
  | 'streaming'      // Actively receiving content
  | 'needs-input'    // Waiting for user action (confirmation, elicitation)
  | 'complete'       // Successfully finished
  | 'cancelled'      // User cancelled
  | 'failed';        // Error occurred

export type VoteDirection = 'up' | 'down' | 'none';

export interface ChatAgent {
  /** Unique agent identifier */
  id: string;

  /** Display name */
  name: string;

  /** Icon — emoji string, URL, or icon identifier */
  icon: string | { src: string } | { iconId: string };

  /** Optional description shown in header */
  description?: string;
}

export interface ChatFollowup {
  /** Unique identifier */
  id: string;

  /** Display label on the button */
  label: string;

  /** The message to send when clicked */
  message: string;

  /** Type of followup */
  type: 'reply' | 'command';

  /** Optional tooltip text */
  tooltip?: string;
}

export interface ChatError {
  /** Error message text */
  message: string;

  /** Error severity level */
  level: 'error' | 'warning' | 'info';

  /** Optional error code */
  code?: string;

  /** Whether the response is still partially useful */
  isPartial?: boolean;
}

export interface ChatUsage {
  /** Prompt/input tokens used */
  promptTokens: number;

  /** Completion/output tokens generated */
  completionTokens: number;

  /** Total tokens (may include overhead) */
  totalTokens?: number;

  /** Cost in credits or currency units */
  cost?: number;
}

export interface ChatRequestOrigin {
  /** Display label for the origin */
  label: string;

  /** Icon for the origin */
  icon?: string;

  /** Link/action to navigate to source */
  href?: string;
}
```

### Attachments

```typescript
export type ChatAttachment =
  | FileAttachment
  | ImageAttachment
  | TerminalAttachment
  | ToolSetAttachment
  | SelectionAttachment
  | CustomAttachment;

export interface FileAttachment {
  type: 'file';
  id: string;
  filename: string;
  uri: string;
  /** Optional line range */
  range?: { startLine: number; endLine: number };
  /** File size in bytes */
  size?: number;
}

export interface ImageAttachment {
  type: 'image';
  id: string;
  filename: string;
  /** Base64 data URI or URL */
  src: string;
  /** Alt text */
  alt?: string;
}

export interface TerminalAttachment {
  type: 'terminal';
  id: string;
  /** Terminal name/label */
  label: string;
  /** Command that was captured */
  command?: string;
}

export interface ToolSetAttachment {
  type: 'toolset';
  id: string;
  /** Tool/toolset display name */
  name: string;
  icon?: string;
}

export interface SelectionAttachment {
  type: 'selection';
  id: string;
  filename: string;
  uri: string;
  range: { startLine: number; endLine: number };
  /** The selected text */
  text: string;
}

export interface CustomAttachment {
  type: 'custom';
  id: string;
  label: string;
  icon?: string;
  /** Consumer-defined data */
  data?: unknown;
}
```

---

## 1.2 `content-parts.ts` — ChatContentPart Discriminated Union

The core of the rendering system. Every visual element in a response is a `ChatContentPart` discriminated on the `kind` field.

```typescript
/**
 * Discriminated union of all renderable content parts.
 * The `kind` field determines which React component renders it.
 */
export type ChatContentPart =
  // ═══════════════════════════════════════════
  // TEXT & MARKDOWN
  // ═══════════════════════════════════════════
  | MarkdownPart
  | CollapsibleMarkdownPart
  | CodeBlockPart
  | CodeCitationPart

  // ═══════════════════════════════════════════
  // THINKING & REASONING
  // ═══════════════════════════════════════════
  | ThinkingPart
  | SubAgentPart

  // ═══════════════════════════════════════════
  // TOOL INVOCATIONS
  // ═══════════════════════════════════════════
  | ToolCallPart
  | ToolConfirmationPart
  | ToolConfirmationCarouselPart
  | TerminalCommandPart

  // ═══════════════════════════════════════════
  // FILE CHANGES & DIFFS
  // ═══════════════════════════════════════════
  | EditPillPart
  | FileChangesSummaryPart
  | TurnPillsPart
  | InlineDiffPart
  | WorkspaceEditPart

  // ═══════════════════════════════════════════
  // PROGRESS & STATUS
  // ═══════════════════════════════════════════
  | ProgressPart
  | WorkingPart
  | AutoModeResolutionPart
  | McpServersStartingPart

  // ═══════════════════════════════════════════
  // PLAN & TODO
  // ═══════════════════════════════════════════
  | PlanReviewPart
  | TodoListPart

  // ═══════════════════════════════════════════
  // USER INPUT / INTERACTIVE
  // ═══════════════════════════════════════════
  | ConfirmationPart
  | ElicitationPart
  | QuestionCarouselPart

  // ═══════════════════════════════════════════
  // REFERENCES & LINKS
  // ═══════════════════════════════════════════
  | ReferencesPart
  | InlineReferencePart
  | FileTreePart

  // ═══════════════════════════════════════════
  // NOTIFICATIONS & ALERTS
  // ═══════════════════════════════════════════
  | ErrorPart
  | SystemNotificationPart
  | WorkspaceTransitionPart
  | HookResultPart
  | TipPart
  | QuotaExceededPart
  | RateLimitedPart

  // ═══════════════════════════════════════════
  // RICH CONTENT
  // ═══════════════════════════════════════════
  | PullRequestPart
  | ExtensionsPart
  | McpAuthRequiredPart
  | ImagePart

  // ═══════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════
  | CommandButtonPart
  | SuggestNextPart
  | FollowupPart;
```

### Part Definitions — Text & Markdown

```typescript
export interface MarkdownPart {
  kind: 'markdown';
  /** Raw markdown string */
  content: string;
  /** Optional: vulnerability annotations for code within markdown */
  vulnerabilities?: Vulnerability[];
}

export interface CollapsibleMarkdownPart {
  kind: 'collapsible-markdown';
  /** Collapse header title */
  title: string;
  /** Markdown body content */
  content: string;
  /** Whether expanded by default */
  defaultExpanded?: boolean;
}

export interface CodeBlockPart {
  kind: 'code';
  /** The code text */
  code: string;
  /** Language identifier for syntax highlighting */
  language: string;
  /** Optional filename (shown in header) */
  filename?: string;
  /** Optional URI for "open file" action */
  uri?: string;
  /** Vulnerability warnings */
  vulnerabilities?: Vulnerability[];
}

export interface CodeCitationPart {
  kind: 'code-citation';
  /** The cited code */
  code: string;
  /** License name (e.g., "MIT", "Apache-2.0") */
  license: string;
  /** URL to the source */
  url?: string;
}

export interface Vulnerability {
  /** Line range affected */
  startLine: number;
  endLine: number;
  /** Severity */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** Description */
  message: string;
}
```

### Part Definitions — Thinking & Reasoning

```typescript
export interface ThinkingPart {
  kind: 'thinking';
  /** Reasoning text (may contain markdown with **bold** section headers) */
  content: string;
  /** Whether the model is still thinking */
  isStreaming: boolean;
  /** Optional explicit title (otherwise extracted from first **bold** line) */
  title?: string;
  /** Tool calls that happened during thinking */
  nestedToolCalls?: NestedToolCallItem[];
  /** Edit pills grouped inside this thinking block */
  nestedEditPills?: NestedEditPillItem[];
  /** Aggregate diff stats across all edits in this block */
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
  /** Sub-agent display name */
  agentName: string;
  /** Description/prompt summary (truncated) */
  description: string;
  /** Current status */
  status: 'running' | 'complete' | 'failed';
  /** Nested content parts (lazy-rendered on expand) */
  children?: ChatContentPart[];
  /** Model used by the sub-agent */
  modelName?: string;
  /** Credits consumed */
  credits?: number;
  /** Whether to auto-expand (e.g., when tools need confirmation) */
  autoExpand?: boolean;
}
```

### Part Definitions — Tool Invocations

```typescript
export type ToolCallStatus =
  | 'streaming'    // Arguments being generated
  | 'confirming'   // Waiting for user approval
  | 'running'      // Executing
  | 'complete'     // Finished successfully
  | 'failed'       // Error occurred
  | 'cancelled';   // User denied or cancelled

export interface ToolCallPart {
  kind: 'tool-call';
  /** Tool identifier */
  toolId: string;
  /** Unique invocation ID */
  toolCallId: string;
  /** Current status */
  status: ToolCallStatus;
  /** Tool display name (if different from toolId) */
  label?: string;
  /** Icon identifier */
  icon?: string;
  /** Tool input/arguments (JSON or string) */
  input?: unknown;
  /** Tool output/result */
  output?: string;
  /** Progress message while running */
  progressMessage?: string;
  /** Risk assessment level */
  riskLevel?: RiskLevel;
  /** Whether this tool has custom output rendering */
  hasCustomOutput?: boolean;
  /** MCP app webview data */
  mcpApp?: { html: string; resources?: McpResource[] };
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'assessing';

export interface ToolConfirmationPart {
  kind: 'tool-confirmation';
  /** Tool identifier */
  toolId: string;
  /** Unique invocation ID */
  toolCallId: string;
  /** Confirmation dialog title */
  title: string;
  /** Detailed message (may contain markdown) */
  message: string;
  /** Tool input to display */
  input?: string;
  /** Risk level */
  riskLevel?: RiskLevel;
  /** Subtitle (e.g., origin info) */
  subtitle?: string;
  /** Available actions */
  actions: ToolConfirmationAction[];
}

export interface ToolConfirmationAction {
  /** Action identifier */
  id: string;
  /** Button label */
  label: string;
  /** Whether this is the primary (highlighted) action */
  primary?: boolean;
  /** Keyboard shortcut hint */
  keybinding?: string;
  /** Sub-actions in dropdown */
  children?: ToolConfirmationAction[];
}

export interface ToolConfirmationCarouselPart {
  kind: 'tool-confirmation-carousel';
  /** Array of tool confirmations to navigate through */
  tools: ToolConfirmationPart[];
  /** Currently displayed index */
  currentIndex: number;
}

export interface TerminalCommandPart {
  kind: 'terminal-command';
  /** The shell command */
  command: string;
  /** Terminal output text */
  output: string;
  /** Process exit code (null if still running) */
  exitCode: number | null;
  /** Whether the command is still executing */
  isRunning: boolean;
  /** Number of visible output rows (1-10) */
  visibleRows?: number;
  /** Working directory */
  cwd?: string;
}

export interface McpResource {
  name: string;
  uri: string;
  mimeType?: string;
}
```

### Part Definitions — File Changes & Diffs

```typescript
export interface EditPillPart {
  kind: 'edit-pill';
  /** Filename (basename shown in pill) */
  filename: string;
  /** Full URI for navigation */
  uri?: string;
  /** Type of change */
  status: 'created' | 'modified' | 'deleted' | 'renamed';
  /** Lines added count */
  linesAdded: number;
  /** Lines removed count */
  linesRemoved: number;
  /** Progress percentage (0-100) for streaming edits */
  progress?: number;
  /** New filename (for renames) */
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
  /** List of changed files */
  files: FileChangeEntry[];
  /** Aggregate lines added */
  totalAdded: number;
  /** Aggregate lines removed */
  totalRemoved: number;
  /** Whether expanded by default */
  defaultExpanded?: boolean;
}

export interface TurnPillsPart {
  kind: 'turn-pills';
  /** Summary label (e.g., "5 files changed") */
  label: string;
  /** Per-file changes */
  files: FileChangeEntry[];
  /** Aggregate stats */
  totalAdded: number;
  totalRemoved: number;
}

export interface InlineDiffPart {
  kind: 'inline-diff';
  /** Filename for the diff */
  filename: string;
  /** Original code */
  originalCode: string;
  /** Modified code */
  modifiedCode: string;
  /** Language for syntax highlighting */
  language: string;
}

export interface WorkspaceEditPart {
  kind: 'workspace-edit';
  /** File operations performed */
  operations: WorkspaceEditOperation[];
}

export interface WorkspaceEditOperation {
  type: 'created' | 'deleted' | 'renamed';
  filename: string;
  uri?: string;
  newFilename?: string;
}
```

### Part Definitions — Progress & Status

```typescript
export interface ProgressPart {
  kind: 'progress';
  /** Progress message text (may contain markdown) */
  message: string;
  /** Whether this step is currently active */
  isActive: boolean;
  /** Custom icon identifier (default: spinner when active, checkmark when done) */
  icon?: string;
  /** Whether to show shimmer animation */
  shimmer?: boolean;
  /** Which portion to shimmer: 'full' or 'partial' (only verb) */
  shimmerMode?: 'full' | 'partial';
}

export interface WorkingPart {
  kind: 'working';
  /** Optional message (default: animated dots) */
  message?: string;
}

export interface AutoModeResolutionPart {
  kind: 'auto-mode-resolution';
  /** The model that was selected */
  modelName: string;
  /** Whether still resolving */
  isResolving: boolean;
}

export interface McpServersStartingPart {
  kind: 'mcp-servers-starting';
  /** Server names that are starting */
  servers: string[];
}
```

### Part Definitions — Plan & Todo

```typescript
export interface PlanReviewPart {
  kind: 'plan-review';
  /** Plan title */
  title: string;
  /** Plan content (markdown) */
  content: string;
  /** Whether the plan is outdated (stale) */
  isOutdated: boolean;
  /** Review status */
  status: 'pending' | 'approved' | 'rejected';
  /** Inline comments/feedback */
  comments?: PlanComment[];
}

export interface PlanComment {
  id: string;
  /** Line number the comment refers to */
  line: number;
  /** Comment text */
  text: string;
  /** Who left the comment */
  author: string;
}

export type TodoItemStatus = 'not-started' | 'in-progress' | 'completed';

export interface TodoItem {
  /** Unique numeric ID */
  id: number;
  /** Task title */
  title: string;
  /** Current status */
  status: TodoItemStatus;
}

export interface TodoListPart {
  kind: 'todo-list';
  /** The todo items */
  items: TodoItem[];
}
```

### Part Definitions — User Input / Interactive

```typescript
export interface ConfirmationPart {
  kind: 'confirmation';
  /** Dialog title */
  title: string;
  /** Message body (may contain markdown) */
  message: string;
  /** Subtitle text */
  subtitle?: string;
  /** Available action buttons */
  buttons: ActionButton[];
}

export interface ElicitationPart {
  kind: 'elicitation';
  /** Dialog title */
  title: string;
  /** Message body */
  message: string;
  /** Available actions */
  actions: ActionButton[];
  /** Whether this elicitation has been answered */
  isResolved?: boolean;
  /** The accepted result (shown after resolution) */
  result?: string;
}

export interface ActionButton {
  /** Unique action identifier */
  id: string;
  /** Button label */
  label: string;
  /** Whether this is the primary action */
  primary?: boolean;
  /** Keyboard shortcut hint text */
  keybinding?: string;
}

export interface QuestionCarouselPart {
  kind: 'question-carousel';
  /** Array of questions */
  questions: CarouselQuestion[];
  /** Current question index (0-based) */
  currentStep: number;
  /** Whether the carousel has been submitted */
  isSubmitted?: boolean;
  /** Answers (after submission) */
  answers?: Record<number, string | string[]>;
}

export interface CarouselQuestion {
  /** Question type determines input widget */
  type: 'text' | 'single-select' | 'multi-select' | 'freeform';
  /** Question label */
  label: string;
  /** Available options (for select types) */
  options?: string[];
  /** Whether an answer is required */
  required?: boolean;
  /** Placeholder text */
  placeholder?: string;
}
```

### Part Definitions — References & Links

```typescript
export interface FileReference {
  /** Display label */
  label: string;
  /** URI to the file/resource */
  uri: string;
  /** Icon identifier */
  icon?: string;
  /** Line range within the file */
  range?: { startLine: number; endLine: number };
  /** Status of the reference */
  status?: 'complete' | 'partial' | 'omitted';
}

export interface ReferencesPart {
  kind: 'references';
  /** Title for the collapsible header (e.g., "Used 5 references") */
  title?: string;
  /** List of file/resource references */
  references: FileReference[];
}

export interface InlineReferencePart {
  kind: 'inline-reference';
  /** Display text */
  text: string;
  /** URI to navigate to */
  uri: string;
  /** Line range */
  range?: { startLine: number; endLine: number };
}

export interface TreeNode {
  /** Node label */
  label: string;
  /** URI (for files) */
  uri?: string;
  /** Whether this is a directory */
  isDirectory: boolean;
  /** Child nodes */
  children?: TreeNode[];
}

export interface FileTreePart {
  kind: 'file-tree';
  /** Root node of the tree */
  root: TreeNode;
}
```

### Part Definitions — Notifications & Alerts

```typescript
export interface ErrorPart {
  kind: 'error';
  /** Error message */
  message: string;
  /** Severity level */
  level: 'error' | 'warning' | 'info';
}

export interface SystemNotificationPart {
  kind: 'system-notification';
  /** Notification message (may contain markdown) */
  message: string;
  /** Icon identifier */
  icon?: string;
  /** Display style */
  style: 'standard' | 'separator' | 'collapsible';
  /** Collapsible detail body (for 'collapsible' style) */
  detail?: string;
  /** Timing info (e.g., elapsed time) */
  timing?: string;
}

export interface WorkspaceTransitionPart {
  kind: 'workspace-transition';
  /** Workspace display name */
  workspaceName: string;
  /** Workspace icon */
  icon?: string;
}

export interface HookResultPart {
  kind: 'hook-result';
  /** Hook type identifier */
  hookType: string;
  /** Tool that triggered the hook */
  toolName: string;
  /** Outcome */
  outcome: 'blocked' | 'warning';
  /** Reason for blocking/warning */
  reason?: string;
  /** System message from the hook */
  message?: string;
}

export interface TipPart {
  kind: 'tip';
  /** Tip message text */
  message: string;
  /** Whether the user can dismiss */
  dismissible: boolean;
}

export interface QuotaExceededPart {
  kind: 'quota-exceeded';
  /** Message to display */
  message: string;
  /** URL to manage budget */
  upgradeUrl?: string;
  /** Button label override */
  actionLabel?: string;
}

export interface RateLimitedPart {
  kind: 'rate-limited';
  /** Message to display */
  message: string;
  /** Sign-in URL */
  signInUrl?: string;
}
```

### Part Definitions — Rich Content

```typescript
export interface PullRequestPart {
  kind: 'pull-request';
  /** PR title */
  title: string;
  /** PR author */
  author: string;
  /** PR URL */
  url: string;
  /** PR state */
  state?: 'open' | 'merged' | 'closed';
}

export interface ExtensionsPart {
  kind: 'extensions';
  /** Suggested extensions */
  extensions: ExtensionItem[];
  /** Whether still loading */
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
  /** Servers requiring authentication */
  servers: Array<{
    name: string;
    authUrl: string;
    isAuthenticating?: boolean;
  }>;
}

export interface ImagePart {
  kind: 'image';
  /** Image source URL or data URI */
  src: string;
  /** Alt text */
  alt?: string;
  /** Optional dimensions */
  width?: number;
  height?: number;
}
```

### Part Definitions — Actions

```typescript
export interface CommandButtonPart {
  kind: 'command';
  /** Button label */
  label: string;
  /** Command identifier (consumer handles execution) */
  commandId: string;
  /** Command arguments */
  args?: unknown[];
}

export interface SuggestNextPart {
  kind: 'suggest-next';
  /** Suggested next prompts */
  suggestions: Array<{
    label: string;
    message: string;
    icon?: string;
  }>;
}

export interface FollowupPart {
  kind: 'followup';
  /** Followup label */
  label: string;
  /** Message to send */
  message: string;
  /** Followup type */
  type: 'reply' | 'command';
}
```

---

## 1.3 `events.ts` — Callback Interfaces

All user interactions are communicated via callbacks. The library never makes network calls.

```typescript
/**
 * All callback handlers that consumers provide to <ChatProvider>.
 * Every callback is optional — the library gracefully degrades
 * when a handler is missing (e.g., vote buttons hidden if no onVote).
 */
export interface ChatCallbacks {
  // ─── Message Flow ───
  /** User sends a new message */
  onSendMessage?: (
    message: string,
    attachments?: ChatAttachment[],
    options?: SendMessageOptions
  ) => void | Promise<void>;

  /** User cancels an in-progress response */
  onCancelResponse?: (responseId: string) => void;

  /** User retries a failed/cancelled response */
  onRetryResponse?: (responseId: string) => void;

  /** User edits a previous request */
  onEditRequest?: (requestId: string, newMessage: string) => void;

  /** User deletes a request (and its response) */
  onDeleteRequest?: (requestId: string) => void;

  // ─── Tool Actions ───
  /** User approves/denies a tool confirmation */
  onToolAction?: (
    toolCallId: string,
    actionId: string,
    toolId: string
  ) => void;

  /** User responds to an elicitation */
  onElicitationAction?: (
    partId: string,
    actionId: string,
    data?: unknown
  ) => void;

  /** User approves/rejects a plan */
  onPlanAction?: (
    planId: string,
    action: 'approve' | 'reject',
    feedback?: string
  ) => void;

  // ─── Question Carousel ───
  /** User submits answers to a question carousel */
  onQuestionSubmit?: (
    answers: Record<number, string | string[]>
  ) => void;

  /** User navigates carousel step */
  onQuestionNavigate?: (step: number) => void;

  /** User skips remaining questions */
  onQuestionSkip?: () => void;

  // ─── Feedback ───
  /** User votes on a response */
  onVote?: (
    responseId: string,
    direction: VoteDirection
  ) => void;

  // ─── Followups & Actions ───
  /** User clicks a followup suggestion */
  onFollowupClick?: (followup: ChatFollowup) => void;

  /** User clicks a command button */
  onCommandClick?: (commandId: string, args?: unknown[]) => void;

  /** User clicks an inline file/symbol reference */
  onReferenceClick?: (uri: string, range?: { startLine: number; endLine: number }) => void;

  /** User clicks "open file" on an edit pill or code block */
  onFileOpen?: (uri: string) => void;

  /** User clicks "apply" on a code block */
  onCodeApply?: (code: string, language: string, filename?: string) => void;

  /** User clicks "copy" on a code block */
  onCodeCopy?: (code: string) => void;

  // ─── Attachments ───
  /** User adds an attachment */
  onAttachmentAdd?: (attachment: ChatAttachment) => void;

  /** User removes an attachment */
  onAttachmentRemove?: (attachmentId: string) => void;

  // ─── Terminal ───
  /** User clicks "focus terminal" */
  onTerminalFocus?: (command: string) => void;

  /** User clicks "continue in background" */
  onTerminalBackground?: (command: string) => void;

  // ─── External Actions ───
  /** User clicks a PR card */
  onPullRequestClick?: (url: string) => void;

  /** User clicks "upgrade" on quota exceeded */
  onUpgradeClick?: (url: string) => void;

  /** User clicks "sign in" on rate limited */
  onSignInClick?: (url: string) => void;

  /** User dismisses a tip */
  onTipDismiss?: (message: string) => void;

  /** User clicks "open sub-agent" */
  onSubAgentOpen?: (agentName: string) => void;

  /** User clicks a suggest-next prompt */
  onSuggestNextClick?: (message: string) => void;
}

export interface SendMessageOptions {
  /** Override the chat mode for this message */
  mode?: ChatMode;
  /** Override the model for this message */
  modelId?: string;
}
```

---

## 1.4 `config.ts` — Configuration Options

```typescript
/**
 * Configuration options for <AgentChat> component.
 * Controls layout, features, and behavior.
 */
export interface AgentChatConfig {
  // ─── Layout ───
  /** Maximum width of the chat container (default: 950) */
  maxWidth?: number;

  /** Whether to show the welcome screen when empty (default: true) */
  showWelcome?: boolean;

  /** Welcome screen title */
  welcomeTitle?: string;

  /** Welcome screen suggestions */
  welcomeSuggestions?: Array<{ label: string; message: string }>;

  // ─── Input ───
  /** Placeholder text for the input area */
  placeholder?: string;

  /** Maximum input height in pixels (default: 250) */
  maxInputHeight?: number;

  /** Whether to show the mode picker (default: true) */
  showModePicker?: boolean;

  /** Whether to show the model picker (default: true) */
  showModelPicker?: boolean;

  /** Available chat modes */
  availableModes?: ChatMode[];

  /** Available model options */
  availableModels?: ModelOption[];

  /** Whether to enable file attachment (default: true) */
  enableAttachments?: boolean;

  // ─── Rendering ───
  /** Whether to enable streaming word animation (default: true) */
  enableStreamingAnimation?: boolean;

  /** Words per second for progressive rendering (default: 80) */
  streamingWordsPerSecond?: number;

  /** Whether to enable syntax highlighting in code blocks (default: true) */
  enableSyntaxHighlighting?: boolean;

  /** Whether to enable KaTeX math rendering (default: true) */
  enableMath?: boolean;

  /** Whether to virtualize the message list (default: true for >50 messages) */
  enableVirtualization?: boolean;

  // ─── Features ───
  /** Whether to show vote buttons (requires onVote callback) */
  showVoteButtons?: boolean;

  /** Whether to show copy button on responses */
  showCopyButton?: boolean;

  /** Whether to show response timing details */
  showResponseDetails?: boolean;

  /** Whether to show token usage */
  showTokenUsage?: boolean;

  /** Whether to show the dockable todo list widget */
  showTodoList?: boolean;

  // ─── Accessibility ───
  /** Accessible label for the chat widget */
  ariaLabel?: string;

  /** Whether to announce new messages to screen readers */
  announceMessages?: boolean;

  // ─── Customization ───
  /** Custom content part renderer overrides */
  contentPartOverrides?: Partial<ContentPartRendererMap>;

  /** Custom attachment renderer overrides */
  attachmentOverrides?: Partial<AttachmentRendererMap>;
}

export interface ModelOption {
  id: string;
  label: string;
  description?: string;
  icon?: string;
}

/**
 * Allows consumers to override how specific content parts are rendered.
 * Map from content part kind to a React component.
 */
export type ContentPartRendererMap = {
  [K in ChatContentPart['kind']]: React.ComponentType<
    Extract<ChatContentPart, { kind: K }>
  >;
};

/**
 * Allows consumers to override how specific attachment types are rendered.
 */
export type AttachmentRendererMap = {
  [K in ChatAttachment['type']]: React.ComponentType<
    Extract<ChatAttachment, { type: K }>
  >;
};
```

---

## Implementation Notes

1. **All types are `export`ed** — consumers need them to build adapters
2. **No enums** — use string literal unions for tree-shaking and JSON compatibility
3. **Optional fields use `?`** — graceful degradation when data is incomplete
4. **`ChatContentPart` is the core contract** — this union drives the entire rendering system
5. **Callbacks are all optional** — missing handlers cause features to gracefully hide
6. **`ContentPartRendererMap` enables extension** — consumers can override any content part renderer
