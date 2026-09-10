# Phase 11: Testing Strategy & Automation

## Overview

The `@agent-chat/react` library uses a multi-layer testing approach ensuring every component, hook, and integration point is verified. Testing is automated via CI/CD and runs on every PR.

```
┌─────────────────────────────────────────────────────────┐
│                    Testing Pyramid                       │
│                                                         │
│                    ┌─────────┐                          │
│                    │  E2E    │  Playwright (3-5 tests)  │
│                   ┌┴─────────┴┐                         │
│                   │ Integration│  React Testing Lib     │
│                  ┌┴────────────┴┐  (30-40 tests)       │
│                  │  Snapshot     │  Visual regression    │
│                 ┌┴──────────────┴┐  (all components)   │
│                 │   Unit Tests    │  Vitest             │
│                 │                 │  (150+ tests)       │
│                 └─────────────────┘                     │
└─────────────────────────────────────────────────────────┘
```

---

## 11.1 Test Framework & Tools

| Tool | Purpose | Config |
|------|---------|--------|
| **Vitest** | Unit & integration test runner | `vitest.config.ts` |
| **React Testing Library** | Component testing (DOM queries, events) | `@testing-library/react` |
| **@testing-library/user-event** | Realistic user interaction simulation | keyboard, click, paste |
| **jsdom** | Browser environment for tests | Vitest environment |
| **Playwright** | E2E browser testing | `playwright.config.ts` |
| **Storybook** | Visual component development & snapshot testing | `.storybook/` |
| **Chromatic** (optional) | Visual regression in CI | Connected to Storybook |
| **MSW** | Mock streaming/API responses in tests | `msw` handlers |

---

## 11.2 Directory Structure

```
@agent-chat/react/
├── src/
│   ├── __tests__/                         # Integration tests
│   │   ├── AgentChat.test.tsx             # Main widget integration
│   │   ├── streaming.test.tsx             # Streaming flow tests
│   │   ├── tool-confirmation.test.tsx     # Tool approval flow
│   │   ├── keyboard-navigation.test.tsx   # Accessibility/keyboard
│   │   └── theme-switching.test.tsx       # Theme toggling
│   │
│   ├── components/
│   │   ├── atoms/
│   │   │   ├── Avatar.tsx
│   │   │   ├── Avatar.test.tsx            # Co-located unit test
│   │   │   ├── Avatar.stories.tsx         # Storybook story
│   │   │   └── ...
│   │   ├── content-parts/
│   │   │   ├── CodeBlock.tsx
│   │   │   ├── CodeBlock.test.tsx
│   │   │   ├── CodeBlock.stories.tsx
│   │   │   └── ...
│   │   └── ...
│   │
│   ├── hooks/
│   │   ├── useStreaming.ts
│   │   ├── useStreaming.test.ts           # Hook unit test
│   │   └── ...
│   │
│   ├── types/
│   │   └── __tests__/
│   │       └── type-guards.test.ts        # Type guard & union tests
│   │
│   └── test-utils/                        # Shared test utilities
│       ├── render.tsx                     # Custom render with providers
│       ├── fixtures.ts                    # Sample data fixtures
│       ├── builders.ts                    # Test data builders
│       └── matchers.ts                    # Custom Jest/Vitest matchers
│
├── e2e/                                   # Playwright E2E tests
│   ├── chat-flow.spec.ts
│   ├── streaming.spec.ts
│   └── accessibility.spec.ts
│
├── .storybook/                            # Storybook config
│   ├── main.ts
│   ├── preview.ts
│   └── theme-decorator.tsx
│
├── vitest.config.ts
└── playwright.config.ts
```

---

## 11.3 Test Utilities (`src/test-utils/`)

### Custom Render

```typescript
// src/test-utils/render.tsx
import { render, RenderOptions } from '@testing-library/react';
import { ChatProvider } from '../provider/ChatProvider';
import { darkTheme } from '../theme/dark';
import type { ChatSession, ChatCallbacks, AgentChatConfig } from '../types';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  session?: ChatSession;
  callbacks?: Partial<ChatCallbacks>;
  config?: Partial<AgentChatConfig>;
  theme?: AgentChatTheme;
}

export function renderWithChat(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const {
    session = createEmptySession(),
    callbacks = {},
    config = {},
    theme = darkTheme,
    ...renderOptions
  } = options;

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <ChatProvider
        session={session}
        theme={theme}
        config={config}
        {...callbacks}
      >
        {children}
      </ChatProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    // Expose re-render with updated session
    rerender: (newSession: ChatSession) => {
      // ... update provider with new session
    },
  };
}
```

