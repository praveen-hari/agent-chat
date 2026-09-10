/**
 * Tests for message layout components:
 * MessageHeader, RequestRow, ResponseRow, ResponseFooter,
 * AttachmentsRow, MessageList.
 */

import { describe, test, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithChat } from '../../test-utils/render';
import {
  buildRequest,
  buildResponse,
  buildSession,
  buildAgent,
  buildMarkdown,
  buildFollowup,
} from '../../test-utils/builders';
import { MessageHeader } from './MessageHeader';
import { RequestRow } from './RequestRow';
import { ResponseRow } from './ResponseRow';
import { ResponseFooter } from './ResponseFooter';
import { AttachmentsRow } from './AttachmentsRow';
import { MessageList } from './MessageList';
import type { FileAttachment, ImageAttachment } from '../../types/models';

// ─── MessageHeader ───

describe('MessageHeader', () => {
  test('renders avatar and username', () => {
    renderWithChat(<MessageHeader avatar="🤖" username="Assistant" />);
    expect(screen.getByText('Assistant')).toBeInTheDocument();
  });

  test('renders detail text', () => {
    renderWithChat(<MessageHeader avatar="🤖" username="Agent" detail="Using read_file..." />);
    expect(screen.getByText('Using read_file...')).toBeInTheDocument();
  });

  test('renders toolbar actions', () => {
    renderWithChat(
      <MessageHeader
        avatar="👤"
        username="User"
        actions={<button data-testid="custom-action">Act</button>}
      />,
    );
    expect(screen.getByTestId('custom-action')).toBeInTheDocument();
  });
});

// ─── RequestRow ───

describe('RequestRow', () => {
  test('renders user message content', () => {
    const request = buildRequest({ message: 'Fix the login bug' });
    renderWithChat(<RequestRow request={request} isLast />);
    expect(screen.getByTestId('request-row')).toBeInTheDocument();
    expect(screen.getByText('You')).toBeInTheDocument();
  });

  test('renders request origin pill when present', () => {
    const request = buildRequest({
      origin: { label: 'From Debug Console', icon: '🐛' },
    });
    renderWithChat(<RequestRow request={request} isLast />);
    expect(screen.getByText('From Debug Console')).toBeInTheDocument();
  });

  test('renders attachments when present', () => {
    const attachment: FileAttachment = {
      type: 'file',
      id: 'att-1',
      filename: 'auth.ts',
      uri: 'file:///auth.ts',
    };
    const request = buildRequest({ attachments: [attachment] });
    renderWithChat(<RequestRow request={request} isLast />);
    expect(screen.getByText('auth.ts')).toBeInTheDocument();
  });

  test('shows edit button when onEditRequest callback exists', () => {
    const request = buildRequest();
    renderWithChat(<RequestRow request={request} isLast />, {
      callbacks: { onEditRequest: vi.fn() },
    });
    expect(screen.getByLabelText('Edit')).toBeInTheDocument();
  });

  test('shows delete button when onDeleteRequest callback exists', () => {
    const request = buildRequest();
    renderWithChat(<RequestRow request={request} isLast />, {
      callbacks: { onDeleteRequest: vi.fn() },
    });
    expect(screen.getByLabelText('Delete')).toBeInTheDocument();
  });

  test('has listitem role', () => {
    renderWithChat(<RequestRow request={buildRequest()} isLast />);
    expect(screen.getByRole('listitem')).toBeInTheDocument();
  });
});

// ─── ResponseRow ───

