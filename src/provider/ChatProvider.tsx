/**
 * ChatProvider — top-level context provider for the chat UI.
 *
 * Provides session data, callbacks, config, theme, and derived state
 * to all descendant components via React context.
 *
 * @module provider/ChatProvider
 */

import { useMemo, useState } from 'react';
import { ChatContext } from './ChatContext';
import type { ChatContextValue } from './ChatContext';
import { ThemeProvider } from '../theme/ThemeProvider';
import { darkTheme } from '../theme/dark';
import type { AgentChatTheme } from '../theme/tokens';
import type {
  ChatSession,
  ChatAgent,
  ChatAttachment,
  ChatMode,
  ChatResponse,
} from '../types/models';
import type { ChatCallbacks } from '../types/events';
import type { AgentChatConfig } from '../types/config';

// ═══════════════════════════════════════════
// DEFAULT CONFIGURATION
// ═══════════════════════════════════════════

const DEFAULT_CONFIG: Required<AgentChatConfig> = {
  maxWidth: 950,
  showWelcome: true,
  welcomeTitle: 'How can I help you?',
  welcomeSuggestions: [],
  placeholder: 'Type a message...',
  maxInputHeight: 250,
  showModePicker: true,
  showModelPicker: true,
  availableModes: ['ask', 'agent', 'edit'],
  availableModels: [],
  enableAttachments: true,
  enableStreamingAnimation: true,
  streamingWordsPerSecond: 80,
  enableSyntaxHighlighting: true,
  enableMath: true,
  enableVirtualization: true,
  showVoteButtons: true,
  showCopyButton: true,
  showResponseDetails: true,
  showTokenUsage: false,
  showTodoList: true,
  ariaLabel: 'Chat',
  announceMessages: true,
  contentPartOverrides: {},
  attachmentOverrides: {},
};

// ═══════════════════════════════════════════
// PROPS
// ═══════════════════════════════════════════

export interface ChatProviderProps extends ChatCallbacks {
  /** The session data (controlled by consumer) */
  session: ChatSession;

  /** Available agents */
  agents?: ChatAgent[];

  /** Active/default agent */
  activeAgent?: ChatAgent;

  /** Theme preset (default: darkTheme) */
  theme?: AgentChatTheme;

  /** Configuration overrides */
  config?: AgentChatConfig;

  /** Child elements */
  children: React.ReactNode;
}

// ═══════════════════════════════════════════
// PROVIDER COMPONENT
// ═══════════════════════════════════════════

/**
 * Wraps the chat UI and provides context to all descendants.
 *
 * @example
 * ```tsx
 * <ChatProvider
 *   session={session}
 *   onSendMessage={handleSend}
 *   onVote={handleVote}
 *   theme={darkTheme}
 * >
 *   <AgentChat />
 * </ChatProvider>
 * ```
 */
export function ChatProvider({
  session,
  agents = [],
  activeAgent,
  theme = darkTheme,
  config: configOverrides,
  children,
  // Destructure all callbacks
  onSendMessage,
  onCancelResponse,
  onRetryResponse,
  onEditRequest,
  onDeleteRequest,
  onToolAction,
  onConfirmationAction,
  onElicitationAction,
  onPlanAction,
  onQuestionSubmit,
  onQuestionNavigate,
  onQuestionSkip,
  onVote,
  onFollowupClick,
  onCommandClick,
  onReferenceClick,
  onFileOpen,
  onCodeApply,
  onCodeCopy,
  onAttachmentAdd,
  onAttachmentRemove,
  onTerminalFocus,
  onTerminalBackground,
  onPullRequestClick,
  onUpgradeClick,
  onSignInClick,
  onTipDismiss,
  onSubAgentOpen,
  onSuggestNextClick,
}: ChatProviderProps) {
  // ─── Local state for input ───
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [currentMode, setCurrentMode] = useState<ChatMode>('agent');
  const [currentModelId, setCurrentModelId] = useState<string | undefined>(undefined);

  // ─── Merge config with defaults ───
  const config = useMemo<Required<AgentChatConfig>>(
    () => ({ ...DEFAULT_CONFIG, ...configOverrides }),
    [configOverrides],
  );

  // ─── Aggregate callbacks ───
  const callbacks = useMemo<ChatCallbacks>(
    () => ({
      onSendMessage,
      onCancelResponse,
      onRetryResponse,
      onEditRequest,
      onDeleteRequest,
      onToolAction,
      onConfirmationAction,
      onElicitationAction,
      onPlanAction,
      onQuestionSubmit,
      onQuestionNavigate,
      onQuestionSkip,
      onVote,
      onFollowupClick,
      onCommandClick,
      onReferenceClick,
      onFileOpen,
      onCodeApply,
      onCodeCopy,
      onAttachmentAdd: onAttachmentAdd ?? ((att) => setAttachments((prev) => [...prev, att])),
      onAttachmentRemove:
        onAttachmentRemove ?? ((id) => setAttachments((prev) => prev.filter((a) => a.id !== id))),
      onTerminalFocus,
      onTerminalBackground,
      onPullRequestClick,
      onUpgradeClick,
      onSignInClick,
      onTipDismiss,
      onSubAgentOpen,
      onSuggestNextClick,
    }),
    [
      onSendMessage,
      onCancelResponse,
      onRetryResponse,
      onEditRequest,
      onDeleteRequest,
      onToolAction,
      onConfirmationAction,
      onElicitationAction,
      onPlanAction,
      onQuestionSubmit,
      onQuestionNavigate,
      onQuestionSkip,
      onVote,
      onFollowupClick,
      onCommandClick,
      onReferenceClick,
      onFileOpen,
      onCodeApply,
      onCodeCopy,
      onAttachmentAdd,
      onAttachmentRemove,
      onTerminalFocus,
      onTerminalBackground,
      onPullRequestClick,
      onUpgradeClick,
      onSignInClick,
      onTipDismiss,
      onSubAgentOpen,
      onSuggestNextClick,
    ],
  );

  // ─── Derived state ───
  const derivedState = useMemo(() => {
    const streamingResponse =
      (session.messages.find(
        (m) => m.role === 'assistant' && (m as ChatResponse).state === 'streaming',
      ) as ChatResponse | undefined) ?? null;

    const lastResponse =
      ([...session.messages].reverse().find((m) => m.role === 'assistant') as
        ChatResponse | undefined) ?? null;

    return {
      isStreaming: streamingResponse !== null,
      streamingResponse,
      isEmpty: session.messages.length === 0,
      lastResponse,
    };
  }, [session.messages]);

  // ─── Assemble context value ───
  const contextValue = useMemo<ChatContextValue>(
    () => ({
      session,
      agents,
      activeAgent,
      config,
      theme,
      callbacks,
      attachments,
      currentMode,
      currentModelId,
      ...derivedState,
    }),
    [
      session,
      agents,
      activeAgent,
      config,
      theme,
      callbacks,
      attachments,
      currentMode,
      currentModelId,
      derivedState,
    ],
  );

  // Expose setters via a ref-stable way for useChatActions (Phase 3.4)
  // These are used internally — not exposed to consumers
  void setCurrentMode;
  void setCurrentModelId;

  return (
    <ChatContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ChatContext.Provider>
  );
}