### Test Data Builders

```typescript
// src/test-utils/builders.ts
import type { ChatSession, ChatRequest, ChatResponse, ChatContentPart } from '../types';

/**
 * Builder pattern for creating test data.
 * Provides sensible defaults that can be overridden.
 */

let idCounter = 0;
const nextId = () => `test-${++idCounter}`;

// ─── Session Builder ───
export function buildSession(overrides?: Partial<ChatSession>): ChatSession {
  return {
    id: nextId(),
    messages: [],
    createdAt: Date.now(),
    ...overrides,
  };
}

// ─── Request Builder ───
export function buildRequest(overrides?: Partial<ChatRequest>): ChatRequest {
  return {
    role: 'user',
    id: nextId(),
    timestamp: Date.now(),
    message: 'Hello, world!',
    content: [{ kind: 'markdown', content: 'Hello, world!' }],
    ...overrides,
  };
}

// ─── Response Builder ───
export function buildResponse(overrides?: Partial<ChatResponse>): ChatResponse {
  return {
    role: 'assistant',
    id: nextId(),
    requestId: nextId(),
    timestamp: Date.now(),
    state: 'complete',
    content: [{ kind: 'markdown', content: 'Hello! How can I help?' }],
    agent: { id: 'test-agent', name: 'Test Agent', icon: '🤖' },
    ...overrides,
  };
}

// ─── Content Part Builders ───
export function buildMarkdown(content: string): MarkdownPart {
  return { kind: 'markdown', content };
}

export function buildCodeBlock(code: string, language = 'typescript'): CodeBlockPart {
  return { kind: 'code', code, language };
}

export function buildThinking(content: string, isStreaming = false): ThinkingPart {
  return { kind: 'thinking', content, isStreaming };
}

export function buildToolCall(overrides?: Partial<ToolCallPart>): ToolCallPart {
  return {
    kind: 'tool-call',
    toolId: 'test_tool',
    toolCallId: nextId(),
    status: 'complete',
    ...overrides,
  };
}

export function buildTerminalCommand(overrides?: Partial<TerminalCommandPart>): TerminalCommandPart {
  return {
    kind: 'terminal-command',
    command: 'npm test',
    output: 'All tests passed',
    exitCode: 0,
    isRunning: false,
    ...overrides,
  };
}

export function buildTodoList(items?: TodoItem[]): TodoListPart {
  return {
    kind: 'todo-list',
    items: items || [
      { id: 1, title: 'Explore codebase', status: 'completed' },
      { id: 2, title: 'Fix the bug', status: 'in-progress' },
      { id: 3, title: 'Write tests', status: 'not-started' },
    ],
  };
}

export function buildEditPill(overrides?: Partial<EditPillPart>): EditPillPart {
  return {
    kind: 'edit-pill',
    filename: 'src/utils.ts',
    status: 'modified',
    linesAdded: 12,
    linesRemoved: 3,
    ...overrides,
  };
}

export function buildFileChangesSummary(fileCount = 3): FileChangesSummaryPart {
  return {
    kind: 'file-changes-summary',
    files: Array.from({ length: fileCount }, (_, i) => ({
      filename: `src/file${i + 1}.ts`,
      status: 'modified' as const,
      linesAdded: Math.floor(Math.random() * 50),
      linesRemoved: Math.floor(Math.random() * 20),
    })),
    totalAdded: 42,
    totalRemoved: 18,
  };
}

export function buildToolConfirmation(overrides?: Partial<ToolConfirmationPart>): ToolConfirmationPart {
  return {
    kind: 'tool-confirmation',
    toolId: 'edit_file',
    toolCallId: nextId(),
    title: 'Edit src/utils.ts',
    message: 'This tool wants to modify a file.',
    actions: [
      { id: 'allow-once', label: 'Allow Once', primary: true },
      { id: 'skip', label: 'Skip' },
    ],
    ...overrides,
  };
}

// ─── Scenario Builders (full conversations) ───
export function buildSimpleConversation(): ChatSession {
  const reqId = nextId();
  return buildSession({
    messages: [
      buildRequest({ id: reqId, message: 'Fix the login bug' }),
      buildResponse({
        requestId: reqId,
        content: [
          buildThinking('Let me analyze the login code...', false),
          buildToolCall({ toolId: 'read_file', status: 'complete', label: 'Reading auth.ts' }),
          buildMarkdown('I found the issue. The token validation was missing a null check.'),
          buildCodeBlock('if (token != null) {\n  validate(token);\n}', 'typescript'),
          buildEditPill({ filename: 'src/auth.ts', linesAdded: 3, linesRemoved: 1 }),
        ],
      }),
    ],
  });
}

export function buildStreamingConversation(): ChatSession {
  const reqId = nextId();
  return buildSession({
    messages: [
      buildRequest({ id: reqId, message: 'Explain this code' }),
      buildResponse({
        requestId: reqId,
        state: 'streaming',
        content: [
          buildThinking('Analyzing the code structure...', true),
          { kind: 'working' },
        ],
      }),
    ],
  });
}

export function buildToolConfirmationConversation(): ChatSession {
  const reqId = nextId();
  return buildSession({
    messages: [
      buildRequest({ id: reqId, message: 'Refactor the utils module' }),
      buildResponse({
        requestId: reqId,
        state: 'needs-input',
        content: [
          buildThinking('Planning the refactoring...', false),
          buildToolConfirmation({
            title: 'Edit src/utils.ts',
            message: 'Replace the legacy helper functions with modern equivalents.',
            riskLevel: 'medium',
          }),
        ],
      }),
    ],
  });
}
```

