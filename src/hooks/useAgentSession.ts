/**
 * useAgentSession — production-ready hook that drives any ChatAgentAdapter
 * and produces a ChatSession for @agent-chat/react.
 *
 * Key design decisions:
 * - **Ordered segments**: content parts are built in the order events arrive,
 *   preserving interleaved thinking → tool → thinking → text flows
 * - **Segment merging**: consecutive text-delta events merge into one markdown part,
 *   consecutive reasoning events merge into one thinking part
 * - **Immutable updates**: every state update creates new references so React
 *   detects changes and re-renders
 *
 * @module hooks/useAgentSession
 */

import { useState, useCallback, useRef } from 'react';
import type { ChatSession, ChatRequest, ChatResponse, ChatAgent } from '../types/models';
import type { ChatContentPart } from '../types/content-parts';
import type { ChatAgentAdapter, ChatAgentEvent, ChatAgentRequestOptions } from '../types/agent';

// ─── Types ───

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

/**
 * An ordered content segment — tracks what type of content is being built
 * and its position in the interleaved sequence.
 */
type ContentSegment =
  | { type: 'text'; text: string }
  | { type: 'reasoning'; text: string }
  | {
      type: 'tool';
      toolCallId: string;
      toolId: string;
      input?: unknown;
      output?: string;
      status: 'streaming' | 'running' | 'complete' | 'failed';
    }
  | {
      type: 'tool-approval';
      toolCallId: string;
      toolId: string;
      message: string;
      riskLevel?: 'low' | 'medium' | 'high';
    }
  | { type: 'source'; label: string; uri: string; icon?: string }
  | { type: 'file'; url: string; mediaType: string; filename?: string }
  | { type: 'progress'; message: string }
  | { type: 'working' };

