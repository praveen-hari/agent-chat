/**
 * AI SDK → @agent-chat/react Adapter
 *
 * Converts AI SDK v7 `useChat` UIMessage[] into @agent-chat/react ChatSession.
 * This is the bridge between Vercel AI SDK's data model and our chat library.
 *
 * AI SDK UIMessage has:
 * - id, role ('user' | 'assistant'), parts[], metadata
 * - parts: { type: 'text', text } | { type: 'tool-*', toolInvocation } | { type: 'reasoning', text }
 *
 * @agent-chat/react ChatSession has:
 * - messages: (ChatRequest | ChatResponse)[], each with content: ChatContentPart[]
 */

import type { UIMessage } from 'ai';

// Types from @agent-chat/react (inline for now, will import from library)
interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: number;
}

type ChatMessage = ChatRequest | ChatResponse;

interface ChatRequest {
  role: 'user';
  id: string;
  timestamp: number;
  message: string;
  content: ChatContentPart[];
  attachments?: ChatAttachment[];
}

interface ChatResponse {
  role: 'assistant';
  id: string;
  requestId: string;
  timestamp: number;
  completedAt?: number;
  state: ResponseState;
  content: ChatContentPart[];
  agent?: ChatAgent;
  followups?: ChatFollowup[];
  error?: ChatError;
  usage?: ChatUsage;
  elapsedMs?: number;
}

type ResponseState =
  | 'pending'
  | 'streaming'
  | 'needs-input'
  | 'complete'
  | 'cancelled'
  | 'failed';

interface ChatAgent {
  id: string;
  name: string;
  icon: string;
}

interface ChatFollowup {
  id: string;
  label: string;
  message: string;
  type: 'reply' | 'command';
}

interface ChatError {
  message: string;
  level: 'error' | 'warning' | 'info';
}

interface ChatUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens?: number;
}

interface ChatAttachment {
  type: string;
  id: string;
  [key: string]: unknown;
}

type ChatContentPart =
  | { kind: 'markdown'; content: string }
  | { kind: 'code'; code: string; language: string; filename?: string }
  | {
      kind: 'thinking';
      content: string;
      isStreaming: boolean;
      title?: string;
    }
  | {
      kind: 'tool-call';
      toolId: string;
      toolCallId: string;
      status: string;
      label?: string;
      input?: unknown;
      output?: string;
    }
  | { kind: 'progress'; message: string; isActive: boolean }
  | { kind: 'working' }
  | { kind: 'error'; message: string; level: 'error' | 'warning' | 'info' };

// ─── Adapter Functions ───

/**
 * Convert AI SDK `useChat` status to @agent-chat ResponseState
 */
function mapStatus(
  aiStatus: string,
  isLastMessage: boolean,
): ResponseState {
  if (!isLastMessage) return 'complete';

  switch (aiStatus) {
    case 'submitted':
      return 'streaming';
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

/**
 * Convert an AI SDK UIMessage part to @agent-chat ChatContentPart(s).
 */
function convertPart(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  part: any,
  isStreaming: boolean,
): ChatContentPart[] {
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
      // Handle tool-* part types (e.g., 'tool-weather', 'tool-calculator')
      if (part.type?.startsWith('tool-')) {
        const toolName = part.type.replace('tool-', '');
        const toolInvocation = part.toolInvocation || part;

        const status =
          toolInvocation.state === 'result'
            ? 'complete'
            : toolInvocation.state === 'call'
              ? 'running'
              : toolInvocation.state === 'partial-call'
                ? 'streaming'
                : 'running';

        const result: ChatContentPart[] = [
          {
            kind: 'tool-call',
            toolId: toolName,
            toolCallId: toolInvocation.toolCallId || `tc-${toolName}`,
            status,
            label: `${toolName}(${JSON.stringify(toolInvocation.args || {}).slice(0, 60)})`,
            input: toolInvocation.args,
            output:
              toolInvocation.result != null
                ? typeof toolInvocation.result === 'string'
                  ? toolInvocation.result
                  : JSON.stringify(toolInvocation.result, null, 2)
                : undefined,
          },
        ];

        return result;
      }

      // Unknown part type — show as text
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
      // Extract text from parts
      const text = msg.parts
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
      });
    } else if (msg.role === 'assistant') {
      const responseState = mapStatus(aiStatus, isLast);
      const isResponseStreaming =
        responseState === 'streaming' || responseState === 'pending';

      // Convert all parts
      const contentParts: ChatContentPart[] = [];

      if (msg.parts) {
        for (const part of msg.parts) {
          contentParts.push(...convertPart(part, isResponseStreaming && isLast));
        }
      }

      // If streaming and no content yet, show working indicator
      if (isResponseStreaming && isLast && contentParts.length === 0) {
        contentParts.push({ kind: 'working' });
      }

      // Extract metadata
      const metadata = (msg.metadata || {}) as Record<string, unknown>;

      const chatResponse: ChatResponse = {
        role: 'assistant',
        id: msg.id,
        requestId: lastRequestId,
        timestamp: (metadata.createdAt as number) || Date.now(),
        completedAt: metadata.completedAt as number | undefined,
        state: responseState,
        content: contentParts,
        agent: {
          id: 'ai-assistant',
          name: 'AI Assistant',
          icon: '✨',
        },
        usage:
          metadata.totalTokens != null
            ? {
                promptTokens: (metadata.promptTokens as number) || 0,
                completionTokens: (metadata.completionTokens as number) || 0,
                totalTokens: metadata.totalTokens as number,
              }
            : undefined,
        elapsedMs:
          metadata.completedAt && metadata.createdAt
            ? (metadata.completedAt as number) - (metadata.createdAt as number)
            : undefined,
      };

      // Add error if present
      if (error && isLast) {
        chatResponse.error = {
          message: error.message || 'An error occurred',
          level: 'error',
        };
      }

      chatMessages.push(chatResponse);
    }
  }

  return {
    id: sessionId,
    messages: chatMessages,
    createdAt: Date.now(),
  };
}
