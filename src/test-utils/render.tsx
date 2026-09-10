/**
 * Custom render utility that wraps components in ChatProvider context.
 * Use `renderWithChat()` for any component that depends on chat context.
 *
 * @module test-utils/render
 */

import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { ChatProvider } from '../provider/ChatProvider';
import type { ChatProviderProps } from '../provider/ChatProvider';
import { darkTheme } from '../theme/dark';
import type { AgentChatTheme } from '../theme/tokens';
import type { ChatSession } from '../types/models';
import type { ChatCallbacks } from '../types/events';
import type { AgentChatConfig } from '../types/config';
import { buildSession } from './builders';

/**
 * Options for `renderWithChat`. Extends RTL's RenderOptions with
 * chat-specific context values.
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Session data (default: empty session) */
  session?: ChatSession;
  /** Callback overrides */
  callbacks?: Partial<ChatCallbacks>;
  /** Config overrides */
  config?: AgentChatConfig;
  /** Theme to apply (default: darkTheme) */
  theme?: AgentChatTheme;
  /** Available agents */
  agents?: ChatProviderProps['agents'];
  /** Active agent */
  activeAgent?: ChatProviderProps['activeAgent'];
}

/**
 * Renders a component wrapped in ChatProvider with full context.
 *
 * @example
 * ```tsx
 * import { renderWithChat } from '../../test-utils/render';
 *
 * test('renders component with context', () => {
 *   renderWithChat(<ResponseRow response={buildResponse()} isLast />, {
 *     session: buildSimpleConversation(),
 *     callbacks: { onVote: vi.fn() },
 *   });
 * });
 * ```
 */
export function renderWithChat(ui: React.ReactElement, options: CustomRenderOptions = {}) {
  const {
    session = buildSession(),
    callbacks = {},
    config,
    theme = darkTheme,
    agents,
    activeAgent,
    ...renderOptions
  } = options;

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <ChatProvider
        session={session}
        theme={theme}
        config={config}
        agents={agents}
        activeAgent={activeAgent}
        {...callbacks}
      >
        {children}
      </ChatProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}
