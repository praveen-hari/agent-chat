'use client';

/**
 * ChatView — renders the chat using @agent-chat/react components.
 *
 * This component demonstrates how a consumer uses the library:
 * 1. Wrap with ChatProvider, passing session + callbacks
 * 2. Render AgentChat (or compose individual components)
 *
 * For this demo, we render individual components to show the full API.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Types (mirroring @agent-chat/react — in production, import from the library)
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
  content: ContentPart[];
}

interface ChatResponse {
  role: 'assistant';
  id: string;
  requestId: string;
  timestamp: number;
  state: string;
  content: ContentPart[];
  agent?: { id: string; name: string; icon: string };
  error?: { message: string; level: string };
  usage?: { promptTokens: number; completionTokens: number; totalTokens?: number };
  elapsedMs?: number;
}

type ContentPart =
  | { kind: 'markdown'; content: string }
  | { kind: 'thinking'; content: string; isStreaming: boolean; title?: string }
  | { kind: 'tool-call'; toolId: string; toolCallId: string; status: string; label?: string; input?: unknown; output?: string }
  | { kind: 'working' }
  | { kind: 'error'; message: string; level: string };

interface ChatViewProps {
  session: ChatSession;
  activeDemo: string;
  onSendMessage: (text: string) => void;
  onCancel: () => void;
  onRetry: () => void;
  isStreaming: boolean;
}

const DEMO_SUGGESTIONS: Record<string, Array<{ label: string; message: string; icon: string }>> = {
  chat: [
    { label: 'Explain quantum computing', message: 'Explain quantum computing in simple terms', icon: '🔬' },
    { label: 'Write a haiku', message: 'Write a haiku about programming', icon: '📝' },
    { label: 'Explain React hooks', message: 'Explain React hooks with examples', icon: '⚛️' },
  ],
  tools: [
    { label: "What's the weather?", message: "What's the weather in Tokyo, Japan?", icon: '🌤️' },
    { label: 'Calculate something', message: 'Calculate (123 * 456) + 789', icon: '🔢' },
    { label: 'Search the web', message: 'Search for the latest AI news', icon: '🔍' },
    { label: 'Multi-step task', message: "What's the weather in London in Celsius? Then calculate the square of the temperature.", icon: '🔄' },
  ],
  code: [
    { label: 'React component', message: 'Write a React component for a todo list with TypeScript', icon: '⚛️' },
    { label: 'API endpoint', message: 'Write a REST API endpoint in Node.js with Express for user authentication', icon: '🔌' },
    { label: 'Sort algorithm', message: 'Implement quicksort in TypeScript with detailed comments', icon: '📊' },
  ],
};

export function ChatView({
  session,
  activeDemo,
  onSendMessage,
  onCancel,
  onRetry,
  isStreaming,
}: ChatViewProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isEmpty = session.messages.length === 0;
  const suggestions = DEMO_SUGGESTIONS[activeDemo] || DEMO_SUGGESTIONS.chat;

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    onSendMessage(trimmed);
    setInput('');
  }, [input, isStreaming, onSendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
      if (e.key === 'Escape' && isStreaming) {
        onCancel();
      }
    },
    [handleSubmit, isStreaming, onCancel],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Messages or Welcome */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px',
        }}
      >
        {isEmpty ? (
          /* Welcome Screen */
          <div className="demo-home">
            <div>
              <div className="demo-home__icon">✨</div>
              <h1 className="demo-home__title">
                {activeDemo === 'tools'
                  ? 'Tool Calling Demo'
                  : activeDemo === 'code'
                    ? 'Code Assistant'
                    : 'AI Chat Demo'}
              </h1>
              <p className="demo-home__desc">
                This demo shows <strong>@agent-chat/react</strong> rendering a
                live AI conversation powered by the{' '}
                <strong>Vercel AI SDK</strong>. Try one of these prompts:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
                {suggestions.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => onSendMessage(s.message)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 18px',
                      background: '#313244',
                      border: '1px solid #45475a',
                      borderRadius: 10,
                      color: '#cdd6f4',
                      fontSize: 13,
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) =>
                      ((e.target as HTMLElement).style.background = '#45475a')
                    }
                    onMouseLeave={(e) =>
                      ((e.target as HTMLElement).style.background = '#313244')
                    }
                  >
                    <span>{s.icon}</span>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Message List */
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            {session.messages.map((msg) =>
              msg.role === 'user' ? (
                <UserMessage key={msg.id} request={msg as ChatRequest} />
              ) : (
                <AssistantMessage
                  key={msg.id}
                  response={msg as ChatResponse}
                  onRetry={onRetry}
                />
              ),
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div
        style={{
          padding: '12px 24px 20px',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            maxWidth: 800,
            margin: '0 auto',
            border: '1px solid #45475a',
            borderRadius: 14,
            background: '#1e1e2e',
            overflow: 'hidden',
            transition: 'border-color 0.2s',
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              activeDemo === 'tools'
                ? 'Ask about weather, calculate, or search...'
                : activeDemo === 'code'
                  ? 'Describe the code you need...'
                  : 'Type a message...'
            }
            rows={1}
            disabled={false}
            style={{
              width: '100%',
              resize: 'none',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: '#cdd6f4',
              fontSize: 14,
              lineHeight: 1.5,
              padding: '14px 18px',
              fontFamily: 'var(--font-sans)',
              maxHeight: 200,
              overflowY: 'auto',
            }}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '4px 12px 8px',
            }}
          >
            <span style={{ fontSize: 11, color: '#585b70' }}>
              Enter to send · Shift+Enter for new line
              {isStreaming && ' · Esc to cancel'}
            </span>
            {isStreaming ? (
              <button
                onClick={onCancel}
                style={{
                  padding: '6px 16px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#f38ba8',
                  color: '#1e1e2e',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                ■ Stop
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!input.trim()}
                style={{
                  padding: '6px 16px',
                  borderRadius: 8,
                  border: 'none',
                  background: input.trim() ? '#cba6f7' : '#45475a',
                  color: input.trim() ? '#1e1e2e' : '#585b70',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: input.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                ↑ Send
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Message Components ───

function UserMessage({ request }: { request: ChatRequest }) {
  return (
    <div style={{ margin: '16px 0' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 8,
          fontSize: 13,
        }}
      >
        <span
          style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: '#585b70',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
          }}
        >
          👤
        </span>
        <strong style={{ color: '#cdd6f4' }}>You</strong>
      </div>
      <div style={{ paddingLeft: 32, color: '#cdd6f4' }}>
        {request.message}
      </div>
    </div>
  );
}

function AssistantMessage({
  response,
  onRetry,
}: {
  response: ChatResponse;
  onRetry: () => void;
}) {
  const isStreaming = response.state === 'streaming';

  return (
    <div style={{ margin: '16px 0' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 8,
          fontSize: 13,
        }}
      >
        <span
          style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: 'rgba(203, 166, 247, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
          }}
        >
          {response.agent?.icon || '✨'}
        </span>
        <strong style={{ color: '#cba6f7' }}>
          {response.agent?.name || 'Assistant'}
        </strong>
        {isStreaming && (
          <span style={{ fontSize: 11, color: '#585b70', animation: 'pulse 1.5s infinite' }}>
            typing...
          </span>
        )}
      </div>

      {/* Content Parts */}
      <div style={{ paddingLeft: 32 }}>
        {response.content.map((part, i) => (
          <ContentPartView key={`${part.kind}-${i}`} part={part} />
        ))}
      </div>

      {/* Error */}
      {response.error && (
        <div
          style={{
            marginLeft: 32,
            marginTop: 8,
            padding: '8px 14px',
            background: 'rgba(243, 139, 168, 0.1)',
            borderRadius: 8,
            color: '#f38ba8',
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span>✕</span>
          {response.error.message}
          <button
            onClick={onRetry}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: '1px solid #f38ba8',
              borderRadius: 6,
              color: '#f38ba8',
              padding: '2px 10px',
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Footer (when complete) */}
      {response.state === 'complete' && (response.usage || response.elapsedMs) && (
        <div
          style={{
            marginLeft: 32,
            marginTop: 8,
            fontSize: 11,
            color: '#585b70',
            display: 'flex',
            gap: 12,
          }}
        >
          {response.elapsedMs && <span>{(response.elapsedMs / 1000).toFixed(1)}s</span>}
          {response.usage?.totalTokens && (
            <span>{response.usage.totalTokens} tokens</span>
          )}
        </div>
      )}
    </div>
  );
}

function ContentPartView({ part }: { part: ContentPart }) {
  switch (part.kind) {
    case 'markdown':
      return (
        <div className="chat-markdown" style={{ color: '#cdd6f4', lineHeight: 1.7 }}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              code: ({ children, className, ...props }: any) => {
                const isInline = !className;
                if (isInline) {
                  return (
                    <code
                      style={{
                        background: '#313244',
                        padding: '2px 6px',
                        borderRadius: 4,
                        fontSize: '0.9em',
                        fontFamily: 'var(--font-mono)',
                      }}
                      {...props}
                    >
                      {children}
                    </code>
                  );
                }
                return (
                  <div
                    style={{
                      background: '#11111b',
                      border: '1px solid #313244',
                      borderRadius: 10,
                      overflow: 'hidden',
                      margin: '12px 0',
                    }}
                  >
                    <div
                      style={{
                        padding: '6px 14px',
                        borderBottom: '1px solid #313244',
                        fontSize: 11,
                        color: '#6c7086',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>{className?.replace('language-', '') || 'code'}</span>
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(
                            String(children).replace(/\n$/, ''),
                          )
                        }
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#6c7086',
                          cursor: 'pointer',
                          fontSize: 11,
                        }}
                      >
                        📋 Copy
                      </button>
                    </div>
                    <pre
                      style={{
                        padding: 14,
                        overflow: 'auto',
                        margin: 0,
                        fontFamily: 'var(--font-mono)',
                        fontSize: 13,
                        lineHeight: 1.6,
                      }}
                    >
                      <code {...props}>{children}</code>
                    </pre>
                  </div>
                );
              },
              a: ({ children, href, ...props }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#89b4fa', textDecoration: 'underline' }}
                  {...props}
                >
                  {children}
                </a>
              ),
            }}
          >
            {part.content}
          </ReactMarkdown>
        </div>
      );

    case 'thinking':
      return (
        <details
          open={part.isStreaming}
          style={{
            margin: '8px 0',
            background: '#181825',
            borderRadius: 8,
            border: '1px solid #313244',
          }}
        >
          <summary
            style={{
              padding: '8px 14px',
              cursor: 'pointer',
              fontSize: 13,
              color: '#a6adc8',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>{part.isStreaming ? '⟳' : '✓'}</span>
            {part.title || 'Thinking'}
            {part.isStreaming && (
              <span style={{ fontSize: 11, color: '#585b70' }}>...</span>
            )}
          </summary>
          <div
            style={{
              padding: '8px 14px 12px',
              fontSize: 13,
              color: '#6c7086',
              maxHeight: 200,
              overflow: 'auto',
              borderTop: '1px solid #313244',
            }}
          >
            {part.content}
          </div>
        </details>
      );

    case 'tool-call':
      return (
        <div
          style={{
            margin: '8px 0',
            padding: '10px 14px',
            background: '#181825',
            border: '1px solid #313244',
            borderRadius: 8,
            fontSize: 13,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: part.output ? 8 : 0,
            }}
          >
            <span>
              {part.status === 'complete'
                ? '✓'
                : part.status === 'running'
                  ? '⟳'
                  : '…'}
            </span>
            <span style={{ color: '#a6adc8' }}>
              🔧 <strong>{part.toolId}</strong>
            </span>
            <span
              style={{
                fontSize: 11,
                color:
                  part.status === 'complete'
                    ? '#a6e3a1'
                    : part.status === 'running'
                      ? '#f9e2af'
                      : '#585b70',
              }}
            >
              {part.status}
            </span>
          </div>
          {part.input != null && (
            <details style={{ marginBottom: part.output ? 6 : 0 }}>
              <summary
                style={{ cursor: 'pointer', fontSize: 11, color: '#585b70' }}
              >
                Input
              </summary>
              <pre
                style={{
                  fontSize: 11,
                  color: '#6c7086',
                  padding: '6px 0',
                  overflow: 'auto',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {JSON.stringify(part.input, null, 2)}
              </pre>
            </details>
          )}
          {part.output && (
            <details>
              <summary
                style={{ cursor: 'pointer', fontSize: 11, color: '#585b70' }}
              >
                Output
              </summary>
              <pre
                style={{
                  fontSize: 11,
                  color: '#a6e3a1',
                  padding: '6px 0',
                  overflow: 'auto',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {part.output}
              </pre>
            </details>
          )}
        </div>
      );

    case 'working':
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 0',
            color: '#585b70',
            fontSize: 13,
          }}
        >
          <span style={{ animation: 'pulse 1.5s infinite' }}>●●●</span>
        </div>
      );

    case 'error':
      return (
        <div
          style={{
            padding: '8px 14px',
            background: 'rgba(243, 139, 168, 0.1)',
            borderRadius: 8,
            color: '#f38ba8',
            fontSize: 13,
            margin: '8px 0',
          }}
        >
          ✕ {part.message}
        </div>
      );

    default:
      return null;
  }
}
