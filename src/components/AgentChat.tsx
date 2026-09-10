/**
 * AgentChat — the main composed chat widget.
 * This is the primary component consumers use.
 * Must be wrapped in `<ChatProvider>`.
 *
 * @module components/AgentChat
 *
 * @example
 * ```tsx
 * <ChatProvider session={session} onSendMessage={handleSend} theme={darkTheme}>
 *   <AgentChat />
 * </ChatProvider>
 * ```
 */

import { memo, useMemo } from 'react';
import { cn } from '../utils/cn';
import { useChatContext } from '../provider/useChatContext';
import { ChatWelcome } from './ChatWelcome';
import { TodoListDock } from './TodoListDock';
import { MessageList } from './messages/MessageList';
import { ChatInputArea } from './input/ChatInputArea';
import type { TodoListPart } from '../types/content-parts';
import type { ChatResponse } from '../types/models';

export interface AgentChatProps {
  /** Welcome screen title override */
  welcomeTitle?: string;
  /** Welcome screen subtitle */
  welcomeSubtitle?: string;
  /** Welcome screen suggestion prompts */
  welcomeSuggestions?: Array<{ label: string; message: string; icon?: string }>;
  /** Input placeholder override */
  placeholder?: string;
  /** Max container width override */
  maxWidth?: number;
  /** Additional CSS class on root element */
  className?: string;
  /** Render prop for custom header */
  renderHeader?: () => React.ReactNode;
  /** Render prop for custom footer (above input) */
  renderFooter?: () => React.ReactNode;
}

export const AgentChat = memo(function AgentChat({
  welcomeTitle,
  welcomeSubtitle,
  welcomeSuggestions,
  maxWidth,
  className,
  renderHeader,
  renderFooter,
}: AgentChatProps) {
  const { session, config, isEmpty, isStreaming, lastResponse } = useChatContext();

  // Find the most recent todo-list content part
  const activeTodoList = useMemo(() => {
    for (let i = session.messages.length - 1; i >= 0; i--) {
      const msg = session.messages[i];
      if (msg?.role === 'assistant') {
        const response = msg as ChatResponse;
        for (let j = response.content.length - 1; j >= 0; j--) {
          if (response.content[j]?.kind === 'todo-list') {
            return response.content[j] as TodoListPart;
          }
        }
      }
    }
    return null;
  }, [session.messages]);

  // Screen reader announcement for last response
  const announcement = useMemo(() => {
    if (!config.announceMessages) return '';
    if (isStreaming && lastResponse?.agent) {
      return `${lastResponse.agent.name} is responding`;
    }
    if (lastResponse?.state === 'complete' && lastResponse.agent) {
      return `${lastResponse.agent.name} responded`;
    }
    if (lastResponse?.state === 'failed' && lastResponse.error) {
      return `Error: ${lastResponse.error.message}`;
    }
    return '';
  }, [config.announceMessages, isStreaming, lastResponse]);

  return (
    <div className={cn('ac-root', className)} data-testid="agent-chat">
      <div
        className="ac-chat"
        style={{ maxWidth: maxWidth ?? config.maxWidth }}
        role="region"
        aria-label={config.ariaLabel}
      >
        {/* Optional custom header */}
        {renderHeader?.()}

        {/* Chat body — welcome or message list */}
        {isEmpty ? (
          <ChatWelcome
            title={welcomeTitle ?? config.welcomeTitle}
            subtitle={welcomeSubtitle}
            suggestions={welcomeSuggestions ?? config.welcomeSuggestions}
          />
        ) : (
          <MessageList />
        )}

        {/* Dockable todo list */}
        {config.showTodoList && activeTodoList && <TodoListDock items={activeTodoList.items} />}

        {/* Optional custom footer */}
        {renderFooter?.()}

        {/* Input area */}
        <ChatInputArea />

        {/* Screen reader announcements */}
        {config.announceMessages && (
          <div className="ac-sr-only" role="status" aria-live="polite" aria-atomic="true">
            {announcement}
          </div>
        )}
      </div>
    </div>
  );
});
