/**
 * Tests for notification components:
 * ErrorMessage, SystemNotification, WorkspaceTransition,
 * HookResult, TipContent, QuotaExceeded, RateLimited.
 */

import { describe, test, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithChat } from '../../test-utils/render';
import { ErrorMessage } from './ErrorMessage';
import { SystemNotification } from './SystemNotification';
import { WorkspaceTransition } from './WorkspaceTransition';
import { HookResult } from './HookResult';
import { TipContent } from './TipContent';
import { QuotaExceeded } from './QuotaExceeded';
import { RateLimited } from './RateLimited';

// ─── ErrorMessage ───

describe('ErrorMessage', () => {
  test('renders error message text', () => {
    renderWithChat(<ErrorMessage kind="error" message="Something went wrong" level="error" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  test('applies error level class', () => {
    renderWithChat(<ErrorMessage kind="error" message="Error" level="error" />);
    expect(screen.getByTestId('error-message')).toHaveClass('ac-notification--error');
  });

  test('applies warning level class', () => {
    renderWithChat(<ErrorMessage kind="error" message="Warning" level="warning" />);
    expect(screen.getByTestId('error-message')).toHaveClass('ac-notification--warning');
  });

  test('applies info level class', () => {
    renderWithChat(<ErrorMessage kind="error" message="Info" level="info" />);
    expect(screen.getByTestId('error-message')).toHaveClass('ac-notification--info');
  });

  test('has alert role', () => {
    renderWithChat(<ErrorMessage kind="error" message="Error" level="error" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});

// ─── SystemNotification ───

describe('SystemNotification', () => {
  test('renders standard style with message', () => {
    renderWithChat(
      <SystemNotification kind="system-notification" message="System update" style="standard" />,
    );
    expect(screen.getByText('System update')).toBeInTheDocument();
  });

  test('renders separator style', () => {
    renderWithChat(
      <SystemNotification kind="system-notification" message="Section break" style="separator" />,
    );
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  test('renders collapsible style', () => {
    renderWithChat(
      <SystemNotification
        kind="system-notification"
        message="Collapsible info"
        style="collapsible"
        detail="More details here"
      />,
    );
    expect(screen.getByText('Collapsible info')).toBeInTheDocument();
  });

  test('renders timing when provided', () => {
    renderWithChat(
      <SystemNotification
        kind="system-notification"
        message="Completed"
        style="standard"
        timing="2.5s"
      />,
    );
    expect(screen.getByText(/2\.5s/)).toBeInTheDocument();
  });
});

// ─── WorkspaceTransition ───

describe('WorkspaceTransition', () => {
  test('renders workspace name', () => {
    renderWithChat(<WorkspaceTransition kind="workspace-transition" workspaceName="my-project" />);
    expect(screen.getByText('my-project')).toBeInTheDocument();
  });

  test('has separator role', () => {
    renderWithChat(<WorkspaceTransition kind="workspace-transition" workspaceName="test" />);
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  test('has accessible label', () => {
    renderWithChat(<WorkspaceTransition kind="workspace-transition" workspaceName="my-app" />);
    expect(screen.getByLabelText('Workspace: my-app')).toBeInTheDocument();
  });
});

// ─── HookResult ───

describe('HookResult', () => {
  test('renders blocked hook result', () => {
    renderWithChat(
      <HookResult
        kind="hook-result"
        hookType="pre-run"
        toolName="rm -rf"
        outcome="blocked"
        reason="Dangerous command"
      />,
    );
    // Title is visible in the collapsible header
    expect(screen.getByText(/Blocked.*rm -rf/)).toBeInTheDocument();
  });

  test('renders warning hook result', () => {
    renderWithChat(
      <HookResult kind="hook-result" hookType="post-run" toolName="git push" outcome="warning" />,
    );
    expect(screen.getByText(/Warning/)).toBeInTheDocument();
  });
});

// ─── TipContent ───

describe('TipContent', () => {
  test('renders tip message', () => {
    renderWithChat(<TipContent kind="tip" message="Use Ctrl+S to save" dismissible={false} />);
    expect(screen.getByText('Use Ctrl+S to save')).toBeInTheDocument();
  });

  test('shows dismiss button when dismissible', () => {
    renderWithChat(<TipContent kind="tip" message="A tip" dismissible />);
    expect(screen.getByLabelText('Dismiss')).toBeInTheDocument();
  });

  test('hides content after dismiss', async () => {
    const user = userEvent.setup();
    renderWithChat(<TipContent kind="tip" message="Dismissible tip" dismissible />);

    await user.click(screen.getByLabelText('Dismiss'));
    expect(screen.queryByText('Dismissible tip')).not.toBeInTheDocument();
  });

  test('has note role', () => {
    renderWithChat(<TipContent kind="tip" message="A tip" dismissible={false} />);
    expect(screen.getByRole('note')).toBeInTheDocument();
  });
});

// ─── QuotaExceeded ───

describe('QuotaExceeded', () => {
  test('renders quota message', () => {
    renderWithChat(<QuotaExceeded kind="quota-exceeded" message="You've exceeded your quota" />);
    expect(screen.getByText("You've exceeded your quota")).toBeInTheDocument();
  });

  test('shows upgrade button when URL provided', () => {
    renderWithChat(
      <QuotaExceeded
        kind="quota-exceeded"
        message="Quota exceeded"
        upgradeUrl="https://example.com/upgrade"
      />,
    );
    expect(screen.getByText('Manage Budget')).toBeInTheDocument();
  });

  test('uses custom action label', () => {
    renderWithChat(
      <QuotaExceeded
        kind="quota-exceeded"
        message="Exceeded"
        upgradeUrl="https://example.com"
        actionLabel="Upgrade Now"
      />,
    );
    expect(screen.getByText('Upgrade Now')).toBeInTheDocument();
  });
});

// ─── RateLimited ───

describe('RateLimited', () => {
  test('renders rate limited message', () => {
    renderWithChat(<RateLimited kind="rate-limited" message="Too many requests" />);
    expect(screen.getByText('Too many requests')).toBeInTheDocument();
  });

  test('shows sign in button when URL provided', () => {
    renderWithChat(
      <RateLimited
        kind="rate-limited"
        message="Sign in for more"
        signInUrl="https://example.com/signin"
      />,
    );
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  test('has status role', () => {
    renderWithChat(<RateLimited kind="rate-limited" message="Limited" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
