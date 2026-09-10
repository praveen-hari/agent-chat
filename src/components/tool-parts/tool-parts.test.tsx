/**
 * Tests for tool sub-components:
 * ToolStreaming, ToolConfirmation, ToolProgress, TerminalToolDisplay,
 * ToolConfirmationCarousel, McpAppDisplay.
 */

import { describe, test, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithChat } from '../../test-utils/render';
import { ToolStreaming } from './ToolStreaming';
import { ToolConfirmation } from './ToolConfirmation';
import { ToolProgress } from './ToolProgress';
import { TerminalToolDisplay } from './TerminalToolDisplay';
import { ToolConfirmationCarousel } from './ToolConfirmationCarousel';
import { McpAppDisplay } from './McpAppDisplay';

// ─── ToolStreaming ───

describe('ToolStreaming', () => {
  test('renders streaming progress with tool name', () => {
    renderWithChat(<ToolStreaming toolId="read_file" toolCallId="tc-1" />);
    expect(screen.getByTestId('tool-streaming')).toBeInTheDocument();
    expect(screen.getByText(/Preparing read_file/)).toBeInTheDocument();
  });

  test('uses progress message when provided', () => {
    renderWithChat(
      <ToolStreaming
        toolId="read_file"
        toolCallId="tc-1"
        progressMessage="Reading file contents"
      />,
    );
    expect(screen.getByText(/Reading file contents/)).toBeInTheDocument();
  });

  test('resolves icon based on toolId', () => {
    renderWithChat(<ToolStreaming toolId="grep_search" toolCallId="tc-2" />);
    expect(screen.getByTestId('tool-streaming')).toBeInTheDocument();
  });
});

// ─── ToolConfirmation ───

describe('ToolConfirmation', () => {
  test('renders title and message', () => {
    renderWithChat(
      <ToolConfirmation
        kind="tool-confirmation"
        toolId="edit_file"
        toolCallId="tc-1"
        title="Edit utils.ts"
        message="Replace legacy helpers"
        actions={[{ id: 'allow', label: 'Allow', primary: true }]}
      />,
    );
    expect(screen.getByText('Edit utils.ts')).toBeInTheDocument();
    expect(screen.getByText('Replace legacy helpers')).toBeInTheDocument();
  });

  test('renders risk badge when riskLevel provided', () => {
    renderWithChat(
      <ToolConfirmation
        kind="tool-confirmation"
        toolId="edit_file"
        toolCallId="tc-1"
        title="Edit file"
        message="Modifying code"
        riskLevel="high"
        actions={[{ id: 'allow', label: 'Allow', primary: true }]}
      />,
    );
    expect(screen.getByLabelText('High risk')).toBeInTheDocument();
  });

  test('renders subtitle when provided', () => {
    renderWithChat(
      <ToolConfirmation
        kind="tool-confirmation"
        toolId="edit_file"
        toolCallId="tc-1"
        title="Title"
        message="Message"
        subtitle="src/utils.ts"
        actions={[]}
      />,
    );
    expect(screen.getByText('src/utils.ts')).toBeInTheDocument();
  });

  test('fires onToolAction when action button clicked', async () => {
    const user = userEvent.setup();
    const onToolAction = vi.fn();

    renderWithChat(
      <ToolConfirmation
        kind="tool-confirmation"
        toolId="edit_file"
        toolCallId="tc-1"
        title="Edit"
        message="Confirm"
        actions={[
          { id: 'allow-once', label: 'Allow Once', primary: true, keybinding: '⌘Enter' },
          { id: 'skip', label: 'Skip' },
        ]}
      />,
      { callbacks: { onToolAction } },
    );

    await user.click(screen.getByText('Allow Once'));
    expect(onToolAction).toHaveBeenCalledWith('tc-1', 'allow-once', 'edit_file');
  });

  test('renders keybinding hints', () => {
    renderWithChat(
      <ToolConfirmation
        kind="tool-confirmation"
        toolId="tool"
        toolCallId="tc-1"
        title="T"
        message="M"
        actions={[{ id: 'ok', label: 'OK', keybinding: '⌘Enter' }]}
      />,
    );
    expect(screen.getByText('⌘Enter')).toBeInTheDocument();
  });

  test('renders dropdown arrow for actions with children', () => {
    const { container } = renderWithChat(
      <ToolConfirmation
        kind="tool-confirmation"
        toolId="tool"
        toolCallId="tc-1"
        title="T"
        message="M"
        actions={[
          {
            id: 'allow',
            label: 'Allow',
            primary: true,
            children: [{ id: 'always', label: 'Always Allow' }],
          },
        ]}
      />,
    );
    expect(container.querySelector('.ac-btn__dropdown-arrow')).toBeInTheDocument();
  });

  test('renders collapsible input when provided', () => {
    renderWithChat(
      <ToolConfirmation
        kind="tool-confirmation"
        toolId="tool"
        toolCallId="tc-1"
        title="T"
        message="M"
        input='{"path": "src/test.ts"}'
        actions={[]}
      />,
    );
    expect(screen.getByText('Tool Input')).toBeInTheDocument();
  });
});

