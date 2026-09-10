/**
 * Tests for Phase 9 main widget components:
 * AgentChat, ChatWelcome, TodoListDock.
 */

import { describe, test, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithChat } from '../test-utils/render';
import {
  buildSession,
  buildRequest,
  buildResponse,
  buildAgent,
  buildMarkdown,
  buildTodoList,
} from '../test-utils/builders';
import { AgentChat } from './AgentChat';
import { ChatWelcome } from './ChatWelcome';
import { TodoListDock } from './TodoListDock';

// ─── AgentChat ───

describe('AgentChat', () => {
  test('renders the root widget', () => {
    renderWithChat(<AgentChat />);
    expect(screen.getByTestId('agent-chat')).toBeInTheDocument();
  });

  test('shows welcome screen when session is empty', () => {
    renderWithChat(<AgentChat />);
    expect(screen.getByTestId('chat-welcome')).toBeInTheDocument();
  });

  test('shows message list when session has messages', () => {
    const session = buildSession({
      messages: [
        buildRequest({ message: 'Hello' }),
        buildResponse({ content: [buildMarkdown('Hi!')] }),
      ],
    });
    renderWithChat(<AgentChat />, { session });
    expect(screen.getByTestId('message-list')).toBeInTheDocument();
    expect(screen.queryByTestId('chat-welcome')).not.toBeInTheDocument();
  });

  test('renders input area', () => {
    renderWithChat(<AgentChat />);
    expect(screen.getByTestId('chat-input-area')).toBeInTheDocument();
  });

  test('applies custom className', () => {
    renderWithChat(<AgentChat className="custom-chat" />);
    expect(screen.getByTestId('agent-chat')).toHaveClass('custom-chat');
  });

  test('renders custom header via renderHeader', () => {
    renderWithChat(
      <AgentChat renderHeader={() => <div data-testid="custom-header">Header</div>} />,
    );
    expect(screen.getByTestId('custom-header')).toBeInTheDocument();
  });

  test('renders custom footer via renderFooter', () => {
    renderWithChat(
      <AgentChat renderFooter={() => <div data-testid="custom-footer">Footer</div>} />,
    );
    expect(screen.getByTestId('custom-footer')).toBeInTheDocument();
  });

  test('passes welcome props to ChatWelcome', () => {
    renderWithChat(<AgentChat welcomeTitle="Ask Copilot" welcomeSubtitle="I can help with code" />);
    expect(screen.getByText('Ask Copilot')).toBeInTheDocument();
    expect(screen.getByText('I can help with code')).toBeInTheDocument();
  });

  test('shows todo list dock when todo-list part exists', () => {
    const todoList = buildTodoList();
    const session = buildSession({
      messages: [
        buildRequest({ message: 'Do tasks' }),
        buildResponse({ content: [buildMarkdown('Working on it'), todoList] }),
      ],
    });
    renderWithChat(<AgentChat />, { session, config: { showTodoList: true } });
    expect(screen.getByTestId('todo-list-dock')).toBeInTheDocument();
  });

  test('has region role with aria-label', () => {
    renderWithChat(<AgentChat />);
    expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Chat');
  });

  test('has screen reader announcement area', () => {
    renderWithChat(<AgentChat />, { config: { announceMessages: true } });
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});

// ─── ChatWelcome ───

describe('ChatWelcome', () => {
  test('renders default title', () => {
    renderWithChat(<ChatWelcome />);
    expect(screen.getByText('How can I help you?')).toBeInTheDocument();
  });

  test('renders custom title', () => {
    renderWithChat(<ChatWelcome title="Ask anything" />);
    expect(screen.getByText('Ask anything')).toBeInTheDocument();
  });

  test('renders subtitle when provided', () => {
    renderWithChat(<ChatWelcome subtitle="I can help with code" />);
    expect(screen.getByText('I can help with code')).toBeInTheDocument();
  });

  test('renders suggestion buttons', () => {
    renderWithChat(
      <ChatWelcome
        suggestions={[
          { label: 'Fix a bug', message: 'Fix the login bug' },
          { label: 'Write tests', message: 'Write unit tests' },
        ]}
      />,
    );
    expect(screen.getByText('Fix a bug')).toBeInTheDocument();
    expect(screen.getByText('Write tests')).toBeInTheDocument();
  });

  test('fires sendMessage when suggestion clicked', async () => {
    const user = userEvent.setup();
    const onSendMessage = vi.fn();

    renderWithChat(<ChatWelcome suggestions={[{ label: 'Help me', message: 'I need help' }]} />, {
      callbacks: { onSendMessage },
    });

    await user.click(screen.getByText('Help me'));
    expect(onSendMessage).toHaveBeenCalledWith('I need help', undefined, undefined);
  });

  test('renders suggestion icon when provided', () => {
    renderWithChat(
      <ChatWelcome suggestions={[{ label: 'Debug', message: 'Debug code', icon: '🐛' }]} />,
    );
    expect(screen.getByText('🐛')).toBeInTheDocument();
  });

  test('shows active agent avatar when available', () => {
    renderWithChat(<ChatWelcome />, {
      activeAgent: buildAgent({ name: 'Copilot', icon: '✨' }),
    });
    // Avatar renders with agent name
    expect(screen.getByTestId('chat-welcome')).toBeInTheDocument();
  });

  test('shows default icon when no active agent', () => {
    renderWithChat(<ChatWelcome />);
    expect(screen.getByText('💬')).toBeInTheDocument();
  });
});

// ─── TodoListDock ───

describe('TodoListDock', () => {
  const items = [
    { id: 1, title: 'Explore codebase', status: 'completed' as const },
    { id: 2, title: 'Fix the bug', status: 'in-progress' as const },
    { id: 3, title: 'Write tests', status: 'not-started' as const },
  ];

  test('renders todo dock with items', () => {
    renderWithChat(<TodoListDock items={items} />);
    expect(screen.getByTestId('todo-list-dock')).toBeInTheDocument();
  });

  test('renders all todo items', () => {
    renderWithChat(<TodoListDock items={items} />);
    expect(screen.getByText('Explore codebase')).toBeInTheDocument();
    expect(screen.getByText('Fix the bug')).toBeInTheDocument();
    expect(screen.getByText('Write tests')).toBeInTheDocument();
  });

  test('shows pending count badge', () => {
    renderWithChat(<TodoListDock items={items} />);
    // 2 items are not completed
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  test('toggles expand/collapse on header click', async () => {
    const user = userEvent.setup();
    renderWithChat(<TodoListDock items={items} />);

    // Initially expanded
    expect(screen.getByText('Explore codebase')).toBeInTheDocument();

    // Click to collapse
    await user.click(screen.getByLabelText(/Todos/));
    expect(screen.queryByText('Explore codebase')).not.toBeInTheDocument();

    // Click to expand again
    await user.click(screen.getByLabelText(/Todos/));
    expect(screen.getByText('Explore codebase')).toBeInTheDocument();
  });

  test('closes dock on close button click', async () => {
    const user = userEvent.setup();
    renderWithChat(<TodoListDock items={items} />);

    await user.click(screen.getByLabelText('Close'));
    expect(screen.queryByTestId('todo-list-dock')).not.toBeInTheDocument();
  });

  test('returns null when no items', () => {
    const { container } = renderWithChat(<TodoListDock items={[]} />);
    expect(container.querySelector('.ac-todo-dock')).not.toBeInTheDocument();
  });

  test('applies done styling to completed items', () => {
    const { container } = renderWithChat(<TodoListDock items={items} />);
    const doneItems = container.querySelectorAll('.ac-todo-dock__item-title--done');
    expect(doneItems).toHaveLength(1);
  });

  test('has accessible toggle button', () => {
    renderWithChat(<TodoListDock items={items} />);
    const toggle = screen.getByLabelText(/Todos, 2 remaining/);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });
});