// ─── Hook ───

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
  const isStreamingRef = useRef(false);
  const messagesRef = useRef<Array<ChatRequest | ChatResponse>>([]);

  // Keep refs in sync with state
  messagesRef.current = messages;
  isStreamingRef.current = isStreaming;

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreamingRef.current) return;
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
      const startTime = Date.now();
      let currentAgent: ChatAgent = { ...defaultAgent };

      /**
       * Ordered segment list — preserves the sequence:
       *   reasoning → tool → reasoning → tool → text
       * Each segment converts to one or more ChatContentParts.
       */
      const segments: ContentSegment[] = [];

      /** Track which segment type is "active" for merging consecutive events */
      let activeSegmentType: 'text' | 'reasoning' | null = null;

      // Initial streaming response
      const initialResponse: ChatResponse = {
        role: 'assistant',
        id: responseId,
        requestId: userMsg.id,
        timestamp: startTime,
        state: 'streaming',
        content: [{ kind: 'working' } as ChatContentPart],
        agent: currentAgent,
      };

      setMessages((prev) => [...prev, userMsg, initialResponse]);
      setIsStreaming(true);

      const abortController = new AbortController();
      abortRef.current = abortController;

      // ─── Convert segments → ChatContentPart[] ───
      const buildContent = (streaming: boolean): ChatContentPart[] => {
        const parts: ChatContentPart[] = [];

        // Collect sources separately (rendered as one block at the end)
        const sources: Array<{ label: string; uri: string; icon?: string }> = [];

        for (const seg of segments) {
          switch (seg.type) {
            case 'text':
              if (seg.text) {
                parts.push({ kind: 'markdown', content: seg.text });
              }
              break;

            case 'reasoning':
              if (seg.text) {
                parts.push({
                  kind: 'thinking',
                  content: seg.text,
                  isStreaming: streaming,
                } as ChatContentPart);
              }
              break;

            case 'tool':
              parts.push({
                kind: 'tool-call',
                toolId: seg.toolId,
                toolCallId: seg.toolCallId,
                status: seg.status,
                input: seg.input,
                output: seg.output,
              } as ChatContentPart);
              break;

            case 'tool-approval':
              parts.push({
                kind: 'tool-confirmation',
                toolId: seg.toolId,
                toolCallId: seg.toolCallId,
                title: `Approve: ${seg.toolId}`,
                message: seg.message,
                riskLevel: seg.riskLevel,
                actions: [
                  { id: 'allow', label: 'Allow', primary: true },
                  { id: 'deny', label: 'Deny' },
                ],
              } as ChatContentPart);
              break;

            case 'file':
              if (seg.mediaType.startsWith('image/')) {
                parts.push({
                  kind: 'image',
                  src: seg.url,
                  alt: seg.filename,
                } as ChatContentPart);
              }
              break;

            case 'source':
              sources.push({ label: seg.label, uri: seg.uri, icon: seg.icon });
              break;

            case 'progress':
              parts.push({
                kind: 'progress',
                message: seg.message,
                isActive: streaming,
              } as ChatContentPart);
              break;

            case 'working':
              parts.push({ kind: 'working' } as ChatContentPart);
              break;
          }
        }

        // Append sources as one references block
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

        // If nothing rendered, show working indicator
        if (parts.length === 0 && streaming) {
          parts.push({ kind: 'working' } as ChatContentPart);
        }

        return parts;
      };

      // ─── Update response in state ───
      const updateResponse = (overrides?: Partial<ChatResponse>) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === responseId
              ? ({
                  ...m,
                  content: buildContent(true),
                  agent: currentAgent,
                  ...overrides,
                } as ChatResponse)
              : m,
          ),
        );
      };

      // ─── Get or create the active mergeable segment ───
      const getOrCreateTextSegment = (): ContentSegment & { type: 'text' } => {
        if (activeSegmentType === 'text') {
          const last = segments[segments.length - 1];
          if (last?.type === 'text') return last;
        }
        const seg: ContentSegment = { type: 'text', text: '' };
        segments.push(seg);
        activeSegmentType = 'text';
        return seg as ContentSegment & { type: 'text' };
      };

      const getOrCreateReasoningSegment = (): ContentSegment & { type: 'reasoning' } => {
        if (activeSegmentType === 'reasoning') {
          const last = segments[segments.length - 1];
          if (last?.type === 'reasoning') return last;
        }
        const seg: ContentSegment = { type: 'reasoning', text: '' };
        segments.push(seg);
        activeSegmentType = 'reasoning';
        return seg as ContentSegment & { type: 'reasoning' };
      };

      // ─── Process a single event ───
      const processEvent = (event: ChatAgentEvent) => {
        switch (event.type) {
          case 'text-delta': {
            const seg = getOrCreateTextSegment();
            seg.text += event.text;
            break;
          }

          case 'code': {
            const seg = getOrCreateTextSegment();
            seg.text += `\n\`\`\`${event.language}\n${event.code}\n\`\`\`\n`;
            break;
          }

          case 'reasoning': {
            const seg = getOrCreateReasoningSegment();
            seg.text += event.text;
            break;
          }

          case 'tool-call-start': {
            activeSegmentType = null; // break merge chain
            segments.push({
              type: 'tool',
              toolCallId: event.toolCallId,
              toolId: event.toolId,
              input: event.input,
              status: 'running',
            });
            break;
          }

          case 'tool-call-delta': {
            const toolSeg = segments.find(
              (s) => s.type === 'tool' && s.toolCallId === event.toolCallId,
            ) as (ContentSegment & { type: 'tool' }) | undefined;
            if (toolSeg) {
              toolSeg.status = 'streaming';
              if (typeof toolSeg.input === 'string') {
                toolSeg.input += event.argsDelta;
              } else {
                toolSeg.input = event.argsDelta;
              }
            }
            break;
          }

          case 'tool-call-end': {
            const toolSeg = segments.find(
              (s) => s.type === 'tool' && s.toolCallId === event.toolCallId,
            ) as (ContentSegment & { type: 'tool' }) | undefined;
            if (toolSeg) {
              toolSeg.output = event.output;
              toolSeg.status = event.success === false ? 'failed' : 'complete';
            }
            break;
          }

          case 'tool-approval': {
            activeSegmentType = null;
            segments.push({
              type: 'tool-approval',
              toolCallId: event.toolCallId,
              toolId: event.toolId,
              message: event.message,
              riskLevel: event.riskLevel,
            });
            break;
          }

          case 'file': {
            activeSegmentType = null;
            segments.push({
              type: 'file',
              url: event.url,
              mediaType: event.mediaType,
              filename: event.filename,
            });
            break;
          }

          case 'source': {
            segments.push({
              type: 'source',
              label: event.label,
              uri: event.uri,
              icon: event.icon,
            });
            break;
          }

          case 'agent-handoff': {
            currentAgent = {
              id: event.agentName.toLowerCase().replace(/\s+/g, '-'),
              name: event.agentName,
              icon: event.agentIcon ?? '🤖',
            };
            break;
          }

          case 'progress': {
            activeSegmentType = null;
            segments.push({ type: 'progress', message: event.message });
            break;
          }

          case 'error': {
            setError(event.message);
            break;
          }

          case 'done': {
            if (event.agentName) {
              currentAgent = { ...currentAgent, name: event.agentName };
            }
            break;
          }
        }
      };

      // ─── Run the agent stream ───
      try {
        const history = messagesRef.current;
        const eventStream = adapter.sendMessage(text, history, {
          ...requestOptions,
          signal: abortController.signal,
        });

        for await (const event of eventStream) {
          if (abortController.signal.aborted) break;
          processEvent(event);
          updateResponse();
        }

        // ─── Finalize ───
        const finalContent = buildContent(false);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === responseId
              ? ({
                  ...m,
                  state: 'complete',
                  completedAt: Date.now(),
                  content: finalContent,
                  agent: currentAgent,
                  elapsedMs: Date.now() - startTime,
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
    },
    [adapter, defaultAgent, requestOptions],
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
