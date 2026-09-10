/**
 * useAgentChat — React hook that drives an OpenAI Agents SDK backend
 * and produces @agent-chat/react ChatSession data.
 *
 * Connects to POST /api/chat which streams SSE events from the agent.
 * Converts events into ChatSession messages in real-time.
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import type {
  ChatSession,
  ChatRequest,
  ChatResponse,
  ChatContentPart,
} from '@agent-chat/react';

interface AgentToolCall {
  id: string;
  name: string;
  args: string;
  output?: string;
  status: 'running' | 'complete' | 'failed';
}

interface UseAgentChatOptions {
  model?: string;
}

export function useAgentChat(options: UseAgentChatOptions = {}) {
  const [messages, setMessages] = useState<Array<ChatRequest | ChatResponse>>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const historyRef = useRef<Array<{ role: string; content: string }>>([]);
  const idCounterRef = useRef(0);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      setError(null);

      // Unique IDs using counter + timestamp
      const seq = ++idCounterRef.current;
      const userMsg: ChatRequest = {
        role: 'user',
        id: `user-${seq}-${Date.now()}`,
        timestamp: Date.now(),
        message: text,
        content: [{ kind: 'markdown', content: text }],
      };

      const responseId = `assistant-${seq}-${Date.now()}`;
      let currentText = '';
      let currentAgent = 'AI Assistant';
      const toolCalls: AgentToolCall[] = [];

      // Create initial streaming response
      const streamingResponse: ChatResponse = {
        role: 'assistant',
        id: responseId,
        requestId: userMsg.id,
        timestamp: Date.now(),
        state: 'streaming',
        content: [{ kind: 'working' } as ChatContentPart],
        agent: { id: 'ai-assistant', name: currentAgent, icon: { iconId: 'copilot' } },
      };

      setMessages((prev) => [...prev, userMsg, streamingResponse]);
      setIsStreaming(true);

      // Track history for multi-turn
      historyRef.current.push({ role: 'user', content: text });

      const abortController = new AbortController();
      abortRef.current = abortController;

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            history: historyRef.current.slice(0, -1), // exclude current message (already in input)
            model: options.model,
          }),
          signal: abortController.signal,
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`API error ${res.status}: ${errText}`);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error('No response stream');

        const decoder = new TextDecoder();
        let buffer = '';

        const updateResponse = () => {
          const contentParts: ChatContentPart[] = [];

          // Add tool calls
          for (const tc of toolCalls) {
            contentParts.push({
              kind: 'tool-call',
              toolId: tc.name,
              toolCallId: tc.id,
              status: tc.status === 'running' ? 'running' : 'complete',
              label: `${tc.name}(${tc.args.slice(0, 50)})`,
              input: (() => { try { return JSON.parse(tc.args); } catch { return tc.args; } })(),
              output: tc.output,
            } as ChatContentPart);
          }

          // Add text content
          if (currentText) {
            contentParts.push({ kind: 'markdown', content: currentText });
          }

          // If nothing yet, show working
          if (contentParts.length === 0) {
            contentParts.push({ kind: 'working' } as ChatContentPart);
          }

          setMessages((prev) =>
            prev.map((m) =>
              m.id === responseId
                ? {
                    ...m,
                    content: contentParts,
                    agent: { id: 'ai-assistant', name: currentAgent, icon: { iconId: 'copilot' } },
                  } as ChatResponse
                : m,
            ),
          );
        };

        // Read SSE stream
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const json = line.slice(6).trim();
            if (!json) continue;

            try {
              const event = JSON.parse(json);

              switch (event.type) {
                case 'text_delta':
                  currentText += event.delta;
                  updateResponse();
                  break;

                case 'agent':
                  currentAgent = event.name;
                  updateResponse();
                  break;

                case 'tool_start':
                  toolCalls.push({
                    id: event.id,
                    name: event.name,
                    args: event.args,
                    status: 'running',
                  });
                  updateResponse();
                  break;

                case 'tool_end': {
                  const tc = toolCalls.find((t) => t.id === event.id);
                  if (tc) {
                    tc.output = event.output;
                    tc.status = 'complete';
                  }
                  updateResponse();
                  break;
                }

                case 'done':
                  currentText = event.text || currentText;
                  if (event.agent) currentAgent = event.agent;
                  break;

                case 'error':
                  throw new Error(event.message);
              }
            } catch (e) {
              if (e instanceof SyntaxError) continue; // skip malformed JSON
              throw e;
            }
          }
        }

        // Finalize response
        historyRef.current.push({ role: 'assistant', content: currentText });

        const finalParts: ChatContentPart[] = [];
        for (const tc of toolCalls) {
          finalParts.push({
            kind: 'tool-call',
            toolId: tc.name,
            toolCallId: tc.id,
            status: 'complete',
            label: `${tc.name}(${tc.args.slice(0, 50)})`,
            input: (() => { try { return JSON.parse(tc.args); } catch { return tc.args; } })(),
            output: tc.output,
          } as ChatContentPart);
        }
        if (currentText) {
          finalParts.push({ kind: 'markdown', content: currentText });
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === responseId
              ? {
                  ...m,
                  state: 'complete',
                  completedAt: Date.now(),
                  content: finalParts,
                  agent: { id: 'ai-assistant', name: currentAgent, icon: { iconId: 'copilot' } },
                  elapsedMs: Date.now() - (m as ChatResponse).timestamp,
                } as ChatResponse
              : m,
          ),
        );
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === responseId
                ? { ...m, state: 'cancelled' } as ChatResponse
                : m,
            ),
          );
        } else {
          const errMsg = err instanceof Error ? err.message : 'Unknown error';
          setError(errMsg);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === responseId
                ? {
                    ...m,
                    state: 'failed',
                    error: { message: errMsg, level: 'error' },
                    content: [{ kind: 'markdown', content: currentText || '' } as ChatContentPart],
                  } as ChatResponse
                : m,
            ),
          );
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [isStreaming, options.model],
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    historyRef.current = [];
    setError(null);
  }, []);

  // Build ChatSession
  const session: ChatSession = {
    id: 'agent-session',
    messages,
    createdAt: Date.now(),
  };

  return { session, sendMessage, cancel, clearMessages, isStreaming, error };
}
