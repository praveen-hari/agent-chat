/**
 * Tests for input area components:
 * ChatTextarea, AttachmentBar, InputToolbar, InputNotice, ChatInputArea.
 */

import { describe, test, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithChat } from '../../test-utils/render';
import { ChatTextarea } from './ChatTextarea';
import { AttachmentBar } from './AttachmentBar';
import { InputToolbar } from './InputToolbar';
import { InputNotice } from './InputNotice';
import { ChatInputArea } from './ChatInputArea';
import type { FileAttachment } from '../../types/models';

// ─── ChatTextarea ───

describe('ChatTextarea', () => {
  test('renders textarea with placeholder', () => {
    renderWithChat(
      <ChatTextarea value="" onChange={vi.fn()} onSubmit={vi.fn()} placeholder="Type here..." />,
    );
    expect(screen.getByPlaceholderText('Type here...')).toBeInTheDocument();
  });

  test('calls onChange when typing', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithChat(<ChatTextarea value="" onChange={onChange} onSubmit={vi.fn()} />);
    await user.type(screen.getByTestId('chat-textarea'), 'hello');
    expect(onChange).toHaveBeenCalled();
  });

  test('calls onSubmit on Enter key', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithChat(<ChatTextarea value="test message" onChange={vi.fn()} onSubmit={onSubmit} />);
    await user.type(screen.getByTestId('chat-textarea'), '{Enter}');
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  test('does not submit on Shift+Enter', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithChat(<ChatTextarea value="test" onChange={vi.fn()} onSubmit={onSubmit} />);
    await user.type(screen.getByTestId('chat-textarea'), '{Shift>}{Enter}{/Shift}');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('calls onEscape on Escape key', async () => {
    const user = userEvent.setup();
    const onEscape = vi.fn();
    renderWithChat(
      <ChatTextarea value="" onChange={vi.fn()} onSubmit={vi.fn()} onEscape={onEscape} />,
    );
    await user.type(screen.getByTestId('chat-textarea'), '{Escape}');
    expect(onEscape).toHaveBeenCalledOnce();
  });

  test('disables textarea when disabled prop is true', () => {
    renderWithChat(<ChatTextarea value="" onChange={vi.fn()} onSubmit={vi.fn()} disabled />);
    expect(screen.getByTestId('chat-textarea')).toBeDisabled();
  });

  test('has accessible label', () => {
    renderWithChat(<ChatTextarea value="" onChange={vi.fn()} onSubmit={vi.fn()} />);
    expect(screen.getByLabelText('Chat input')).toBeInTheDocument();
  });

  test('does not submit when value is empty', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithChat(<ChatTextarea value="" onChange={vi.fn()} onSubmit={onSubmit} />);
    await user.type(screen.getByTestId('chat-textarea'), '{Enter}');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('does not submit when streaming', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithChat(
      <ChatTextarea value="hello" onChange={vi.fn()} onSubmit={onSubmit} isStreaming />,
    );
    await user.type(screen.getByTestId('chat-textarea'), '{Enter}');
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

// ─── AttachmentBar ───

describe('AttachmentBar', () => {
  test('renders nothing when no attachments', () => {
    const { container } = renderWithChat(<AttachmentBar attachments={[]} onRemove={vi.fn()} />);
    expect(container.querySelector('.ac-attachment-bar')).not.toBeInTheDocument();
  });

  test('renders attachment chips', () => {
    const atts: FileAttachment[] = [
      { type: 'file', id: '1', filename: 'test.ts', uri: 'file:///test.ts' },
    ];
    renderWithChat(<AttachmentBar attachments={atts} onRemove={vi.fn()} />);
    expect(screen.getByText('test.ts')).toBeInTheDocument();
  });
});

// ─── InputToolbar ───

describe('InputToolbar', () => {
  const defaultProps = {
    mode: 'agent' as const,
    onModeChange: vi.fn(),
    onModelChange: vi.fn(),
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
    isStreaming: false,
    canSubmit: true,
    showAttachButton: false,
  };

  test('renders send button', () => {
    renderWithChat(<InputToolbar {...defaultProps} />);
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    expect(screen.getByLabelText('Send message')).toBeInTheDocument();
  });

  test('disables send button when canSubmit is false', () => {
    renderWithChat(<InputToolbar {...defaultProps} canSubmit={false} />);
    expect(screen.getByTestId('submit-button')).toBeDisabled();
  });

  test('shows cancel button when streaming', () => {
    renderWithChat(<InputToolbar {...defaultProps} isStreaming />);
    expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
    expect(screen.getByLabelText('Cancel')).toBeInTheDocument();
  });

  test('fires onSubmit when send clicked', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithChat(<InputToolbar {...defaultProps} onSubmit={onSubmit} />);
    await user.click(screen.getByTestId('submit-button'));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  test('fires onCancel when cancel clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    renderWithChat(<InputToolbar {...defaultProps} isStreaming onCancel={onCancel} />);
    await user.click(screen.getByTestId('cancel-button'));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  test('renders mode picker', () => {
    renderWithChat(<InputToolbar {...defaultProps} />, {
      config: { showModePicker: true, availableModes: ['ask', 'agent', 'edit'] },
    });
    expect(screen.getByTestId('mode-picker')).toBeInTheDocument();
  });

  test('renders attach button when showAttachButton is true', () => {
    renderWithChat(<InputToolbar {...defaultProps} showAttachButton onAttachClick={vi.fn()} />);
    expect(screen.getByLabelText('Attach File')).toBeInTheDocument();
  });

  test('renders model picker when models available', () => {
    renderWithChat(<InputToolbar {...defaultProps} modelId="gpt-4" />, {
      config: {
        showModelPicker: true,
        availableModels: [
          { id: 'gpt-4', label: 'GPT-4' },
          { id: 'claude', label: 'Claude' },
        ],
      },
    });
    expect(screen.getByTestId('model-picker')).toBeInTheDocument();
  });
});

// ─── InputNotice ───

describe('InputNotice', () => {
  test('renders tip notice', () => {
    renderWithChat(<InputNotice variant="tip" message="Try asking about code" />);
    expect(screen.getByText('Try asking about code')).toBeInTheDocument();
  });

  test('renders warning notice with alert role', () => {
    renderWithChat(<InputNotice variant="warning" message="Rate limited" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  test('renders dismiss button when dismissible', () => {
    renderWithChat(<InputNotice variant="info" message="Info" dismissible onDismiss={vi.fn()} />);
    expect(screen.getByLabelText('Dismiss')).toBeInTheDocument();
  });

  test('renders action button', () => {
    const onClick = vi.fn();
    renderWithChat(
      <InputNotice variant="tip" message="Tip" action={{ label: 'Learn More', onClick }} />,
    );
    expect(screen.getByText('Learn More')).toBeInTheDocument();
  });

  test('fires onDismiss when dismiss clicked', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    renderWithChat(<InputNotice variant="info" message="Info" dismissible onDismiss={onDismiss} />);
    await user.click(screen.getByLabelText('Dismiss'));
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});

// ─── ChatInputArea ───

describe('ChatInputArea', () => {
  test('renders input area with textarea and toolbar', () => {
    renderWithChat(<ChatInputArea />);
    expect(screen.getByTestId('chat-input-area')).toBeInTheDocument();
    expect(screen.getByTestId('chat-textarea')).toBeInTheDocument();
    expect(screen.getByTestId('input-toolbar')).toBeInTheDocument();
  });

  test('renders send button', () => {
    renderWithChat(<ChatInputArea />);
    expect(screen.getByLabelText('Send message')).toBeInTheDocument();
  });

  test('send button is disabled when textarea is empty', () => {
    renderWithChat(<ChatInputArea />);
    expect(screen.getByTestId('submit-button')).toBeDisabled();
  });

  test('applies streaming class when streaming', () => {
    renderWithChat(<ChatInputArea />, {
      session: {
        id: 'test',
        messages: [
          {
            role: 'user',
            id: 'r1',
            timestamp: Date.now(),
            message: 'hi',
            content: [{ kind: 'markdown', content: 'hi' }],
          },
          {
            role: 'assistant',
            id: 'a1',
            requestId: 'r1',
            timestamp: Date.now(),
            state: 'streaming',
            content: [],
          },
        ],
        createdAt: Date.now(),
      },
    });
    expect(screen.getByTestId('chat-input-area')).toHaveClass('ac-input-area--streaming');
  });

  test('has accessible textarea', () => {
    renderWithChat(<ChatInputArea />);
    expect(screen.getByLabelText('Chat input')).toBeInTheDocument();
  });
});