### Sample Fixtures

```typescript
// src/test-utils/fixtures.ts
// Pre-built fixtures for common test scenarios

export const FIXTURES = {
  emptySession: buildSession(),
  simpleChat: buildSimpleConversation(),
  streamingChat: buildStreamingConversation(),
  toolConfirmation: buildToolConfirmationConversation(),

  // All content part types (for snapshot testing)
  allContentParts: buildSession({
    messages: [
      buildRequest({ message: 'Show me everything' }),
      buildResponse({
        content: [
          { kind: 'markdown', content: '# Hello\n\nThis is **bold** and `code`.' },
          { kind: 'code', code: 'const x = 1;', language: 'typescript', filename: 'example.ts' },
          { kind: 'thinking', content: '**Analyzing** the request...', isStreaming: false },
          { kind: 'sub-agent', agentName: 'Explore', description: 'Searching codebase', status: 'complete' },
          { kind: 'tool-call', toolId: 'search', toolCallId: 'tc1', status: 'complete', label: 'Searching files' },
          { kind: 'terminal-command', command: 'npm test', output: 'PASS', exitCode: 0, isRunning: false },
          { kind: 'progress', message: 'Analyzing code...', isActive: false },
          { kind: 'edit-pill', filename: 'src/app.ts', status: 'modified', linesAdded: 5, linesRemoved: 2 },
          { kind: 'file-changes-summary', files: [{ filename: 'src/app.ts', status: 'modified', linesAdded: 5, linesRemoved: 2 }], totalAdded: 5, totalRemoved: 2 },
          { kind: 'todo-list', items: [{ id: 1, title: 'Task 1', status: 'completed' }] },
          { kind: 'references', references: [{ label: 'src/app.ts', uri: 'file:///src/app.ts' }] },
          { kind: 'error', message: 'Something went wrong', level: 'warning' },
          { kind: 'confirmation', title: 'Confirm', message: 'Are you sure?', buttons: [{ id: 'yes', label: 'Yes', primary: true }] },
          { kind: 'command', label: 'Open Settings', commandId: 'settings.open' },
        ],
        followups: [
          { id: 'f1', label: 'Tell me more', message: 'Tell me more about this', type: 'reply' },
        ],
      }),
    ],
  }),
};
```

---

## 11.4 Unit Tests

### What to test per component

Every component gets a co-located `.test.tsx` file covering:

