/**
 * AI SDK → @agent-chat/react Adapter
 *
 * Converts AI SDK v7 `useChat` UIMessage[] into @agent-chat/react ChatSession.
 * Imports types DIRECTLY from the @agent-chat/react library.
 */

import type { UIMessage } from 'ai';
import type {
  ChatSession,
  ChatMessage,
  ChatRequest,
  ChatResponse,
  ChatContentPart,
  ChatAgent,
  ChatUsage,
  ResponseState,
} from '@agent-chat/react';

// ─── Adapter Functions ───

function mapStatus(aiStatus: string, isLastMessage: boolean): ResponseState {
  if (!isLastMessage) return 'complete';
  switch (aiStatus) {
    case 'submitted':
    case 'streaming':
      return 'streaming';
    case 'ready':
      return 'complete';
    case 'error':
      return 'failed';
    default:
      return 'complete';
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertPart(part: any, isStreaming: boolean): ChatContentPart[] {
  switch (part.type) {
    case 'text':
      return [{ kind: 'markdown', content: part.text || '' }];

    case 'reasoning':
      return [
        {
          kind: 'thinking',
          content: part.text || '',
          isStreaming,
          title: 'Reasoning',
        },
      ];

    default:
      if (part.type?.startsWith('tool-')) {
        const toolName = part.type.replace('tool-', '');
        const inv = part.toolInvocation || part;
        const status =
          inv.state === 'result'
            ? 'complete'
            : inv.state === 'call'
              ? 'running'
              : inv.state === 'partial-call'
                ? 'streaming'
                : 'running';

        return [
          {
            kind: 'tool-call' as const,
            toolId: toolName,
            toolCallId: inv.toolCallId || `tc-${toolName}`,
            status: status as 'streaming' | 'running' | 'complete' | 'failed' | 'cancelled' | 'confirming',
            label: `${toolName}(${JSON.stringify(inv.args || {}).slice(0, 60)})`,
            input: inv.args,
            output:
              inv.result != null
                ? typeof inv.result === 'string'
                  ? inv.result
                  : JSON.stringify(inv.result, null, 2)
                : undefined,
          },
        ];
      }
      if ('text' in part && part.text) {
        return [{ kind: 'markdown', content: part.text }];
      }
      return [];
  }
}

/**
 * Convert AI SDK `useChat` UIMessage[] + status into @agent-chat/react ChatSession.
 */
export function convertToSession(
  messages: UIMessage[],
  aiStatus: string,
  sessionId = 'demo-session',
  error?: Error | null,
): ChatSession {
  const chatMessages: ChatMessage[] = [];
  let lastRequestId = '';

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i]!;
    const isLast = i === messages.length - 1;

    if (msg.role === 'user') {
      const text =
        msg.parts
          ?.filter((p) => p.type === 'text')
          .map((p) => (p as { text: string }).text)
          .join('\n') || '';
      lastRequestId = msg.id;
      chatMessages.push({
        role: 'user',
        id: msg.id,
        timestamp: (msg.metadata as Record<string, number>)?.createdAt || Date.now(),
        message: text,
        content: [{ kind: 'markdown', content: text }],
      } satisfies ChatRequest);
    } else if (msg.role === 'assistant') {
      const state = mapStatus(aiStatus, isLast);
      const isResponseStreaming = state === 'streaming' || state === 'pending';

      const contentParts: ChatContentPart[] = [];
      if (msg.parts) {
        for (const part of msg.parts) {
          contentParts.push(...convertPart(part, isResponseStreaming && isLast));
        }
      }
      if (isResponseStreaming && isLast && contentParts.length === 0) {
        contentParts.push({ kind: 'working' });
      }

      const meta = (msg.metadata || {}) as Record<string, unknown>;
      const agent: ChatAgent = { id: 'ai-assistant', name: 'AI Assistant', icon: '✨' };
      const usage: ChatUsage | undefined =
        meta.totalTokens != null
          ? {
              promptTokens: (meta.promptTokens as number) || 0,
              completionTokens: (meta.completionTokens as number) || 0,
              totalTokens: meta.totalTokens as number,
            }
          : undefined;

      const response: ChatResponse = {
        role: 'assistant',
        id: msg.id,
        requestId: lastRequestId,
        timestamp: (meta.createdAt as number) || Date.now(),
        completedAt: meta.completedAt as number | undefined,
        state,
        content: contentParts,
        agent,
        usage,
        elapsedMs:
          meta.completedAt && meta.createdAt
            ? (meta.completedAt as number) - (meta.createdAt as number)
            : undefined,
      };

      if (error && isLast) {
        response.error = { message: error.message || 'An error occurred', level: 'error' };
      }

      chatMessages.push(response);
    }
  }

  return { id: sessionId, messages: chatMessages, createdAt: Date.now() };
}
