/**
 * Tests for useChatActions hook.
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ChatProvider } from '../ChatProvider';
import { useChatActions } from '../useChatActions';
import {
  buildSession,
  buildRequest,
  buildResponse,
  buildFollowup,
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

describe('useChatActions', () => {
  beforeEach(() => {
    resetIdCounter();
  });

  test('sendMessage delegates to onSendMessage callback', () => {
    const onSendMessage = vi.fn();
    const { result } = renderHook(() => useChatActions(), {
      wrapper: createWrapper({ onSendMessage }),
    });

    act(() => {
      result.current.sendMessage('hello');
    });

    expect(onSendMessage).toHaveBeenCalledWith('hello', undefined, undefined);
  });

  test('sendMessage is no-op when callback missing', () => {
    const { result } = renderHook(() => useChatActions(), {
      wrapper: createWrapper(),
    });

    // Should not throw
    expect(() => {
      act(() => {
        result.current.sendMessage('hello');
      });
    }).not.toThrow();
  });

  test('cancelResponse delegates with streaming response ID', () => {
    const onCancelResponse = vi.fn();
    const streamingResponse = buildResponse({ id: 'resp-42', state: 'streaming' });
    const session = buildSession({
      messages: [buildRequest(), streamingResponse],
    });

    const { result } = renderHook(() => useChatActions(), {
      wrapper: createWrapper({ session, onCancelResponse }),
    });

    act(() => {
      result.current.cancelResponse();
    });

    expect(onCancelResponse).toHaveBeenCalledWith('resp-42');
  });

  test('cancelResponse accepts explicit responseId', () => {
    const onCancelResponse = vi.fn();
    const { result } = renderHook(() => useChatActions(), {
      wrapper: createWrapper({ onCancelResponse }),
    });

    act(() => {
      result.current.cancelResponse('explicit-id');
    });

    expect(onCancelResponse).toHaveBeenCalledWith('explicit-id');
  });

  test('vote delegates to onVote callback', () => {
    const onVote = vi.fn();
    const { result } = renderHook(() => useChatActions(), {
      wrapper: createWrapper({ onVote }),
    });

    act(() => {
      result.current.vote('resp-1', 'up');
    });

    expect(onVote).toHaveBeenCalledWith('resp-1', 'up');
  });

  test('toolAction delegates to onToolAction callback', () => {
    const onToolAction = vi.fn();
    const { result } = renderHook(() => useChatActions(), {
      wrapper: createWrapper({ onToolAction }),
    });

    act(() => {
      result.current.toolAction('tc-1', 'allow-once', 'edit_file');
    });

    expect(onToolAction).toHaveBeenCalledWith('tc-1', 'allow-once', 'edit_file');
  });

  test('followupClick delegates to onFollowupClick callback', () => {
    const onFollowupClick = vi.fn();
    const followup = buildFollowup({ label: 'Next', message: 'Do next thing' });
    const { result } = renderHook(() => useChatActions(), {
      wrapper: createWrapper({ onFollowupClick }),
    });

    act(() => {
      result.current.followupClick(followup);
    });

    expect(onFollowupClick).toHaveBeenCalledWith(followup);
  });

  test('codeApply delegates to onCodeApply callback', () => {
    const onCodeApply = vi.fn();
    const { result } = renderHook(() => useChatActions(), {
      wrapper: createWrapper({ onCodeApply }),
    });

    act(() => {
      result.current.codeApply('const x = 1;', 'typescript', 'app.ts');
    });

    expect(onCodeApply).toHaveBeenCalledWith('const x = 1;', 'typescript', 'app.ts');
  });

  test('codeCopy delegates to onCodeCopy callback', () => {
    const onCodeCopy = vi.fn();
    const { result } = renderHook(() => useChatActions(), {
      wrapper: createWrapper({ onCodeCopy }),
    });

    act(() => {
      result.current.codeCopy('const x = 1;');
    });

    expect(onCodeCopy).toHaveBeenCalledWith('const x = 1;');
  });

  test('fileOpen delegates to onFileOpen callback', () => {
    const onFileOpen = vi.fn();
    const { result } = renderHook(() => useChatActions(), {
      wrapper: createWrapper({ onFileOpen }),
    });

    act(() => {
      result.current.fileOpen('file:///src/app.ts');
    });

    expect(onFileOpen).toHaveBeenCalledWith('file:///src/app.ts');
  });

  test('planAction delegates to onPlanAction callback', () => {
    const onPlanAction = vi.fn();
    const { result } = renderHook(() => useChatActions(), {
      wrapper: createWrapper({ onPlanAction }),
    });

    act(() => {
      result.current.planAction('plan-1', 'approve', 'Looks good');
    });

    expect(onPlanAction).toHaveBeenCalledWith('plan-1', 'approve', 'Looks good');
  });
});

describe('useChatActions — computed state', () => {
  beforeEach(() => {
    resetIdCounter();
  });

  test('canSend is true when not streaming and handler exists', () => {
    const onSendMessage = vi.fn();
    const { result } = renderHook(() => useChatActions(), {
      wrapper: createWrapper({ onSendMessage }),
    });

    expect(result.current.canSend).toBe(true);
  });

  test('canSend is false when streaming', () => {
    const onSendMessage = vi.fn();
    const session = buildSession({
      messages: [buildRequest(), buildResponse({ state: 'streaming' })],
    });

    const { result } = renderHook(() => useChatActions(), {
      wrapper: createWrapper({ session, onSendMessage }),
    });

    expect(result.current.canSend).toBe(false);
  });

  test('canSend is false when no handler', () => {
    const { result } = renderHook(() => useChatActions(), {
      wrapper: createWrapper(),
    });

    expect(result.current.canSend).toBe(false);
  });

  test('canCancel is true when streaming and handler exists', () => {
    const onCancelResponse = vi.fn();
    const session = buildSession({
      messages: [buildRequest(), buildResponse({ state: 'streaming' })],
    });

    const { result } = renderHook(() => useChatActions(), {
      wrapper: createWrapper({ session, onCancelResponse }),
    });

    expect(result.current.canCancel).toBe(true);
  });

  test('canCancel is false when not streaming', () => {
    const onCancelResponse = vi.fn();
    const { result } = renderHook(() => useChatActions(), {
      wrapper: createWrapper({ onCancelResponse }),
    });

    expect(result.current.canCancel).toBe(false);
  });
});
