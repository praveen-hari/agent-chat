/**
 * useAgentSession — React hook that drives any ChatAgentAdapter
 * and produces a ChatSession for @agent-chat/react.
 *
 * This is the standard way to connect an agent to the library:
 *
 * @example
 * ```tsx
 * const adapter = new MyAgentAdapter();
 * const { session, sendMessage, cancel, isStreaming } = useAgentSession(adapter);
 *
 * <ChatProvider session={session} onSendMessage={sendMessage} onCancelResponse={cancel}>
 *   <AgentChat />
 * </ChatProvider>
 * ```
 *
 * The hook:
 * 1. Accepts a ChatAgentAdapter (consumer implements this)
 * 2. Calls adapter.sendMessage() when user sends a message
 * 3. Consumes the AsyncIterable<ChatAgentEvent> stream
 * 4. Builds ChatSession messages in real-time
 * 5. Returns a ready-to-use ChatSession
 *
 * @module hooks/useAgentSession
 */

import { useState, useCallback, useRef } from 'react';
import type {
  ChatSession,
  ChatRequest,
  ChatResponse,
  ChatAgent,
} from '../types/models';
import type { ChatContentPart } from '../types/content-parts';
import type {
  ChatAgentAdapter,
  ChatAgentEvent,
  ChatAgentRequestOptions,
} from '../types/agent';

export interface UseAgentSessionOptions {
  /** Session ID (default: auto-generated) */
  sessionId?: string;
  /** Default agent info shown before first handoff */
  defaultAgent?: ChatAgent;
  /** Options passed to every adapter.sendMessage call */
  requestOptions?: ChatAgentRequestOptions;
}

export interface UseAgentSessionReturn {
  /** The ChatSession — pass to ChatProvider */
  session: ChatSession;
  /** Send a user message — pass as onSendMessage callback */
  sendMessage: (text: string) => void;
  /** Cancel current streaming — pass as onCancelResponse callback */
  cancel: () => void;
  /** Clear all messages */
  clearMessages: () => void;
  /** Whether a response is currently streaming */
  isStreaming: boolean;
  /** Last error message, if any */
  error: string | null;
}