describe('ResponseRow', () => {
  test('renders response with agent name', () => {
    const response = buildResponse({
      agent: buildAgent({ name: 'Copilot', icon: '✨' }),
    });
    renderWithChat(<ResponseRow response={response} isLast />);
    // Agent name appears in both header and footer — check header specifically
    const header = screen.getByTestId('message-header');
    expect(header).toHaveTextContent('Copilot');
  });

  test('renders content parts', () => {
    const response = buildResponse({
      content: [buildMarkdown('Hello **world**')],
    });
    renderWithChat(<ResponseRow response={response} isLast />);
    expect(screen.getByTestId('markdown-content')).toBeInTheDocument();
  });

  test('shows error message when response failed', () => {
    const response = buildResponse({
      state: 'failed',
      error: { message: 'Rate limit exceeded', level: 'error' },
    });
    renderWithChat(<ResponseRow response={response} isLast />);
    expect(screen.getByText('Rate limit exceeded')).toBeInTheDocument();
  });

  test('shows cancel button when streaming', () => {
    const response = buildResponse({ state: 'streaming' });
    renderWithChat(<ResponseRow response={response} isLast />);
    expect(screen.getByLabelText('Cancel')).toBeInTheDocument();
  });

  test('shows retry button when not streaming', () => {
    const response = buildResponse({ state: 'complete' });
    renderWithChat(<ResponseRow response={response} isLast />, {
      callbacks: { onRetryResponse: vi.fn() },
    });
    expect(screen.getByLabelText('Retry')).toBeInTheDocument();
  });

  test('renders followup buttons when complete and last', () => {
    const response = buildResponse({
      state: 'complete',
      followups: [buildFollowup({ label: 'Tell me more' }), buildFollowup({ label: 'Run tests' })],
    });
    renderWithChat(<ResponseRow response={response} isLast />);
    expect(screen.getByText('Tell me more')).toBeInTheDocument();
    expect(screen.getByText('Run tests')).toBeInTheDocument();
  });

  test('hides followups when not last', () => {
    const response = buildResponse({
      state: 'complete',
      followups: [buildFollowup({ label: 'Should be hidden' })],
    });
    renderWithChat(<ResponseRow response={response} isLast={false} />);
    expect(screen.queryByText('Should be hidden')).not.toBeInTheDocument();
  });

  test('sets aria-busy when streaming', () => {
    const response = buildResponse({ state: 'streaming' });
    renderWithChat(<ResponseRow response={response} isLast />);
    expect(screen.getByTestId('response-row')).toHaveAttribute('aria-busy', 'true');
  });

  test('renders response footer when complete and last', () => {
    const response = buildResponse({ state: 'complete' });
    renderWithChat(<ResponseRow response={response} isLast />);
    expect(screen.getByTestId('response-footer')).toBeInTheDocument();
  });
});

// ─── ResponseFooter ───

describe('ResponseFooter', () => {
  test('renders copy button when showCopyButton is true', () => {
    const response = buildResponse({ state: 'complete' });
    renderWithChat(<ResponseFooter response={response} />, {
      config: { showCopyButton: true },
    });
    expect(screen.getByLabelText('Copy Response')).toBeInTheDocument();
  });

  test('renders vote buttons when onVote callback exists', () => {
    const response = buildResponse({ state: 'complete' });
    renderWithChat(<ResponseFooter response={response} />, {
      config: { showVoteButtons: true },
      callbacks: { onVote: vi.fn() },
    });
    expect(screen.getByLabelText('Helpful')).toBeInTheDocument();
    expect(screen.getByLabelText('Not Helpful')).toBeInTheDocument();
  });

  test('fires onVote when vote button clicked', async () => {
    const user = userEvent.setup();
    const onVote = vi.fn();
    const response = buildResponse({ state: 'complete', id: 'resp-1' });

    renderWithChat(<ResponseFooter response={response} />, {
      config: { showVoteButtons: true },
      callbacks: { onVote },
    });

    await user.click(screen.getByLabelText('Helpful'));
    expect(onVote).toHaveBeenCalledWith('resp-1', 'up');
  });

  test('shows agent name in details', () => {
    const response = buildResponse({
      state: 'complete',
      agent: buildAgent({ name: 'Copilot' }),
    });
    renderWithChat(<ResponseFooter response={response} />, {
      config: { showResponseDetails: true },
    });
    expect(screen.getByText('Copilot')).toBeInTheDocument();
  });

  test('shows elapsed time in details', () => {
    const response = buildResponse({
      state: 'complete',
      elapsedMs: 2500,
    });
    renderWithChat(<ResponseFooter response={response} />, {
      config: { showResponseDetails: true },
    });
    expect(screen.getByText('2.5s')).toBeInTheDocument();
  });

  test('shows token usage when enabled', () => {
    const response = buildResponse({
      state: 'complete',
      usage: { promptTokens: 100, completionTokens: 200, totalTokens: 300 },
    });
    renderWithChat(<ResponseFooter response={response} />, {
      config: { showResponseDetails: true, showTokenUsage: true },
    });
    expect(screen.getByText(/300 tokens/)).toBeInTheDocument();
  });
});

