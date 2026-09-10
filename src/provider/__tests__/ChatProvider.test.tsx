/**
 * Tests for ChatProvider — context provisioning, derived state, config merging.
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatProvider } from '../ChatProvider';
import { useChatContext } from '../useChatContext';
import { darkTheme } from '../../theme/dark';
import { lightTheme } from '../../theme/light';
import {
  buildSession,
  buildRequest,
  buildResponse,
  resetIdCounter,
} from '../../test-utils/builders';

// Helper component to read context values
function ContextReader({ onRead }: { onRead: (ctx: ReturnType<typeof useChatContext>) => void }) {
  const ctx = useChatContext();
  onRead(ctx);
  return <span data-testid="reader">context-read</span>;
}

describe('ChatProvider', () => {
  beforeEach(() => {
    resetIdCounter();
  });

  test('renders children', () => {
    render(
      <ChatProvider session={buildSession()}>
        <span>Hello Chat</span>
      </ChatProvider>,
    );
    expect(screen.getByText('Hello Chat')).toBeInTheDocument();
  });

  test('provides session via context', () => {
    const session = buildSession({ title: 'My Session' });
    let capturedCtx: ReturnType<typeof useChatContext> | null = null;

    render(
      <ChatProvider session={session}>
        <ContextReader onRead={(ctx) => (capturedCtx = ctx)} />
      </ChatProvider>,
    );

    expect(capturedCtx).not.toBeNull();
    expect(capturedCtx!.session.title).toBe('My Session');
  });

  test('provides agents via context', () => {
    const agents = [{ id: 'copilot', name: 'Copilot', icon: '🤖' }];
    let capturedCtx: ReturnType<typeof useChatContext> | null = null;

    render(
      <ChatProvider session={buildSession()} agents={agents}>
        <ContextReader onRead={(ctx) => (capturedCtx = ctx)} />
      </ChatProvider>,
    );

    expect(capturedCtx!.agents).toEqual(agents);
  });

  test('provides activeAgent via context', () => {
    const agent = { id: 'claude', name: 'Claude', icon: '🧠' };
    let capturedCtx: ReturnType<typeof useChatContext> | null = null;

    render(
      <ChatProvider session={buildSession()} activeAgent={agent}>
        <ContextReader onRead={(ctx) => (capturedCtx = ctx)} />
      </ChatProvider>,
    );

    expect(capturedCtx!.activeAgent).toEqual(agent);
  });

  test('merges config with defaults', () => {
    let capturedCtx: ReturnType<typeof useChatContext> | null = null;

    render(
      <ChatProvider session={buildSession()} config={{ maxWidth: 800, showVoteButtons: false }}>
        <ContextReader onRead={(ctx) => (capturedCtx = ctx)} />
      </ChatProvider>,
    );

    // Overridden values
    expect(capturedCtx!.config.maxWidth).toBe(800);
    expect(capturedCtx!.config.showVoteButtons).toBe(false);
    // Default values preserved
    expect(capturedCtx!.config.placeholder).toBe('Type a message...');
    expect(capturedCtx!.config.showCopyButton).toBe(true);
    expect(capturedCtx!.config.enableSyntaxHighlighting).toBe(true);
  });

  test('uses default config when none provided', () => {
    let capturedCtx: ReturnType<typeof useChatContext> | null = null;

    render(
      <ChatProvider session={buildSession()}>
        <ContextReader onRead={(ctx) => (capturedCtx = ctx)} />
      </ChatProvider>,
    );

    expect(capturedCtx!.config.maxWidth).toBe(950);
    expect(capturedCtx!.config.showWelcome).toBe(true);
    expect(capturedCtx!.config.ariaLabel).toBe('Chat');
  });

  test('provides theme via context', () => {
    let capturedCtx: ReturnType<typeof useChatContext> | null = null;

    render(
      <ChatProvider session={buildSession()} theme={lightTheme}>
        <ContextReader onRead={(ctx) => (capturedCtx = ctx)} />
      </ChatProvider>,
    );

    expect(capturedCtx!.theme.bgPrimary).toBe('#ffffff');
  });

  test('defaults to dark theme', () => {
    let capturedCtx: ReturnType<typeof useChatContext> | null = null;

    render(
      <ChatProvider session={buildSession()}>
        <ContextReader onRead={(ctx) => (capturedCtx = ctx)} />
      </ChatProvider>,
    );

    expect(capturedCtx!.theme).toBe(darkTheme);
  });

  test('aggregates callbacks into context', () => {
    const onSendMessage = vi.fn();
    const onVote = vi.fn();
    let capturedCtx: ReturnType<typeof useChatContext> | null = null;

    render(
      <ChatProvider session={buildSession()} onSendMessage={onSendMessage} onVote={onVote}>
        <ContextReader onRead={(ctx) => (capturedCtx = ctx)} />
      </ChatProvider>,
    );

    expect(capturedCtx!.callbacks.onSendMessage).toBe(onSendMessage);
    expect(capturedCtx!.callbacks.onVote).toBe(onVote);
  });
});

describe('ChatProvider — Derived State', () => {
  beforeEach(() => {
    resetIdCounter();
  });

  test('isEmpty is true for empty session', () => {
    let capturedCtx: ReturnType<typeof useChatContext> | null = null;

    render(
      <ChatProvider session={buildSession()}>
        <ContextReader onRead={(ctx) => (capturedCtx = ctx)} />
      </ChatProvider>,
    );

    expect(capturedCtx!.isEmpty).toBe(true);
    expect(capturedCtx!.isStreaming).toBe(false);
    expect(capturedCtx!.streamingResponse).toBeNull();
    expect(capturedCtx!.lastResponse).toBeNull();
  });

  test('isEmpty is false when session has messages', () => {
    const session = buildSession({
      messages: [buildRequest(), buildResponse()],
    });
    let capturedCtx: ReturnType<typeof useChatContext> | null = null;

    render(
      <ChatProvider session={session}>
        <ContextReader onRead={(ctx) => (capturedCtx = ctx)} />
      </ChatProvider>,
    );

    expect(capturedCtx!.isEmpty).toBe(false);
  });

  test('isStreaming is true when a response is streaming', () => {
    const session = buildSession({
      messages: [buildRequest(), buildResponse({ state: 'streaming' })],
    });
    let capturedCtx: ReturnType<typeof useChatContext> | null = null;

    render(
      <ChatProvider session={session}>
        <ContextReader onRead={(ctx) => (capturedCtx = ctx)} />
      </ChatProvider>,
    );

    expect(capturedCtx!.isStreaming).toBe(true);
    expect(capturedCtx!.streamingResponse).not.toBeNull();
    expect(capturedCtx!.streamingResponse!.state).toBe('streaming');
  });

  test('isStreaming is false when response is complete', () => {
    const session = buildSession({
      messages: [buildRequest(), buildResponse({ state: 'complete' })],
    });
    let capturedCtx: ReturnType<typeof useChatContext> | null = null;

    render(
      <ChatProvider session={session}>
        <ContextReader onRead={(ctx) => (capturedCtx = ctx)} />
      </ChatProvider>,
    );

    expect(capturedCtx!.isStreaming).toBe(false);
    expect(capturedCtx!.streamingResponse).toBeNull();
  });

  test('lastResponse returns the most recent assistant message', () => {
    const response1 = buildResponse({ id: 'r1' });
    const response2 = buildResponse({ id: 'r2' });
    const session = buildSession({
      messages: [buildRequest(), response1, buildRequest(), response2],
    });
    let capturedCtx: ReturnType<typeof useChatContext> | null = null;

    render(
      <ChatProvider session={session}>
        <ContextReader onRead={(ctx) => (capturedCtx = ctx)} />
      </ChatProvider>,
    );

    expect(capturedCtx!.lastResponse!.id).toBe('r2');
  });
});
