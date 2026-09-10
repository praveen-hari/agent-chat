/**
 * Core data models for the chat session.
 * These types are the foundation — every component depends on them.
 *
 * @module types/models
 */

// ═══════════════════════════════════════════
// SESSION
// ═══════════════════════════════════════════

/** Top-level container representing a single conversation. */
export interface ChatSession {
  /** Unique session identifier */
  id: string;
  /** Ordered list of messages (alternating request/response pairs) */
  messages: ChatMessage[];
  /** Session creation timestamp (ms epoch) */
  createdAt: number;
  /** Optional session title */
  title?: string;
  /** Optional metadata bag for consumer use */
  metadata?: Record<string, unknown>;
}

// ═══════════════════════════════════════════
// MESSAGES
// ═══════════════════════════════════════════

/** A single message — either a user request or an assistant response. */
export type ChatMessage = ChatRequest | ChatResponse;

/** Chat mode: ask (read-only), agent (can edit), edit (focused edit) */
export type ChatMode = 'ask' | 'agent' | 'edit';

/** Response lifecycle state */
export type ResponseState =
  'pending' | 'streaming' | 'needs-input' | 'complete' | 'cancelled' | 'failed';

/** User vote direction on a response */
export type VoteDirection = 'up' | 'down' | 'none';

// ─── Imports for content parts (circular-safe via type-only) ───
import type { ChatContentPart } from './content-parts';

/** A user message */
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
  /** Chat mode */
  mode?: ChatMode;
  /** Whether this request was system-initiated (not typed by user) */
  isSystemInitiated?: boolean;
  /** Where this request was delegated from */
  origin?: ChatRequestOrigin;
  /** Attempt number (for retries) */
  attempt?: number;
}

/** An assistant response */
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
  /** The heterogeneous array of content parts */
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

// ═══════════════════════════════════════════
// AGENT
// ═══════════════════════════════════════════

/** An AI agent that can respond to messages */
export interface ChatAgent {
  /** Unique agent identifier */
  id: string;
  /** Display name */
  name: string;
  /** Icon — emoji string, URL, or icon identifier */
  icon: string | { src: string } | { iconId: string };
  /** Optional description */
  description?: string;
}

// ═══════════════════════════════════════════
// FOLLOWUP
// ═══════════════════════════════════════════

/** A follow-up suggestion shown after a response completes */
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

// ═══════════════════════════════════════════
// ERROR & USAGE
// ═══════════════════════════════════════════

/** Error details for a failed response */
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

/** Token usage statistics */
export interface ChatUsage {
  /** Prompt/input tokens used */
  promptTokens: number;
  /** Completion/output tokens generated */
  completionTokens: number;
  /** Total tokens */
  totalTokens?: number;
  /** Cost in credits or currency units */
  cost?: number;
}

/** Where a delegated request originated from */
export interface ChatRequestOrigin {
  /** Display label */
  label: string;
  /** Icon for the origin */
  icon?: string;
  /** Link/action to navigate to source */
  href?: string;
}

// ═══════════════════════════════════════════
// ATTACHMENTS
// ═══════════════════════════════════════════

/** Union of all attachment types */
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
  range?: { startLine: number; endLine: number };
  size?: number;
}

export interface ImageAttachment {
  type: 'image';
  id: string;
  filename: string;
  /** Base64 data URI or URL */
  src: string;
  alt?: string;
}

export interface TerminalAttachment {
  type: 'terminal';
  id: string;
  label: string;
  command?: string;
}

export interface ToolSetAttachment {
  type: 'toolset';
  id: string;
  name: string;
  icon?: string;
}

export interface SelectionAttachment {
  type: 'selection';
  id: string;
  filename: string;
  uri: string;
  range: { startLine: number; endLine: number };
  text: string;
}

export interface CustomAttachment {
  type: 'custom';
  id: string;
  label: string;
  icon?: string;
  data?: unknown;
}
