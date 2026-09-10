/**
 * ChatAgentAdapter — the interface consumers implement to connect any AI agent.
 *
 * This is the standard contract between an agent backend and @agent-chat/react.
 * The adapter converts agent-specific events into ChatAgentEvents,
 * which the library's `useAgentSession` hook converts into a ChatSession.
 *
 * @example
 * ```typescript
 * // OpenAI Agents SDK adapter
 * class OpenAIAgentAdapter implements ChatAgentAdapter {
 *   async *sendMessage(message, history, options) {
 *     const stream = await run(agent, input, { stream: true });
 *     for await (const event of stream) {
 *       if (event.type === 'raw_model_stream_event')
 *         yield { type: 'text-delta', text: event.data.delta };
 *       if (event.type === 'run_item_stream_event' && event.name === 'tool_called')
 *         yield { type: 'tool-call-start', toolId: event.item.name, ... };
 *     }
 *     yield { type: 'done' };
 *   }
 * }
 *
 * // AI SDK adapter
 * class AiSdkAdapter implements ChatAgentAdapter {
 *   async *sendMessage(message, history, options) {
 *     const res = await fetch('/api/chat', { ... });
 *     const reader = res.body.getReader();
 *     // parse SSE → yield ChatAgentEvents
 *   }
 * }
 *
 * // Usage with the library
 * const adapter = new OpenAIAgentAdapter();
 * const { session, sendMessage } = useAgentSession(adapter);
 * <ChatProvider session={session}><AgentChat /></ChatProvider>
 * ```
 *
 * @module types/agent
 */

import type { ChatMessage, ChatUsage } from './models';

// ═══════════════════════════════════════════
// AGENT ADAPTER INTERFACE
// ═══════════════════════════════════════════

/**
 * The interface consumers implement to connect any AI agent to the library.
 *
 * Each method returns an AsyncIterable of ChatAgentEvents — the universal
 * event protocol that any agent can produce.
 */
export interface ChatAgentAdapter {
  /**
   * Send a message and receive streaming events.
   *
   * @param message - The user's text message
   * @param history - Previous messages for context (adapter decides how to use)
   * @param options - Abort signal, metadata, etc.
   * @returns AsyncIterable of ChatAgentEvents
   */
  sendMessage(
    message: string,
    history: ChatMessage[],
    options?: ChatAgentRequestOptions,
  ): AsyncIterable<ChatAgentEvent>;

  /** Optional: cancel an in-progress response */
  cancel?(): void;

  /** Optional: retry the last failed response */
  retry?(history: ChatMessage[]): AsyncIterable<ChatAgentEvent>;
}

/**
 * Options passed to the adapter's sendMessage.
 */
export interface ChatAgentRequestOptions {
  /** AbortSignal for cancellation */
  signal?: AbortSignal;
  /** Model override for this request */
  modelId?: string;
  /** Chat mode override */
  mode?: string;
  /** Arbitrary metadata the adapter can use */
  metadata?: Record<string, unknown>;
}

// ═══════════════════════════════════════════
// AGENT EVENT PROTOCOL
// ═══════════════════════════════════════════

/**
 * ChatAgentEvent — the universal event protocol.
 *
 * Every agent adapter converts its native events into these.
 * The `useAgentSession` hook consumes these and builds a ChatSession.
 *
 * 8 event categories matching the universal agent pattern:
 * 1. Text        — streamed text content
 * 2. Reasoning   — thinking / chain-of-thought
 * 3. Tool        — tool call lifecycle (start → end)
 * 4. File        — images, documents
 * 5. Source      — references, citations
 * 6. Status      — agent handoffs, progress
 * 7. Error       — failures
 * 8. Control     — done, abort
 */
export type ChatAgentEvent =
  // ─── Text ───
  | ChatAgentTextDeltaEvent
  | ChatAgentCodeEvent

  // ─── Reasoning ───
  | ChatAgentReasoningEvent

  // ─── Tool lifecycle ───
  | ChatAgentToolCallStartEvent
  | ChatAgentToolCallDeltaEvent
  | ChatAgentToolCallEndEvent
  | ChatAgentToolApprovalEvent

  // ─── File ───
  | ChatAgentFileEvent

  // ─── Source / Reference ───
  | ChatAgentSourceEvent

  // ─── Status ───
  | ChatAgentHandoffEvent
  | ChatAgentProgressEvent

  // ─── Error ───
  | ChatAgentErrorEvent

  // ─── Control ───
  | ChatAgentDoneEvent;

// ─── Text Events ───

/** Incremental text content (markdown) */
export interface ChatAgentTextDeltaEvent {
  type: 'text-delta';
  /** The text chunk to append */
  text: string;
}

/** A complete code block */
export interface ChatAgentCodeEvent {
  type: 'code';
  /** The code content */
  code: string;
  /** Language identifier */
  language: string;
  /** Optional filename */
  filename?: string;
}

// ─── Reasoning Events ───

/** Reasoning / thinking content */
export interface ChatAgentReasoningEvent {
  type: 'reasoning';
  /** The reasoning text chunk to append */
  text: string;
}

// ─── Tool Events ───

/** Tool call started — arguments being generated or execution started */
export interface ChatAgentToolCallStartEvent {
  type: 'tool-call-start';
  /** Unique ID for this tool call */
  toolCallId: string;
  /** Tool name/identifier */
  toolId: string;
  /** Tool input/arguments (may be partial during streaming) */
  input?: unknown;
}

/** Tool call arguments streaming */
export interface ChatAgentToolCallDeltaEvent {
  type: 'tool-call-delta';
  /** The tool call ID this delta belongs to */
  toolCallId: string;
  /** Incremental argument text */
  argsDelta: string;
}

/** Tool call completed with output */
export interface ChatAgentToolCallEndEvent {
  type: 'tool-call-end';
  /** The tool call ID */
  toolCallId: string;
  /** Tool output/result */
  output?: string;
  /** Whether the tool call succeeded */
  success?: boolean;
}

/** Tool needs user approval before execution */
export interface ChatAgentToolApprovalEvent {
  type: 'tool-approval';
  /** The tool call ID needing approval */
  toolCallId: string;
  /** Tool name */
  toolId: string;
  /** Description of what the tool will do */
  message: string;
  /** Risk level */
  riskLevel?: 'low' | 'medium' | 'high';
}

// ─── File Events ───

/** File/image content */
export interface ChatAgentFileEvent {
  type: 'file';
  /** URL or data URI */
  url: string;
  /** MIME type */
  mediaType: string;
  /** Optional filename */
  filename?: string;
}

// ─── Source Events ───

/** Reference/citation source */
export interface ChatAgentSourceEvent {
  type: 'source';
  /** Display label */
  label: string;
  /** URI to the source */
  uri: string;
  /** Optional icon */
  icon?: string;
}

// ─── Status Events ───

/** Agent handoff — a different agent is now responding */
export interface ChatAgentHandoffEvent {
  type: 'agent-handoff';
  /** Name of the new agent */
  agentName: string;
  /** Icon for the new agent */
  agentIcon?: string;
}

/** Progress message */
export interface ChatAgentProgressEvent {
  type: 'progress';
  /** Progress message text */
  message: string;
}

// ─── Error Events ───

/** Error occurred */
export interface ChatAgentErrorEvent {
  type: 'error';
  /** Error message */
  message: string;
  /** Severity */
  level?: 'error' | 'warning' | 'info';
}

// ─── Control Events ───

/** Agent run completed */
export interface ChatAgentDoneEvent {
  type: 'done';
  /** Token usage stats */
  usage?: ChatUsage;
  /** Final agent name (after handoffs) */
  agentName?: string;
}
