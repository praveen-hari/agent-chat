/**
 * Tests for ToolCallDisplay — the orchestrator component.
 */

import { describe, test, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { ToolCallDisplay } from './ToolCallDisplay';
import { renderWithChat } from '../../test-utils/render';

describe('ToolCallDisplay', () => {
  test('renders streaming state with shimmer', () => {
    renderWithChat(
      <ToolCallDisplay
        kind="tool-call"
        toolId="read_file"
        toolCallId="tc-1"
        status="streaming"
        isStreaming
      />,
    );
    expect(screen.getByTestId('tool-call-display')).toBeInTheDocument();
    expect(screen.getByTestId('tool-streaming')).toBeInTheDocument();
  });

  test('renders confirming state with confirmation dialog', () => {
    renderWithChat(
      <ToolCallDisplay
        kind="tool-call"
        toolId="edit_file"
        toolCallId="tc-2"
        status="confirming"
        label="Edit utils.ts"
        riskLevel="medium"
        isStreaming={false}
      />,
    );
    expect(screen.getByTestId('tool-confirmation')).toBeInTheDocument();
  });

  test('renders running state as progress', () => {
    renderWithChat(
      <ToolCallDisplay
        kind="tool-call"
        toolId="read_file"
        toolCallId="tc-3"
        status="running"
        label="Reading auth.ts"
        isStreaming={false}
      />,
    );
    expect(screen.getByTestId('progress-step')).toBeInTheDocument();
  });

  test('renders terminal tool as terminal display when running', () => {
    renderWithChat(
      <ToolCallDisplay
        kind="tool-call"
        toolId="run_in_terminal"
        toolCallId="tc-4"
        status="running"
        label="npm test"
        isStreaming={false}
      />,
    );
    expect(screen.getByTestId('terminal-tool-display')).toBeInTheDocument();
  });

  test('renders complete state as single-line progress step', () => {
    renderWithChat(
      <ToolCallDisplay
        kind="tool-call"
        toolId="read_file"
        toolCallId="tc-5"
        status="complete"
        label="Done reading"
        output="file contents..."
        isStreaming={false}
      />,
    );
    expect(screen.getByTestId('progress-step')).toBeInTheDocument();
  });

  test('renders MCP app when mcpApp is provided', () => {
    renderWithChat(
      <ToolCallDisplay
        kind="tool-call"
        toolId="mcp_tool"
        toolCallId="tc-6"
        status="complete"
        mcpApp={{ html: '<div>Hello</div>' }}
        isStreaming={false}
      />,
    );
    expect(screen.getByTestId('mcp-app-display')).toBeInTheDocument();
  });

  test('renders failed state as progress step', () => {
    renderWithChat(
      <ToolCallDisplay
        kind="tool-call"
        toolId="read_file"
        toolCallId="tc-7"
        status="failed"
        label="Read failed"
        isStreaming={false}
      />,
    );
    expect(screen.getByTestId('progress-step')).toBeInTheDocument();
  });
});
