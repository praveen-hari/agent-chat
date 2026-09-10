/**
 * Chat context definition.
 * Provides session data, callbacks, config, and derived state to all descendants.
 *
 * @module provider/ChatContext
 */

import { createContext } from 'react';
import type {
  ChatSession,
  ChatAgent,
  ChatAttachment,
  ChatMode,
  ChatResponse,
} from '../types/models';
import type { ChatCallbacks } from '../types/events';
import type { AgentChatConfig } from '../types/config';
import type { AgentChatTheme } from '../theme/tokens';

/**
 * The shape of the context value available to all child components.
 */
export interface ChatContextValue {
  // ─── Data ───
  /** Current session state (messages, content parts) */
  session: ChatSession;

  /** Registered agents */
  agents: ChatAgent[];

  /** Currently active/default agent */
  activeAgent?: ChatAgent;

  // ─── Configuration ───
  /** Component configuration (merged with defaults) */
  config: Required<AgentChatConfig>;

  /** Active theme */
  theme: AgentChatTheme;

  // ─── Callbacks ───
  /** All event handlers */
  callbacks: ChatCallbacks;

  // ─── Derived State ───
  /** Whether any response is currently streaming */
  isStreaming: boolean;

  /** The currently streaming response (if any) */
  streamingResponse: ChatResponse | null;

  /** Whether the session has any messages */
  isEmpty: boolean;

  /** The last response in the session */
  lastResponse: ChatResponse | null;

  /** Current input attachments */
  attachments: ChatAttachment[];

  /** Current chat mode */
  currentMode: ChatMode;

  /** Current model ID */
  currentModelId: string | undefined;
}

export const ChatContext = createContext<ChatContextValue | null>(null);
