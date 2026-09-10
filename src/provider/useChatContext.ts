/**
 * Hooks for consuming chat context.
 *
 * @module provider/useChatContext
 */

import { useContext, useMemo } from 'react';
import { ChatContext } from './ChatContext';
import type { ChatContextValue } from './ChatContext';

/**
 * Hook to access chat context values.
 * Throws if used outside `<ChatProvider>`.
 *
 * @example
 * ```tsx
 * const { session, callbacks, config, isStreaming } = useChatContext();
 * ```
 */
export function useChatContext(): ChatContextValue {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error(
      'useChatContext must be used within a <ChatProvider>. ' +
        'Wrap your component tree with <ChatProvider>.',
    );
  }
  return context;
}

/**
 * Selector hook — derives a value from context.
 * Re-renders only when the context changes (standard React context behavior).
 *
 * @example
 * ```tsx
 * const isStreaming = useChatSelector(ctx => ctx.isStreaming);
 * const agentName = useChatSelector(ctx => ctx.activeAgent?.name);
 * ```
 */
export function useChatSelector<T>(selector: (ctx: ChatContextValue) => T): T {
  const context = useChatContext();
  return useMemo(() => selector(context), [context, selector]);
}
