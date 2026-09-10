/**
 * Tests for ContentPartRenderer — the central dispatcher component.
 */

import { describe, test, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { ContentPartRenderer } from './ContentPartRenderer';
import { renderWithChat } from '../../test-utils/render';
import {
  buildResponse,
  buildMarkdown,
  buildCodeBlock,
  buildThinking,
  buildProgress,
  buildEditPill,
  buildTodoList,
  buildError,
  buildConfirmation,
} from '../../test-utils/builders';
import type { ChatContentPart } from '../../types/content-parts';

function renderPart(part: ChatContentPart, isStreaming = false) {
  const response = buildResponse({ content: [part] });
  return renderWithChat(
    <ContentPartRenderer
      part={part}
      index={0}
      isStreaming={isStreaming}
      response={response}
      isLast
    />,
  );
}

describe('ContentPartRenderer', () => {
  test('renders markdown content for markdown kind', () => {
    renderPart(buildMarkdown('Hello **world**'));
    expect(screen.getByTestId('markdown-content')).toBeInTheDocument();
  });

  test('renders code block for code kind', () => {
    renderPart(buildCodeBlock('const x = 1', 'typescript'));
    expect(screen.getByTestId('code-block')).toBeInTheDocument();
  });

  test('renders thinking block for thinking kind', () => {
    renderPart(buildThinking('Analyzing...'));
    expect(screen.getByTestId('thinking-block')).toBeInTheDocument();
  });

  test('renders progress step for progress kind', () => {
    renderPart(buildProgress('Loading files', true));
    expect(screen.getByTestId('progress-step')).toBeInTheDocument();
  });

  test('renders edit pill for edit-pill kind', () => {
    renderPart(buildEditPill());
    expect(screen.getByTestId('edit-pill')).toBeInTheDocument();
  });

  test('renders todo list for todo-list kind', () => {
    renderPart(buildTodoList());
    expect(screen.getByTestId('todo-list')).toBeInTheDocument();
  });

  test('renders error message for error kind', () => {
    renderPart(buildError('Something went wrong'));
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
  });

  test('renders confirmation dialog for confirmation kind', () => {
    renderPart(buildConfirmation());
    expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument();
  });

  test('renders working indicator for working kind', () => {
    renderPart({ kind: 'working' });
    expect(screen.getByTestId('working-indicator')).toBeInTheDocument();
  });

  test('renders image content for image kind', () => {
    renderPart({ kind: 'image', src: 'test.png', alt: 'test' });
    expect(screen.getByTestId('image-content')).toBeInTheDocument();
  });

  test('renders workspace transition for workspace-transition kind', () => {
    renderPart({ kind: 'workspace-transition', workspaceName: 'my-project' });
    expect(screen.getByTestId('workspace-transition')).toBeInTheDocument();
  });

  test('renders unknown part warning in development', () => {
    const unknownPart = { kind: 'nonexistent' } as unknown as ChatContentPart;
    renderPart(unknownPart);
    expect(screen.getByText(/Unknown content part/)).toBeInTheDocument();
  });

  test('applies consumer override when provided', () => {
    const CustomMarkdown = () => <div data-testid="custom-markdown">Custom</div>;
    const response = buildResponse({ content: [buildMarkdown('test')] });
    renderWithChat(
      <ContentPartRenderer
        part={buildMarkdown('test')}
        index={0}
        isStreaming={false}
        response={response}
        isLast
      />,
      {
        config: {
          contentPartOverrides: {
            markdown: CustomMarkdown,
          },
        },
      },
    );
    expect(screen.getByTestId('custom-markdown')).toBeInTheDocument();
  });

  test('renders tool-call as ToolCallDisplay', () => {
    renderPart({
      kind: 'tool-call',
      toolId: 'read_file',
      toolCallId: 'tc-1',
      status: 'running',
      label: 'Reading file',
    });
    expect(screen.getByTestId('tool-call-display')).toBeInTheDocument();
  });
});
