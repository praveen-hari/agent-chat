'use client';

/**
 * Demo App — Agent Chat with AI SDK
 *
 * This is a comprehensive demo showing how to use @agent-chat/react
 * with the Vercel AI SDK as the backend provider.
 *
 * Architecture:
 *   AI SDK useChat hook → adapter → ChatSession → ChatProvider → AgentChat
 */

import { useState, useCallback, useMemo } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { convertToSession } from '@/lib/ai-sdk-adapter';
import { ChatView } from '@/components/ChatView';

const MODELS = [
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini', desc: 'Fast & affordable' },
  { id: 'gpt-4o', label: 'GPT-4o', desc: 'Most capable' },
  { id: 'gpt-4.1-mini', label: 'GPT-4.1 Mini', desc: 'Latest mini' },
];

const DEMOS = [
  { id: 'chat', label: 'Chat', icon: '💬', desc: 'General chat with AI' },
  {
    id: 'tools',
    label: 'Tool Calls',
    icon: '🔧',
    desc: 'Weather, calculator, search',
  },
  {
    id: 'code',
    label: 'Code Assistant',
    icon: '💻',
    desc: 'Code generation & review',
  },
];

export default function DemoApp() {
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [activeDemo, setActiveDemo] = useState('chat');
  const [apiKey, setApiKey] = useState('');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        body: () => ({ model: selectedModel }),
        headers: apiKey
          ? () => ({ 'X-API-Key': apiKey })
          : undefined,
      }) as any,
    [selectedModel, apiKey],
  );

  const {
    messages,
    sendMessage,
    status,
    stop,
    setMessages,
    error,
  } = useChat({ transport });

  // Convert AI SDK messages to @agent-chat/react ChatSession
  const session = useMemo(
    () => convertToSession(messages, status, 'demo-session', error ?? null),
    [messages, status, error],
  );

  // Callbacks for @agent-chat/react
  const handleSendMessage = useCallback(
    (text: string) => {
      sendMessage({ text });
    },
    [sendMessage],
  );

  const handleCancel = useCallback(() => {
    stop();
  }, [stop]);

  const handleRetry = useCallback(() => {
    // Remove last assistant message and re-send last user message
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      const userText = lastUserMsg.parts
        ?.filter((p) => p.type === 'text')
        .map((p) => (p as { text: string }).text)
        .join('\n');
      setMessages(messages.filter((m) => m.id !== messages[messages.length - 1]?.id));
      if (userText) {
        setTimeout(() => sendMessage({ text: userText }), 100);
      }
    }
  }, [messages, sendMessage, setMessages]);

  const handleNewChat = useCallback(() => {
    setMessages([]);
  }, [setMessages]);

  const isConnected = status !== 'error';

  return (
    <div className="demo-layout">
      {/* Sidebar */}
      <aside className="demo-sidebar">
        <div className="demo-sidebar__header">
          <div className="demo-sidebar__title">Agent Chat Demo</div>
          <div className="demo-sidebar__subtitle">
            @agent-chat/react + AI SDK
          </div>
        </div>

        <nav className="demo-sidebar__nav">
          <button className="demo-nav-item" onClick={handleNewChat}>
            <span className="demo-nav-item__icon">✨</span>
            New Chat
          </button>

          <div
            style={{
              padding: '12px 14px 6px',
              fontSize: 11,
              color: '#585b70',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Demos
          </div>

          {DEMOS.map((demo) => (
            <button
              key={demo.id}
              className={`demo-nav-item ${activeDemo === demo.id ? 'demo-nav-item--active' : ''}`}
              onClick={() => {
                setActiveDemo(demo.id);
                handleNewChat();
              }}
            >
              <span className="demo-nav-item__icon">{demo.icon}</span>
              <div>
                <div>{demo.label}</div>
                <div style={{ fontSize: 10, color: '#585b70' }}>
                  {demo.desc}
                </div>
              </div>
            </button>
          ))}
        </nav>

        <div className="demo-sidebar__footer">
          <div style={{ marginBottom: 6 }}>
            Status:{' '}
            <span
              className={`demo-badge ${isConnected ? 'demo-badge--green' : 'demo-badge--red'}`}
            >
              {isConnected ? 'Connected' : 'Error'}
            </span>
          </div>
          <div>450 tests · 10 phases · MIT</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="demo-main">
        {/* Settings Bar */}
        <div className="demo-settings">
          <div>
            <span className="demo-settings__label">Model</span>
            <select
              className="demo-settings__select"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              style={{ marginLeft: 8 }}
            >
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginLeft: 'auto' }}>
            <span className="demo-settings__label">API Key</span>
            <input
              type="password"
              className="demo-settings__input"
              placeholder="sk-... (uses .env.local by default)"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{ marginLeft: 8, width: 260 }}
            />
          </div>
        </div>

        {/* Chat Area */}
        <div className="demo-chat-container">
          <ChatView
            session={session as any}
            activeDemo={activeDemo}
            onSendMessage={handleSendMessage}
            onCancel={handleCancel}
            onRetry={handleRetry}
            isStreaming={status === 'streaming' || status === 'submitted'}
          />
        </div>
      </main>
    </div>
  );
}