export function useAgentSession(
  adapter: ChatAgentAdapter,
  options: UseAgentSessionOptions = {},
): UseAgentSessionReturn {
  const {
    sessionId = 'session-1',
    defaultAgent = { id: 'assistant', name: 'Assistant', icon: '🤖' },
    requestOptions,
  } = options;

  const [messages, setMessages] = useState<Array<ChatRequest | ChatResponse>>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const seqRef = useRef(0);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;
      setError(null);

      const seq = ++seqRef.current;
      const userMsg: ChatRequest = {
        role: 'user',
        id: `user-${seq}-${Date.now()}`,
        timestamp: Date.now(),
        message: text,
        content: [{ kind: 'markdown', content: text }],
      };

      const responseId = `assistant-${seq}-${Date.now()}`;
      let currentText = '';
      let reasoningText = '';
      let currentAgent: ChatAgent = { ...defaultAgent };
      const toolCalls = new Map<
        string,
        {
          toolId: string;
          toolCallId: string;
          input?: unknown;
          output?: string;
          status: 'streaming' | 'running' | 'complete' | 'failed';
        }
      >();
      const sources: Array<{ label: string; uri: string; icon?: string }> = [];

      // Initial streaming response
      const initialResponse: ChatResponse = {
        role: 'assistant',
        id: responseId,
        requestId: userMsg.id,
        timestamp: Date.now(),
        state: 'streaming',
        content: [{ kind: 'working' } as ChatContentPart],
        agent: currentAgent,
      };

      setMessages((prev) => [...prev, userMsg, initialResponse]);
      setIsStreaming(true);

      const abortController = new AbortController();
      abortRef.current = abortController;

      // Build content parts from current state
      const buildContent = (): ChatContentPart[] => {
        const parts: ChatContentPart[] = [];

        // Reasoning block
        if (reasoningText) {
          parts.push({
            kind: 'thinking',
            content: reasoningText,
            isStreaming: true,
          } as ChatContentPart);
        }

        // Tool calls
        for (const tc of toolCalls.values()) {
          parts.push({
            kind: 'tool-call',
            toolId: tc.toolId,
            toolCallId: tc.toolCallId,
            status: tc.status,
            input: tc.input,
            output: tc.output,
          } as ChatContentPart);
        }

        // Sources
        if (sources.length > 0) {
          parts.push({
            kind: 'references',
            references: sources.map((s) => ({
              label: s.label,
              uri: s.uri,
              icon: s.icon,
            })),
          } as ChatContentPart);
        }

        // Text content
        if (currentText) {
          parts.push({ kind: 'markdown', content: currentText });
        }

        // Nothing yet? Show working indicator
        if (parts.length === 0) {
          parts.push({ kind: 'working' } as ChatContentPart);
        }

        return parts;
      };

      // Update response in messages array
      const updateResponse = (
        overrides?: Partial<ChatResponse>,
      ) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === responseId
              ? ({
                  ...m,
                  content: buildContent(),
                  agent: currentAgent,
                  ...overrides,
                } as ChatResponse)
              : m,
          ),
        );
      };

      try {
        // Get the history (all messages before this one)
        const history = messages;

        const eventStream = adapter.sendMessage(text, history, {
          ...requestOptions,
          signal: abortController.signal,
        });

        for await (const event of eventStream) {
          if (abortController.signal.aborted) break;
          processEvent(event);
          updateResponse();
        }

        // Finalize
        const finalContent = buildContent().map((p) =>
          p.kind === 'thinking' ? { ...p, isStreaming: false } : p,
        );

        setMessages((prev) =>
          prev.map((m) =>
            m.id === responseId
              ? ({
                  ...m,
                  state: 'complete',
                  completedAt: Date.now(),
                  content: finalContent,
                  agent: currentAgent,
                  elapsedMs: Date.now() - initialResponse.timestamp,
                } as ChatResponse)
              : m,
          ),
        );
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          updateResponse({ state: 'cancelled' });
        } else {
          const msg = err instanceof Error ? err.message : 'Unknown error';
          setError(msg);
          updateResponse({
            state: 'failed',
            error: { message: msg, level: 'error' },
          });
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }

      // ─── Event processor ───
      function processEvent(event: ChatAgentEvent) {
        switch (event.type) {
          case 'text-delta':
            currentText += event.text;
            break;

          case 'code':
            // Append as a code fence in the text stream
            currentText += `\n\`\`\`${event.language}\n${event.code}\n\`\`\`\n`;
            break;

          case 'reasoning':
            reasoningText += event.text;
            break;

          case 'tool-call-start':
            toolCalls.set(event.toolCallId, {
              toolId: event.toolId,
              toolCallId: event.toolCallId,
              input: event.input,
              status: 'running',
            });
            break;

          case 'tool-call-delta': {
            const tc = toolCalls.get(event.toolCallId);
            if (tc) {
              tc.status = 'streaming';
              // Append to input if it's a string
              if (typeof tc.input === 'string') {
                tc.input += event.argsDelta;
              } else {
                tc.input = event.argsDelta;
              }
            }
            break;
          }

          case 'tool-call-end': {
            const tc = toolCalls.get(event.toolCallId);
            if (tc) {
              tc.output = event.output;
              tc.status = event.success === false ? 'failed' : 'complete';
            }
            break;
          }

          case 'tool-approval':
            // Create a confirmation-style tool call
            toolCalls.set(event.toolCallId, {
              toolId: event.toolId,
              toolCallId: event.toolCallId,
              status: 'running',
            });
            break;

          case 'file':
            // Add as image content part if it's an image
            if (event.mediaType.startsWith('image/')) {
              currentText += `\n![${event.filename ?? 'image'}](${event.url})\n`;
            }
            break;

          case 'source':
            sources.push({
              label: event.label,
              uri: event.uri,
              icon: event.icon,
            });
            break;

          case 'agent-handoff':
            currentAgent = {
              id: event.agentName.toLowerCase().replace(/\s+/g, '-'),
              name: event.agentName,
              icon: event.agentIcon ?? '🤖',
            };
            break;

          case 'progress':
            // Progress is transient — could show in working indicator
            break;

          case 'error':
            setError(event.message);
            break;

          case 'done':
            if (event.agentName) {
              currentAgent = {
                ...currentAgent,
                name: event.agentName,
              };
            }
            break;
        }
      }
    },
    [isStreaming, adapter, defaultAgent, messages, requestOptions],
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    adapter.cancel?.();
  }, [adapter]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    seqRef.current = 0;
    setError(null);
  }, []);

  const session: ChatSession = {
    id: sessionId,
    messages,
    createdAt: Date.now(),
  };

  return { session, sendMessage, cancel, clearMessages, isStreaming, error };
}
