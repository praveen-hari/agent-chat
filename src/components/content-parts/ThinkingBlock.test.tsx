/**
 * Tests for ThinkingBlock component.
 */

import { describe, test, expect } from 'vitest';
import { screen } from '@testing-library/react';
// userEvent import removed — tests rely on default expanded state
import { ThinkingBlock } from './ThinkingBlock';
import { renderWithChat } from '../../test-utils/render';

describe('ThinkingBlock', () => {
  test('renders thinking block with content', () => {
    renderWithChat(
      <ThinkingBlock kind="thinking" content="Analyzing the code..." isStreaming={false} />,
    );
    expect(screen.getByTestId('thinking-block')).toBeInTheDocument();
  });

  test('extracts title from bold text', () => {
    renderWithChat(
      <ThinkingBlock
        kind="thinking"
        content="**Planning** the approach to fix this bug"
        isStreaming={false}
      />,
    );
    expect(screen.getByText('Planning')).toBeInTheDocument();
  });

  test('uses explicit title when provided', () => {
    renderWithChat(
      <ThinkingBlock
        kind="thinking"
        content="Some content"
        title="Custom Title"
        isStreaming={false}
      />,
    );
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  test('shows spinner when streaming', () => {
    renderWithChat(<ThinkingBlock kind="thinking" content="Working..." isStreaming />);
    expect(screen.getByText('Thinking…')).toBeInTheDocument();
  });

  test('applies active class when streaming', () => {
    renderWithChat(<ThinkingBlock kind="thinking" content="Working..." isStreaming />);
    expect(screen.getByTestId('thinking-block')).toHaveClass('ac-thinking--active');
  });

  test('renders nested tool calls when expanded', () => {
    renderWithChat(
      <ThinkingBlock
        kind="thinking"
        content="Analyzing..."
        isStreaming
        nestedToolCalls={[
          { id: '1', toolId: 'read_file', label: 'Reading auth.ts', status: 'complete' },
          { id: '2', toolId: 'grep', label: 'Searching code', status: 'running' },
        ]}
      />,
    );
    // Block auto-expands when streaming
    expect(screen.getByText('Reading auth.ts')).toBeInTheDocument();
    expect(screen.getByText('Searching code')).toBeInTheDocument();
  });

  test('renders nested edit pills when expanded', () => {
    renderWithChat(
      <ThinkingBlock
        kind="thinking"
        content="Editing files..."
        isStreaming
        nestedEditPills={[
          { filename: 'src/auth.ts', status: 'modified', linesAdded: 5, linesRemoved: 2 },
        ]}
      />,
    );
    // Block auto-expands when streaming
    expect(screen.getByText('src/auth.ts')).toBeInTheDocument();
    expect(screen.getByText('+5')).toBeInTheDocument();
    expect(screen.getByText('-2')).toBeInTheDocument();
  });

  test('shows aggregate diff subtitle', () => {
    renderWithChat(
      <ThinkingBlock
        kind="thinking"
        content="Done"
        isStreaming={false}
        aggregateDiff={{ added: 42, removed: 18 }}
      />,
    );
    expect(screen.getByText('+42 -18')).toBeInTheDocument();
  });

  test('shows reasoning content when expanded (streaming)', () => {
    renderWithChat(
      <ThinkingBlock
        kind="thinking"
        content="I need to analyze the login code to find the bug."
        isStreaming
      />,
    );
    expect(screen.getByTestId('thinking-reasoning')).toHaveTextContent(
      'I need to analyze the login code to find the bug.',
    );
  });
});