| Aspect | What to verify |
|--------|---------------|
| **Renders** | Component renders without crashing with minimal props |
| **Props** | All prop combinations render correctly |
| **Content** | Text content, labels, counts are displayed |
| **States** | Loading, active, complete, error, collapsed, expanded |
| **Interactions** | Click, hover, keyboard events fire callbacks |
| **Accessibility** | ARIA attributes, roles, labels present |
| **Edge cases** | Empty arrays, undefined props, long text truncation |
| **Memoization** | Does not re-render when props haven't changed |

### Example: `Avatar.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  test('renders emoji icon', () => {
    render(<Avatar icon="🤖" name="Bot" />);
    expect(screen.getByText('🤖')).toBeInTheDocument();
  });

  test('renders image with fallback', () => {
    render(<Avatar icon={{ src: 'https://example.com/avatar.png' }} name="User" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.png');
    expect(img).toHaveAttribute('alt', 'User');
  });

  test('renders initials when no icon', () => {
    render(<Avatar icon="" name="John Doe" />);
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  test('applies custom size', () => {
    const { container } = render(<Avatar icon="🤖" size={32} />);
    expect(container.firstChild).toHaveStyle({ width: '32px', height: '32px' });
  });

  test('shows outline when prop is set', () => {
    const { container } = render(<Avatar icon="🤖" outline />);
    expect(container.firstChild).toHaveClass('ac-avatar--outline');
  });

  test('has accessible role', () => {
    render(<Avatar icon="🤖" name="Bot" />);
    expect(screen.getByRole('img', { name: 'Bot' })).toBeInTheDocument();
  });
});
```

### Example: `CodeBlock.test.tsx`

```typescript
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithChat } from '../../test-utils/render';
import { CodeBlock } from './CodeBlock';

describe('CodeBlock', () => {
  const defaultProps = {
    kind: 'code' as const,
    code: 'const x = 1;',
    language: 'typescript',
  };

  test('renders code content', () => {
    renderWithChat(<CodeBlock {...defaultProps} />);
    expect(screen.getByText('const x = 1;')).toBeInTheDocument();
  });

  test('shows language label', () => {
    renderWithChat(<CodeBlock {...defaultProps} />);
    expect(screen.getByText('typescript')).toBeInTheDocument();
  });

  test('shows filename when provided', () => {
    renderWithChat(<CodeBlock {...defaultProps} filename="utils.ts" />);
    expect(screen.getByText('utils.ts')).toBeInTheDocument();
  });

  test('copy button copies to clipboard', async () => {
    const mockCopy = vi.fn();
    Object.assign(navigator, { clipboard: { writeText: mockCopy } });

    renderWithChat(<CodeBlock {...defaultProps} />, {
      callbacks: { onCodeCopy: vi.fn() },
    });

    await userEvent.click(screen.getByLabelText('Copy'));
    expect(mockCopy).toHaveBeenCalledWith('const x = 1;');
  });

  test('apply button fires callback', async () => {
    const onCodeApply = vi.fn();
    renderWithChat(<CodeBlock {...defaultProps} />, {
      callbacks: { onCodeApply },
    });

    await userEvent.click(screen.getByLabelText('Apply'));
    expect(onCodeApply).toHaveBeenCalledWith('const x = 1;', 'typescript', undefined);
  });

  test('apply button hidden when no callback', () => {
    renderWithChat(<CodeBlock {...defaultProps} />);
    expect(screen.queryByLabelText('Apply')).not.toBeInTheDocument();
  });

  test('toolbar hidden when showToolbar=false', () => {
    renderWithChat(<CodeBlock {...defaultProps} showToolbar={false} />);
    expect(screen.queryByLabelText('Copy')).not.toBeInTheDocument();
  });
});
```

### Example: `useStreaming.test.ts`

```typescript
import { renderHook, act } from '@testing-library/react';
import { useStreaming } from './useStreaming';

