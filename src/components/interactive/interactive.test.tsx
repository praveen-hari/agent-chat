/**
 * Tests for interactive components:
 * ConfirmationDialog, ElicitationDialog, CommandButton,
 * FollowupButton, SuggestNext, PullRequestCard.
 */

import { describe, test, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithChat } from '../../test-utils/render';
import { ConfirmationDialog } from './ConfirmationDialog';
import { ElicitationDialog } from './ElicitationDialog';
import { CommandButton } from './CommandButton';
import { FollowupButton } from './FollowupButton';
import { SuggestNext } from './SuggestNext';
import { PullRequestCard } from './PullRequestCard';

// ─── ConfirmationDialog ───

describe('ConfirmationDialog', () => {
  test('renders title and message', () => {
    renderWithChat(
      <ConfirmationDialog
        kind="confirmation"
        title="Confirm Action"
        message="Are you sure?"
        buttons={[{ id: 'yes', label: 'Yes', primary: true }]}
      />,
    );
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  test('renders subtitle when provided', () => {
    renderWithChat(
      <ConfirmationDialog
        kind="confirmation"
        title="Title"
        message="Message"
        subtitle="Subtitle text"
        buttons={[]}
      />,
    );
    expect(screen.getByText('Subtitle text')).toBeInTheDocument();
  });

  test('renders action buttons', () => {
    renderWithChat(
      <ConfirmationDialog
        kind="confirmation"
        title="Title"
        message="Message"
        buttons={[
          { id: 'yes', label: 'Yes', primary: true },
          { id: 'no', label: 'No' },
        ]}
      />,
    );
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  test('primary button has primary class', () => {
    renderWithChat(
      <ConfirmationDialog
        kind="confirmation"
        title="T"
        message="M"
        buttons={[{ id: 'ok', label: 'OK', primary: true }]}
      />,
    );
    expect(screen.getByText('OK')).toHaveClass('ac-btn--primary');
  });

  test('fires onConfirmationAction when button clicked', async () => {
    const user = userEvent.setup();
    const onConfirmationAction = vi.fn();

    renderWithChat(
      <ConfirmationDialog
        kind="confirmation"
        title="T"
        message="M"
        buttons={[{ id: 'allow', label: 'Allow', primary: true }]}
      />,
      { callbacks: { onConfirmationAction } },
    );

    await user.click(screen.getByText('Allow'));
    expect(onConfirmationAction).toHaveBeenCalledWith('allow');
  });

  test('renders keybinding hint', () => {
    renderWithChat(
      <ConfirmationDialog
        kind="confirmation"
        title="T"
        message="M"
        buttons={[{ id: 'ok', label: 'OK', keybinding: 'Enter' }]}
      />,
    );
    expect(screen.getByText('Enter')).toBeInTheDocument();
  });
});

// ─── ElicitationDialog ───

describe('ElicitationDialog', () => {
  test('renders title and message', () => {
    renderWithChat(
      <ElicitationDialog
        kind="elicitation"
        title="Input Needed"
        message="Please provide a value"
        actions={[{ id: 'submit', label: 'Submit', primary: true }]}
      />,
    );
    expect(screen.getByText('Input Needed')).toBeInTheDocument();
    expect(screen.getByText('Please provide a value')).toBeInTheDocument();
  });

  test('shows resolved state when isResolved', () => {
    renderWithChat(
      <ElicitationDialog
        kind="elicitation"
        title="Resolved"
        message="Old message"
        actions={[]}
        isResolved
        result="Accepted value"
      />,
    );
    expect(screen.getByText(/Accepted value/)).toBeInTheDocument();
  });

  test('fires onElicitationAction when action clicked', async () => {
    const user = userEvent.setup();
    const onElicitationAction = vi.fn();

    renderWithChat(
      <ElicitationDialog
        kind="elicitation"
        title="Question"
        message="Choose an option"
        actions={[{ id: 'opt-a', label: 'Option A', primary: true }]}
      />,
      { callbacks: { onElicitationAction } },
    );

    await user.click(screen.getByText('Option A'));
    expect(onElicitationAction).toHaveBeenCalledWith('Question', 'opt-a');
  });
});

// ─── CommandButton ───

describe('CommandButton', () => {
  test('renders button label', () => {
    renderWithChat(
      <CommandButton kind="command" label="Run Tests" commandId="workbench.action.test" />,
    );
    expect(screen.getByText('Run Tests')).toBeInTheDocument();
  });

  test('fires onCommandClick when clicked', async () => {
    const user = userEvent.setup();
    const onCommandClick = vi.fn();

    renderWithChat(
      <CommandButton
        kind="command"
        label="Build"
        commandId="workbench.action.build"
        args={['--verbose']}
      />,
      { callbacks: { onCommandClick } },
    );

    await user.click(screen.getByText('Build'));
    expect(onCommandClick).toHaveBeenCalledWith('workbench.action.build', ['--verbose']);
  });
});

// ─── FollowupButton ───

describe('FollowupButton', () => {
  test('renders followup label', () => {
    renderWithChat(
      <FollowupButton
        followup={{
          kind: 'followup',
          label: 'Tell me more',
          message: 'Tell me more',
          type: 'reply',
        }}
      />,
    );
    expect(screen.getByText('Tell me more')).toBeInTheDocument();
  });

  test('fires onFollowupClick when clicked', async () => {
    const user = userEvent.setup();
    const onFollowupClick = vi.fn();

    renderWithChat(
      <FollowupButton
        followup={{ kind: 'followup', label: 'Next step', message: 'What next?', type: 'reply' }}
      />,
      { callbacks: { onFollowupClick } },
    );

    await user.click(screen.getByText('Next step'));
    expect(onFollowupClick).toHaveBeenCalled();
  });
});

// ─── SuggestNext ───

describe('SuggestNext', () => {
  test('renders suggestion buttons', () => {
    renderWithChat(
      <SuggestNext
        kind="suggest-next"
        suggestions={[
          { label: 'Fix the bug', message: 'Fix the bug' },
          { label: 'Run tests', message: 'Run tests' },
        ]}
      />,
    );
    expect(screen.getByText('Fix the bug')).toBeInTheDocument();
    expect(screen.getByText('Run tests')).toBeInTheDocument();
  });

  test('fires onSendMessage when suggestion clicked', async () => {
    const user = userEvent.setup();
    const onSendMessage = vi.fn();

    renderWithChat(
      <SuggestNext
        kind="suggest-next"
        suggestions={[{ label: 'Help', message: 'Help me please' }]}
      />,
      { callbacks: { onSendMessage } },
    );

    await user.click(screen.getByText('Help'));
    expect(onSendMessage).toHaveBeenCalledWith('Help me please');
  });
});

// ─── PullRequestCard ───

describe('PullRequestCard', () => {
  test('renders PR title and author', () => {
    renderWithChat(
      <PullRequestCard
        kind="pull-request"
        title="Fix login bug"
        author="john"
        url="https://github.com/pr/1"
      />,
    );
    expect(screen.getByText('Fix login bug')).toBeInTheDocument();
    expect(screen.getByText('by john')).toBeInTheDocument();
  });

  test('has link role', () => {
    renderWithChat(
      <PullRequestCard kind="pull-request" title="PR" author="user" url="https://example.com" />,
    );
    expect(screen.getByRole('link')).toBeInTheDocument();
  });
});
