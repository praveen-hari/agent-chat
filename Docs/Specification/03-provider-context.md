# Phase 3: Provider & Context System

## Files

- `src/provider/ChatContext.ts`
- `src/provider/ChatProvider.tsx`
- `src/provider/useChatContext.ts`
- `src/provider/useChatActions.ts`

---

## 3.1 `ChatContext.ts` — Context Definition

```typescript
import { createContext } from 'react';
import type { ChatSession, ChatAgent, ChatCallbacks, AgentChatConfig, AgentChatTheme } from '../types';

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
  /** Component configuration */
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
```

---

## 3.2 `ChatProvider.tsx` — Top-Level Provider

```typescript
/**
 * <ChatProvider> wraps the entire chat UI and provides:
 * 1. Session data to all child components via React context
 * 2. Theme injection via CSS variables
 * 3. Callback routing
 * 4. Derived state computation (isStreaming, isEmpty, etc.)
 * 5. Default configuration merging
 */
interface ChatProviderProps {
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

  /** All callback handlers */
  // Spread from ChatCallbacks:
  onSendMessage?: ChatCallbacks['onSendMessage'];
  onCancelResponse?: ChatCallbacks['onCancelResponse'];
  onRetryResponse?: ChatCallbacks['onRetryResponse'];
  onEditRequest?: ChatCallbacks['onEditRequest'];
  onDeleteRequest?: ChatCallbacks['onDeleteRequest'];
  onToolAction?: ChatCallbacks['onToolAction'];
  onElicitationAction?: ChatCallbacks['onElicitationAction'];
  onPlanAction?: ChatCallbacks['onPlanAction'];
  onQuestionSubmit?: ChatCallbacks['onQuestionSubmit'];
  onQuestionNavigate?: ChatCallbacks['onQuestionNavigate'];
  onQuestionSkip?: ChatCallbacks['onQuestionSkip'];
  onVote?: ChatCallbacks['onVote'];
  onFollowupClick?: ChatCallbacks['onFollowupClick'];
  onCommandClick?: ChatCallbacks['onCommandClick'];
  onReferenceClick?: ChatCallbacks['onReferenceClick'];
  onFileOpen?: ChatCallbacks['onFileOpen'];
  onCodeApply?: ChatCallbacks['onCodeApply'];
  onCodeCopy?: ChatCallbacks['onCodeCopy'];
  onAttachmentAdd?: ChatCallbacks['onAttachmentAdd'];
  onAttachmentRemove?: ChatCallbacks['onAttachmentRemove'];
  onTerminalFocus?: ChatCallbacks['onTerminalFocus'];
  onTerminalBackground?: ChatCallbacks['onTerminalBackground'];
  onPullRequestClick?: ChatCallbacks['onPullRequestClick'];
  onUpgradeClick?: ChatCallbacks['onUpgradeClick'];
  onSignInClick?: ChatCallbacks['onSignInClick'];
  onTipDismiss?: ChatCallbacks['onTipDismiss'];
  onSubAgentOpen?: ChatCallbacks['onSubAgentOpen'];
  onSuggestNextClick?: ChatCallbacks['onSuggestNextClick'];

  children: React.ReactNode;
}
```

### Implementation Behavior

1. **Default config merging** — merges consumer config with sensible defaults:
   ```typescript
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
   ```

2. **Derived state** computed via `useMemo`:
   ```typescript
   const isStreaming = session.messages.some(
     m => m.role === 'assistant' && m.state === 'streaming'
   );
   const streamingResponse = session.messages.find(
     m => m.role === 'assistant' && m.state === 'streaming'
   ) as ChatResponse | null;
   const isEmpty = session.messages.length === 0;
   const lastResponse = [...session.messages]
     .reverse()
     .find(m => m.role === 'assistant') as ChatResponse | null;
   ```

3. **Theme injection** — renders `<ThemeProvider>` wrapping children

4. **Callback aggregation** — collects all `on*` props into a `ChatCallbacks` object

---

## 3.3 `useChatContext.ts` — Context Consumer Hook

```typescript
/**
 * Hook to access chat context values.
 * Throws if used outside <ChatProvider>.
 *
 * Usage:
 *   const { session, callbacks, config } = useChatContext();
 */
export function useChatContext(): ChatContextValue {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error(
      'useChatContext must be used within a <ChatProvider>. ' +
      'Wrap your component tree with <ChatProvider>.'
    );
  }
  return context;
}

/**
 * Selector hook — only re-renders when the selected value changes.
 *
 * Usage:
 *   const isStreaming = useChatSelector(ctx => ctx.isStreaming);
 */
export function useChatSelector<T>(selector: (ctx: ChatContextValue) => T): T {
  const context = useChatContext();
  return useMemo(() => selector(context), [context, selector]);
}
```