describe('useStreaming', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('returns full content when not streaming', () => {
    const { result } = renderHook(() =>
      useStreaming('Hello world this is a test', false)
    );
    expect(result.current).toBe('Hello world this is a test');
  });

  test('returns empty initially when streaming', () => {
    const { result } = renderHook(() =>
      useStreaming('Hello world this is a test', true, 80)
    );
    // Initially should have 0 or very few words
    expect(result.current.split(' ').length).toBeLessThan(6);
  });

  test('progressively reveals words during streaming', () => {
    const { result } = renderHook(() =>
      useStreaming('Hello world this is a test with many words', true, 80)
    );

    const initialWords = result.current.split(' ').filter(Boolean).length;

    // Advance time
    act(() => { vi.advanceTimersByTime(500); });

    const laterWords = result.current.split(' ').filter(Boolean).length;
    expect(laterWords).toBeGreaterThanOrEqual(initialWords);
  });

  test('shows full content when streaming stops', () => {
    const content = 'Hello world this is a test';
    const { result, rerender } = renderHook(
      ({ isStreaming }) => useStreaming(content, isStreaming),
      { initialProps: { isStreaming: true } }
    );

    rerender({ isStreaming: false });
    expect(result.current).toBe(content);
  });
});
```

---

## 11.5 Integration Tests (`src/__tests__/`)

### Full Chat Flow Test

```typescript
// src/__tests__/AgentChat.test.tsx
import { screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithChat } from '../test-utils/render';
import { AgentChat } from '../components/AgentChat';
import { FIXTURES } from '../test-utils/fixtures';

