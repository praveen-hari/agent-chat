/**
 * Tests for useChatContext and useChatSelector hooks.
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { ChatProvider } from '../ChatProvider';
import { useChatContext, useChatSelector } from '../useChatContext';
import {
  buildSession,
  buildRequest,
  buildResponse,
  resetIdCounter,
} from '../../test-utils/builders';

function createWrapper(props: Partial<React.ComponentProps<typeof ChatProvider>> = {}) {
  const session = props.session ?? buildSession();
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <ChatProvider session={session} {...props}>
        {children}
      </ChatProvider>
    );
  };
}

describe('useChatContext', () => {
  beforeEach(() => {
    resetIdCounter();
  });

  test('returns context value when inside ChatProvider', () => {
    const { result } = renderHook(() => useChatContext(), {
      wrapper: createWrapper(),
    });

    expect(result.current.session).toBeDefined();
    expect(result.current.config).toBeDefined();
    expect(result.current.callbacks).toBeDefined();
  });

  test('throws when used outside ChatProvider', () => {
    expect(() => {
      renderHook(() => useChatContext());
    }).toThrow('useChatContext must be used within a <ChatProvider>');
  });

  test('returns correct session data', () => {
    const session = buildSession({
      title: 'Test Session',
      messages: [buildRequest({ message: 'hi' })],
    });

    const { result } = renderHook(() => useChatContext(), {
      wrapper: createWrapper({ session }),
    });

    expect(result.current.session.title).toBe('Test Session');
    expect(result.current.session.messages).toHaveLength(1);
  });

  test('returns derived state correctly', () => {
    const session = buildSession({
      messages: [buildRequest(), buildResponse({ state: 'streaming' })],
    });

    const { result } = renderHook(() => useChatContext(), {
      wrapper: createWrapper({ session }),
    });

    expect(result.current.isStreaming).toBe(true);
    expect(result.current.isEmpty).toBe(false);
    expect(result.current.streamingResponse).not.toBeNull();
  });
});

describe('useChatSelector', () => {
  beforeEach(() => {
    resetIdCounter();
  });

  test('selects a single value from context', () => {
    const session = buildSession({
      messages: [buildRequest(), buildResponse({ state: 'complete' })],
    });

    const { result } = renderHook(() => useChatSelector((ctx) => ctx.isStreaming), {
      wrapper: createWrapper({ session }),
    });

    expect(result.current).toBe(false);
  });

  test('selects nested value', () => {
    const agent = { id: 'bot', name: 'Bot', icon: '🤖' };

    const { result } = renderHook(() => useChatSelector((ctx) => ctx.activeAgent?.name), {
      wrapper: createWrapper({ activeAgent: agent }),
    });

    expect(result.current).toBe('Bot');
  });

  test('selects config values', () => {
    const { result } = renderHook(() => useChatSelector((ctx) => ctx.config.maxWidth), {
      wrapper: createWrapper({ config: { maxWidth: 800 } }),
    });

    expect(result.current).toBe(800);
  });
});