---

## 3.4 `useChatActions.ts` — Action Dispatch Hook

Convenience hook that wraps callbacks with guards (e.g., checks if handler exists).

```typescript
/**
 * Hook providing action methods with built-in guards.
 * Actions are no-ops when the corresponding callback is not provided.
 *
 * Usage:
 *   const actions = useChatActions();
 *   actions.sendMessage('hello');
 *   actions.cancelResponse('resp-1');
 *   actions.vote('resp-1', 'up');
 */
export function useChatActions() {
  const { callbacks, isStreaming, streamingResponse } = useChatContext();

  return useMemo(() => ({
    sendMessage: (message: string, attachments?: ChatAttachment[], options?: SendMessageOptions) => {
      callbacks.onSendMessage?.(message, attachments, options);
    },

    cancelResponse: (responseId?: string) => {
      const id = responseId ?? streamingResponse?.id;
      if (id) callbacks.onCancelResponse?.(id);
    },

    retryResponse: (responseId: string) => {
      callbacks.onRetryResponse?.(responseId);
    },

    editRequest: (requestId: string, newMessage: string) => {
      callbacks.onEditRequest?.(requestId, newMessage);
    },

    deleteRequest: (requestId: string) => {
      callbacks.onDeleteRequest?.(requestId);
    },

    toolAction: (toolCallId: string, actionId: string, toolId: string) => {
      callbacks.onToolAction?.(toolCallId, actionId, toolId);
    },

    vote: (responseId: string, direction: VoteDirection) => {
      callbacks.onVote?.(responseId, direction);
    },

    followupClick: (followup: ChatFollowup) => {
      callbacks.onFollowupClick?.(followup);
    },

    commandClick: (commandId: string, args?: unknown[]) => {
      callbacks.onCommandClick?.(commandId, args);
    },

    referenceClick: (uri: string, range?: { startLine: number; endLine: number }) => {
      callbacks.onReferenceClick?.(uri, range);
    },

    fileOpen: (uri: string) => {
      callbacks.onFileOpen?.(uri);
    },

    codeApply: (code: string, language: string, filename?: string) => {
      callbacks.onCodeApply?.(code, language, filename);
    },

    codeCopy: (code: string) => {
      callbacks.onCodeCopy?.(code);
    },

    // ... additional convenience methods for all callbacks

    /** Whether sending is possible (not empty, not currently streaming) */
    canSend: !isStreaming && !!callbacks.onSendMessage,

    /** Whether cancellation is possible */
    canCancel: isStreaming && !!callbacks.onCancelResponse,
  }), [callbacks, isStreaming, streamingResponse]);
}
```

---

## Data Flow Diagram

```
Consumer App
    │
    ▼
┌─────────────────────────────────────────────────┐
│  <ChatProvider                                   │
│    session={session}                             │
│    onSendMessage={handleSend}                    │
│    onToolAction={handleToolAction}               │
│    theme={darkTheme}                             │
│  >                                               │
│    ┌─────────────────────────────────────────┐   │
│    │  ChatContext.Provider                     │   │
│    │    value = {                              │   │
│    │      session,                             │   │
│    │      callbacks: { onSendMessage, ... },   │   │
│    │      config: mergedConfig,                │   │
│    │      theme,                               │   │
│    │      isStreaming: derived,                 │   │
│    │      ...                                  │   │
│    │    }                                      │   │
│    │                                           │   │
│    │    ┌─────────────────────────────────┐    │   │
│    │    │  <AgentChat>                     │    │   │
│    │    │    useChatContext() ← reads data │    │   │
│    │    │    useChatActions() ← dispatches │    │   │
│    │    │                                 │    │   │
│    │    │    <MessageList>                 │    │   │
│    │    │      <ResponseRow>              │    │   │
│    │    │        <ContentPartRenderer>    │    │   │
│    │    │          useChatActions()        │    │   │
│    │    │            → callbacks.onTool…  │    │   │
│    │    │                                 │    │   │
│    │    │    <ChatInputArea>              │    │   │
│    │    │      useChatActions()            │    │   │
│    │    │        → callbacks.onSend…      │    │   │
│    │    └─────────────────────────────────┘    │   │
│    └─────────────────────────────────────────┘   │
│  </ChatProvider>                                 │
└─────────────────────────────────────────────────┘
    │
    ▼
Consumer handles callbacks → updates session → re-render
```
