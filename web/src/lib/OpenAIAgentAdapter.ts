/**
 * OpenAIAgentAdapter — implements ChatAgentAdapter for OpenAI Agents SDK backend.
 *
 * This is the concrete adapter that connects the OpenAI Agents SDK API route
 * to the @agent-chat/react library via the ChatAgentAdapter interface.
 *
 * The API route streams SSE events; this adapter parses them and yields
 * ChatAgentEvent objects that useAgentSession consumes.
 */

import type {
  ChatAgentAdapter,
  ChatAgentEvent,
  ChatAgentRequestOptions,
  ChatMessage,
} from '@agent-chat/react';

export interface OpenAIAgentAdapterOptions {
  /** API endpoint URL (default: '/api/chat') */
  apiUrl?: string;
  /** Model ID to use */
  model?: string;
}

export class OpenAIAgentAdapter implements ChatAgentAdapter {
  private apiUrl: string;
  private model: string;
  private abortController: AbortController | null = null;

  constructor(options: OpenAIAgentAdapterOptions = {}) {
    this.apiUrl = options.apiUrl ?? '/api/chat';
    this.model = options.model ?? 'gpt-4.1-mini';
  }

  /** Update model at runtime */
  setModel(model: string) {
    this.model = model;
  }

  /**
   * Send a message and stream back ChatAgentEvents.
   * Connects to the SSE endpoint and parses events.
   */
  async *sendMessage(
    message: string,
    history: ChatMessage[],
    options?: ChatAgentRequestOptions,
  ): AsyncGenerator<ChatAgentEvent> {
    this.abortController = new AbortController();
    const signal = options?.signal
      ? anySignal([options.signal, this.abortController.signal])
      : this.abortController.signal;

    // Build history for the API (simplified: just role + content text)
    const apiHistory = history
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({
        role: m.role,
        content:
          m.role === 'user'
            ? (m as { message?: string }).message || ''
            : m.content
                ?.filter((p) => p.kind === 'markdown')
                .map((p) => (p as { content: string }).content)
                .join('\n') || '',
      }))
      .filter((m) => m.content.length > 0);

    const res = await fetch(this.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        history: apiHistory,
        model: options?.modelId ?? this.model,
      }),
      signal,
    });

    if (!res.ok) {
      const errorText = await res.text();
      yield { type: 'error', message: `API error ${res.status}: ${errorText}` };
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) {
      yield { type: 'error', message: 'No response stream' };
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
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

          let event: Record<string, unknown>;
          try {
            event = JSON.parse(json);
          } catch {
            continue; // skip malformed JSON
          }

          // Convert SSE event → ChatAgentEvent
          const agentEvent = this.parseEvent(event);
          if (agentEvent) {
            yield agentEvent;
          }
        }
      }
    } finally {
      reader.releaseLock();
      this.abortController = null;
    }
  }

  /** Cancel the current streaming request */
  cancel() {
    this.abortController?.abort();
  }

  /**
   * Parse a raw SSE event into a ChatAgentEvent.
   * The API route sends events that are already close to ChatAgentEvent format.
   */
  private parseEvent(event: Record<string, unknown>): ChatAgentEvent | null {
    switch (event.type) {
      case 'text-delta':
        return { type: 'text-delta', text: (event.text as string) || '' };

      case 'reasoning':
        return { type: 'reasoning', text: (event.text as string) || '' };

      case 'tool-call-start':
        return {
          type: 'tool-call-start',
          toolCallId: (event.toolCallId as string) || `tc-${Date.now()}`,
          toolId: (event.toolId as string) || 'unknown',
          input: event.input,
        };

      case 'tool-call-end':
        return {
          type: 'tool-call-end',
          toolCallId: (event.toolCallId as string) || '',
          output: event.output as string | undefined,
          success: (event.success as boolean) ?? true,
        };

      case 'agent-handoff':
        return {
          type: 'agent-handoff',
          agentName: (event.agentName as string) || 'Agent',
          agentIcon: event.agentIcon as string | undefined,
        };

      case 'progress':
        return {
          type: 'progress',
          message: (event.message as string) || '',
        };

      case 'error':
        return {
          type: 'error',
          message: (event.message as string) || 'Unknown error',
          level: (event.level as 'error' | 'warning' | 'info') ?? 'error',
        };

      case 'done':
        return {
          type: 'done',
          agentName: event.agentName as string | undefined,
        };

      default:
        return null;
    }
  }
}

/**
 * Combine multiple AbortSignals into one.
 */
function anySignal(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      return controller.signal;
    }
    signal.addEventListener('abort', () => controller.abort(signal.reason), {
      once: true,
    });
  }
  return controller.signal;
}