// ─── AttachmentsRow ───

describe('AttachmentsRow', () => {
  test('renders file attachment as chip', () => {
    const att: FileAttachment = {
      type: 'file',
      id: '1',
      filename: 'utils.ts',
      uri: 'file:///utils.ts',
    };
    renderWithChat(<AttachmentsRow attachments={[att]} />);
    expect(screen.getByText('utils.ts')).toBeInTheDocument();
  });

  test('renders image attachment', () => {
    const att: ImageAttachment = {
      type: 'image',
      id: '2',
      filename: 'screenshot.png',
      src: 'data:image/png;base64,...',
    };
    renderWithChat(<AttachmentsRow attachments={[att]} />);
    expect(screen.getByText('screenshot.png')).toBeInTheDocument();
  });

  test('renders multiple attachments', () => {
    const atts = [
      { type: 'file' as const, id: '1', filename: 'a.ts', uri: 'file:///a.ts' },
      { type: 'file' as const, id: '2', filename: 'b.ts', uri: 'file:///b.ts' },
    ];
    renderWithChat(<AttachmentsRow attachments={atts} />);
    expect(screen.getByText('a.ts')).toBeInTheDocument();
    expect(screen.getByText('b.ts')).toBeInTheDocument();
  });

  test('fires onFileOpen when file chip is clicked', async () => {
    const user = userEvent.setup();
    const onFileOpen = vi.fn();
    const att: FileAttachment = {
      type: 'file',
      id: '1',
      filename: 'utils.ts',
      uri: 'file:///utils.ts',
    };

    renderWithChat(<AttachmentsRow attachments={[att]} />, {
      callbacks: { onFileOpen },
    });

    await user.click(screen.getByText('utils.ts'));
    expect(onFileOpen).toHaveBeenCalledWith('file:///utils.ts');
  });
});

// ─── MessageList ───

describe('MessageList', () => {
  test('renders empty list', () => {
    renderWithChat(<MessageList />);
    expect(screen.getByTestId('message-list')).toBeInTheDocument();
  });

  test('renders request and response rows', () => {
    const session = buildSession({
      messages: [
        buildRequest({ message: 'Hello' }),
        buildResponse({ content: [buildMarkdown('Hi there!')] }),
      ],
    });
    renderWithChat(<MessageList />, { session });
    expect(screen.getByTestId('request-row')).toBeInTheDocument();
    expect(screen.getByTestId('response-row')).toBeInTheDocument();
  });

  test('has log role and aria-label', () => {
    renderWithChat(<MessageList />);
    const list = screen.getByTestId('message-list');
    expect(list).toHaveAttribute('role', 'log');
    expect(list).toHaveAttribute('aria-label', 'Chat');
  });

  test('renders multiple message pairs', () => {
    const session = buildSession({
      messages: [
        buildRequest({ id: 'r1', message: 'First' }),
        buildResponse({ id: 'a1', requestId: 'r1' }),
        buildRequest({ id: 'r2', message: 'Second' }),
        buildResponse({ id: 'a2', requestId: 'r2' }),
      ],
    });
    renderWithChat(<MessageList />, { session });
    const requestRows = screen.getAllByTestId('request-row');
    const responseRows = screen.getAllByTestId('response-row');
    expect(requestRows).toHaveLength(2);
    expect(responseRows).toHaveLength(2);
  });
});