// ─── ToolProgress ───

describe('ToolProgress', () => {
  test('renders tool label', () => {
    renderWithChat(
      <ToolProgress
        toolId="read_file"
        toolCallId="tc-1"
        status="running"
        label="Reading auth.ts"
      />,
    );
    expect(screen.getByText(/Reading auth.ts/)).toBeInTheDocument();
  });

  test('shows loading state when running', () => {
    renderWithChat(<ToolProgress toolId="read_file" toolCallId="tc-1" status="running" />);
    expect(screen.getByTestId('tool-progress')).toBeInTheDocument();
  });

  test('shows complete state', () => {
    renderWithChat(
      <ToolProgress toolId="read_file" toolCallId="tc-1" status="complete" label="Read complete" />,
    );
    expect(screen.getByText(/Complete/)).toBeInTheDocument();
  });

  test('falls back to toolId when no label provided', () => {
    renderWithChat(<ToolProgress toolId="custom_tool" toolCallId="tc-1" status="running" />);
    expect(screen.getByText(/custom_tool/)).toBeInTheDocument();
  });
});

// ─── TerminalToolDisplay ───

describe('TerminalToolDisplay', () => {
  test('renders command', () => {
    renderWithChat(
      <TerminalToolDisplay
        kind="terminal-command"
        command="npm test"
        output="All tests passed"
        exitCode={0}
        isRunning={false}
      />,
    );
    expect(screen.getByText(/npm test/)).toBeInTheDocument();
  });

  test('shows exit code badge for completed command', () => {
    renderWithChat(
      <TerminalToolDisplay
        kind="terminal-command"
        command="npm test"
        output="passed"
        exitCode={0}
        isRunning={false}
      />,
    );
    expect(screen.getByLabelText('Exit code 0')).toBeInTheDocument();
  });

  test('shows error exit code', () => {
    renderWithChat(
      <TerminalToolDisplay
        kind="terminal-command"
        command="npm test"
        output="failed"
        exitCode={1}
        isRunning={false}
      />,
    );
    expect(screen.getByLabelText('Exit code 1')).toBeInTheDocument();
  });

  test('shows spinner when running', () => {
    renderWithChat(
      <TerminalToolDisplay
        kind="terminal-command"
        command="npm start"
        output=""
        exitCode={null}
        isRunning
      />,
    );
    // PixelSpinner renders with aria-label
    expect(screen.getByLabelText('Running')).toBeInTheDocument();
  });

  test('shows background button when running', () => {
    renderWithChat(
      <TerminalToolDisplay
        kind="terminal-command"
        command="npm start"
        output=""
        exitCode={null}
        isRunning
      />,
    );
    expect(screen.getByLabelText('Continue in Background')).toBeInTheDocument();
  });

  test('fires onTerminalFocus when focus button clicked', async () => {
    const user = userEvent.setup();
    const onTerminalFocus = vi.fn();

    renderWithChat(
      <TerminalToolDisplay
        kind="terminal-command"
        command="npm test"
        output="done"
        exitCode={0}
        isRunning={false}
      />,
      { callbacks: { onTerminalFocus } },
    );

    await user.click(screen.getByLabelText('Focus Terminal'));
    expect(onTerminalFocus).toHaveBeenCalledWith('npm test');
  });

  test('renders output text', () => {
    renderWithChat(
      <TerminalToolDisplay
        kind="terminal-command"
        command="echo hello"
        output="hello"
        exitCode={0}
        isRunning={false}
      />,
    );
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  test('renders cwd when provided', () => {
    renderWithChat(
      <TerminalToolDisplay
        kind="terminal-command"
        command="ls"
        output=""
        exitCode={0}
        isRunning={false}
        cwd="/Users/dev/project"
      />,
    );
    expect(screen.getByText(/\/Users\/dev\/project/)).toBeInTheDocument();
  });

  test('toggle expand/collapse output', async () => {
    const user = userEvent.setup();
    renderWithChat(
      <TerminalToolDisplay
        kind="terminal-command"
        command="cat file.txt"
        output="line1\nline2\nline3"
        exitCode={0}
        isRunning={false}
      />,
    );

    const toggleBtn = screen.getByLabelText('Expand Output');
    await user.click(toggleBtn);
    expect(screen.getByLabelText('Collapse Output')).toBeInTheDocument();
  });
});

// ─── ToolConfirmationCarousel ───

describe('ToolConfirmationCarousel', () => {
  const tools = [
    {
      kind: 'tool-confirmation' as const,
      toolId: 'edit_file',
      toolCallId: 'tc-1',
      title: 'Edit auth.ts',
      message: 'Modify authentication',
      actions: [{ id: 'allow', label: 'Allow', primary: true }],
    },
    {
      kind: 'tool-confirmation' as const,
      toolId: 'edit_file',
      toolCallId: 'tc-2',
      title: 'Edit utils.ts',
      message: 'Update utilities',
      actions: [{ id: 'allow', label: 'Allow', primary: true }],
    },
  ];

  test('renders current tool confirmation', () => {
    renderWithChat(
      <ToolConfirmationCarousel kind="tool-confirmation-carousel" tools={tools} currentIndex={0} />,
    );
    expect(screen.getByText('Edit auth.ts')).toBeInTheDocument();
  });

  test('shows navigation counter', () => {
    renderWithChat(
      <ToolConfirmationCarousel kind="tool-confirmation-carousel" tools={tools} currentIndex={0} />,
    );
    expect(screen.getByText('1 of 2')).toBeInTheDocument();
  });

  test('renders second tool when index is 1', () => {
    renderWithChat(
      <ToolConfirmationCarousel kind="tool-confirmation-carousel" tools={tools} currentIndex={1} />,
    );
    expect(screen.getByText('Edit utils.ts')).toBeInTheDocument();
    expect(screen.getByText('2 of 2')).toBeInTheDocument();
  });

  test('returns null for empty tools array', () => {
    const { container } = renderWithChat(
      <ToolConfirmationCarousel kind="tool-confirmation-carousel" tools={[]} currentIndex={0} />,
    );
    expect(container.querySelector('.ac-tool-confirmation-carousel')).not.toBeInTheDocument();
  });
});

// ─── McpAppDisplay ───

describe('McpAppDisplay', () => {
  test('renders tool title', () => {
    renderWithChat(
      <McpAppDisplay
        toolId="mcp_chart"
        toolCallId="tc-1"
        mcpApp={{ html: '<div>Chart</div>' }}
        status="complete"
      />,
    );
    expect(screen.getByText('mcp_chart')).toBeInTheDocument();
  });

  test('renders iframe with HTML content', () => {
    const { container } = renderWithChat(
      <McpAppDisplay
        toolId="mcp_tool"
        toolCallId="tc-1"
        mcpApp={{ html: '<div>Hello</div>' }}
        status="complete"
      />,
    );
    const iframe = container.querySelector('iframe');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('sandbox', 'allow-scripts');
  });

  test('shows loading state when running with no HTML', () => {
    renderWithChat(
      <McpAppDisplay toolId="mcp_tool" toolCallId="tc-1" mcpApp={{ html: '' }} status="running" />,
    );
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  test('renders resource chips', () => {
    renderWithChat(
      <McpAppDisplay
        toolId="mcp_tool"
        toolCallId="tc-1"
        mcpApp={{
          html: '<div>Content</div>',
          resources: [
            { name: 'data.csv', uri: 'https://example.com/data.csv', mimeType: 'text/csv' },
          ],
        }}
        status="complete"
      />,
    );
    expect(screen.getByText('data.csv')).toBeInTheDocument();
  });
});
