/**
 * Custom render utility that wraps components in ChatProvider context.
 * Use `renderWithChat()` for any component that depends on chat context.
 *
 * @module test-utils/render
 */

import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '../theme/ThemeProvider';
import { darkTheme } from '../theme/dark';
import type { AgentChatTheme } from '../theme/tokens';

/**
 * Options for `renderWithChat`. Extends RTL's RenderOptions with
 * chat-specific context values.
 *
 * Note: `session`, `callbacks`, and `config` will be added in Phase 3
 * when ChatProvider is implemented. For now, wraps with ThemeProvider.
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Theme to apply (default: darkTheme) */
  theme?: AgentChatTheme;
  /** Additional className on the theme root */
  className?: string;
}

/**
 * Renders a component wrapped in the chat context providers.
 *
 * @example
 * ```tsx
 * import { renderWithChat } from '../../test-utils/render';
 *
 * test('renders component', () => {
 *   renderWithChat(<Avatar icon="🤖" name="Bot" />);
 *   expect(screen.getByText('🤖')).toBeInTheDocument();
 * });
 * ```
 */
export function renderWithChat(ui: React.ReactElement, options: CustomRenderOptions = {}) {
  const { theme = darkTheme, className, ...renderOptions } = options;

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <ThemeProvider theme={theme} className={className}>
        {children}
      </ThemeProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}