describe('AgentChat Integration', () => {
  test('renders welcome screen when session is empty', () => {
    renderWithChat(<AgentChat welcomeTitle="Hello!" />, {
      session: FIXTURES.emptySession,
    });
    expect(screen.getByText('Hello!')).toBeInTheDocument();
  });

  test('renders messages when session has content', () => {
    renderWithChat(<AgentChat />, {
      session: FIXTURES.simpleChat,
    });
    expect(screen.getByText('Fix the login bug')).toBeInTheDocument();
    expect(screen.getByText('Test Agent')).toBeInTheDocument();
  });

  test('sends message on Enter', async () => {
    const onSendMessage = vi.fn();
    renderWithChat(<AgentChat />, {
      session: FIXTURES.emptySession,
      callbacks: { onSendMessage },
    });

    const input = screen.getByRole('textbox', { name: /chat input/i });
    await userEvent.type(input, 'Hello{enter}');
    expect(onSendMessage).toHaveBeenCalledWith('Hello', [], undefined);
  });

  test('shows cancel button during streaming', () => {
    renderWithChat(<AgentChat />, {
      session: FIXTURES.streamingChat,
    });
    expect(screen.getByLabelText(/stop|cancel/i)).toBeInTheDocument();
  });

  test('renders all content part types without crashing', () => {
    expect(() => {
      renderWithChat(<AgentChat />, {
        session: FIXTURES.allContentParts,
      });
    }).not.toThrow();
  });

  test('tool confirmation fires callback', async () => {
    const onToolAction = vi.fn();
    renderWithChat(<AgentChat />, {
      session: FIXTURES.toolConfirmation,
      callbacks: { onToolAction },
    });

    await userEvent.click(screen.getByText('Allow Once'));
    expect(onToolAction).toHaveBeenCalledWith(
      expect.any(String), // toolCallId
      'allow-once',
      'edit_file'
    );
  });

  test('followup button sends message', async () => {
    const onFollowupClick = vi.fn();
    const session = buildSession({
      messages: [
        buildRequest({ message: 'Hi' }),
        buildResponse({
          state: 'complete',
          followups: [{ id: 'f1', label: 'Tell me more', message: 'Expand on that', type: 'reply' }],
        }),
      ],
    });

    renderWithChat(<AgentChat />, { session, callbacks: { onFollowupClick } });
    await userEvent.click(screen.getByText('Tell me more'));
    expect(onFollowupClick).toHaveBeenCalledWith(expect.objectContaining({ message: 'Expand on that' }));
  });

  test('vote buttons fire callback', async () => {
    const onVote = vi.fn();
    renderWithChat(<AgentChat />, {
      session: FIXTURES.simpleChat,
      callbacks: { onVote },
    });

    await userEvent.click(screen.getByLabelText('Helpful'));
    expect(onVote).toHaveBeenCalledWith(expect.any(String), 'up');
  });
});
```

### Streaming Flow Test

```typescript
// src/__tests__/streaming.test.tsx
describe('Streaming Flow', () => {
  test('shows working indicator during pending state', () => {
    const session = buildSession({
      messages: [
        buildRequest({ message: 'Hello' }),
        buildResponse({ state: 'pending', content: [] }),
      ],
    });
    renderWithChat(<AgentChat />, { session });
    // Working indicator or animated dots should be visible
  });

  test('progressively reveals markdown during streaming', async () => {
    const session = buildStreamingConversation();
    const { rerender } = renderWithChat(<AgentChat />, { session });

    // Simulate streaming: update session with more content
    const updatedSession = {
      ...session,
      messages: [
        session.messages[0],
        {
          ...session.messages[1],
          content: [{ kind: 'markdown', content: 'This is a longer response with many words that should be progressively revealed to the user.' }],
        },
      ],
    };

    rerender(updatedSession);
    // Content should be partially visible
  });

  test('shows animated input border during streaming', () => {
    renderWithChat(<AgentChat />, { session: FIXTURES.streamingChat });
    const inputArea = screen.getByRole('textbox', { name: /chat input/i }).closest('.ac-input-area');
    expect(inputArea).toHaveClass('ac-input-area--streaming');
  });
});
```

---

## 11.6 Accessibility Tests

```typescript
// src/__tests__/accessibility.test.tsx
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  test('AgentChat has no axe violations (empty state)', async () => {
    const { container } = renderWithChat(<AgentChat />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('AgentChat has no axe violations (with messages)', async () => {
    const { container } = renderWithChat(<AgentChat />, {
      session: FIXTURES.simpleChat,
    });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('message list has correct ARIA role', () => {
    renderWithChat(<AgentChat />, { session: FIXTURES.simpleChat });
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  test('messages have listitem role', () => {
    renderWithChat(<AgentChat />, { session: FIXTURES.simpleChat });
    expect(screen.getAllByRole('listitem').length).toBeGreaterThan(0);
  });

  test('streaming response has aria-busy', () => {
    renderWithChat(<AgentChat />, { session: FIXTURES.streamingChat });
    const responses = screen.getAllByRole('listitem');
    const streamingResponse = responses.find(el => el.getAttribute('aria-busy') === 'true');
    expect(streamingResponse).toBeInTheDocument();
  });

  test('input has accessible label', () => {
    renderWithChat(<AgentChat />);
    expect(screen.getByRole('textbox', { name: /chat input/i })).toBeInTheDocument();
  });

  test('buttons have accessible labels', () => {
    renderWithChat(<AgentChat />, { session: FIXTURES.simpleChat });
    // All icon buttons should have aria-label
    const buttons = screen.getAllByRole('button');
    buttons.forEach(btn => {
      expect(
        btn.getAttribute('aria-label') || btn.textContent?.trim()
      ).toBeTruthy();
    });
  });

  test('keyboard navigation works for input', async () => {
    const onSendMessage = vi.fn();
    renderWithChat(<AgentChat />, {
      callbacks: { onSendMessage },
    });

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'test message');
    await userEvent.keyboard('{enter}');
    expect(onSendMessage).toHaveBeenCalled();
  });

  test('Escape cancels streaming', async () => {
    const onCancelResponse = vi.fn();
    renderWithChat(<AgentChat />, {
      session: FIXTURES.streamingChat,
      callbacks: { onCancelResponse },
    });

    await userEvent.keyboard('{escape}');
    expect(onCancelResponse).toHaveBeenCalled();
  });

  test('screen reader announcement on new message', () => {
    renderWithChat(<AgentChat />, { session: FIXTURES.simpleChat });
    const liveRegion = document.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeInTheDocument();
  });
});
```

---

## 11.7 Visual Snapshot Tests (Storybook)

Every component gets a `.stories.tsx` file with all visual states.

### Example: `CodeBlock.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { CodeBlock } from './CodeBlock';
import { ChatProviderDecorator } from '../../../.storybook/theme-decorator';

const meta: Meta<typeof CodeBlock> = {
  title: 'Content Parts/CodeBlock',
  component: CodeBlock,
  decorators: [ChatProviderDecorator],
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof CodeBlock>;

export const TypeScript: Story = {
  args: {
    kind: 'code',
    code: `function greet(name: string): string {\n  return \`Hello, \${name}!\`;\n}`,
    language: 'typescript',
  },
};

export const WithFilename: Story = {
  args: {
    ...TypeScript.args,
    filename: 'src/greet.ts',
  },
};

export const Python: Story = {
  args: {
    kind: 'code',
    code: `def greet(name: str) -> str:\n    return f"Hello, {name}!"`,
    language: 'python',
  },
};

export const LongCode: Story = {
  args: {
    kind: 'code',
    code: Array.from({ length: 50 }, (_, i) => `const line${i} = ${i};`).join('\n'),
    language: 'typescript',
  },
};

export const NoToolbar: Story = {
  args: {
    ...TypeScript.args,
    showToolbar: false,
  },
};
```

### Storybook Configuration

```typescript
// .storybook/preview.ts
import { darkTheme, lightTheme } from '../src/theme';
import '../src/theme/css/index.css';

export const parameters = {
  backgrounds: {
    default: 'dark',
    values: [
      { name: 'dark', value: '#1e1e1e' },
      { name: 'light', value: '#ffffff' },
    ],
  },
};

export const globalTypes = {
  theme: {
    name: 'Theme',
    defaultValue: 'dark',
    toolbar: {
      icon: 'paintbrush',
      items: ['dark', 'light'],
    },
  },
};
```

---

## 11.8 E2E Tests (Playwright)

```typescript
// e2e/chat-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Chat Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/demo'); // Storybook or demo app
  });

  test('user can send a message', async ({ page }) => {
    const input = page.getByRole('textbox', { name: /chat input/i });
    await input.fill('Hello, agent!');
    await input.press('Enter');
    await expect(page.getByText('Hello, agent!')).toBeVisible();
  });

  test('streaming response renders progressively', async ({ page }) => {
    // Trigger a streaming response via demo controls
    await page.getByTestId('trigger-streaming').click();
    // Verify animated dots appear
    await expect(page.locator('.ac-animated-dots')).toBeVisible();
    // Wait for content to appear
    await expect(page.locator('.ac-markdown')).toBeVisible({ timeout: 5000 });
  });

  test('code block copy button works', async ({ page }) => {
    await page.getByTestId('trigger-code-response').click();
    await page.getByLabelText('Copy').first().click();
    // Verify clipboard (in secure context)
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toBeTruthy();
  });

  test('theme switching works', async ({ page }) => {
    const root = page.locator('.ac-root');
    // Default dark theme
    await expect(root).toHaveCSS('background-color', 'rgb(30, 30, 30)');
    // Switch to light
    await page.getByTestId('theme-toggle').click();
    await expect(root).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  });
});

// e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('page has no accessibility violations', async ({ page }) => {
    await page.goto('http://localhost:5173/demo');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('keyboard-only navigation works', async ({ page }) => {
    await page.goto('http://localhost:5173/demo');
    // Tab to input
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBe('TEXTAREA');
  });
});
```

---

## 11.9 Test Coverage Requirements

| Category | Minimum Coverage | Target |
|----------|-----------------|--------|
| **Statements** | 80% | 90% |
| **Branches** | 75% | 85% |
| **Functions** | 80% | 90% |
| **Lines** | 80% | 90% |

### Per-module targets:

| Module | Target |
|--------|--------|
| `types/` | 100% (type guards only) |
| `hooks/` | 95% |
| `utils/` | 95% |
| `provider/` | 90% |
| `components/atoms/` | 90% |
| `components/content-parts/` | 85% |
| `components/tool-parts/` | 85% |
| `components/messages/` | 85% |
| `components/input/` | 85% |
| `components/AgentChat.tsx` | 80% |

---

## 11.10 Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-utils/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.stories.tsx',
        'src/**/*.test.{ts,tsx}',
        'src/test-utils/**',
        'src/index.ts',
      ],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
```

### Test Setup

```typescript
// src/test-utils/setup.ts
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Auto-cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock IntersectionObserver (for virtualization)
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
globalThis.IntersectionObserver = MockIntersectionObserver as any;

// Mock ResizeObserver (for auto-resize textarea)
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
globalThis.ResizeObserver = MockResizeObserver as any;

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(''),
  },
});
```
