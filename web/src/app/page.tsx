'use client';

/**
 * Demo App — TRUE end-to-end @agent-chat/react + AI SDK integration.
 *
 * Architecture:
 *   AI SDK useChat → ai-sdk-adapter → ChatSession → ChatProvider → AgentChat
 *
 * The ChatProvider and AgentChat are imported from the ACTUAL library source.
 */

import { useState, useCallback, useMemo } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { convertToSession } from '@/lib/ai-sdk-adapter';

// ─── IMPORT FROM @agent-chat/react LIBRARY ───
import {
  ChatProvider,
  AgentChat,
  darkTheme,
} from '@agent-chat/react';

// Import the library's CSS (from the parent library source)
import '../../../src/theme/css/index.css';

const MODELS = [
  { id: 'gpt-5.6-luna', label: 'GPT-5.6 Luna', desc: 'Latest flagship' },
  { id: 'gpt-5.1', label: 'GPT-5.1', desc: 'General-purpose' },
  { id: 'gpt-5.1-mini', label: 'GPT-5.1 Mini', desc: 'Cost-effective' },
  { id: 'gpt-4.1-nano', label: 'GPT-4.1 Nano', desc: 'Fastest' },
  { id: 'gpt-4.1-mini', label: 'GPT-4.1 Mini', desc: 'Affordable' },
  { id: 'gpt-4.1', label: 'GPT-4.1', desc: 'Coding' },
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini', desc: 'Multimodal' },
  { id: 'gpt-4o', label: 'GPT-4o', desc: 'Strong multimodal' },
  { id: 'o4-mini', label: 'o4-mini', desc: 'Fast reasoning' },
  { id: 'o3', label: 'o3', desc: 'Advanced reasoning' },
];

const DEMOS = [
  { id: 'chat', label: 'Chat', icon: '💬', desc: 'General chat with AI' },
  { id: 'tools', label: 'Tool Calls', icon: '🔧', desc: 'Weather, calculator, search' },
  { id: 'code', label: 'Code Assistant', icon: '💻', desc: 'Code generation & review' },
];

const DEMO_SUGGESTIONS: Record<string, Array<{ label: string; message: string; icon?: string }>> = {
  chat: [
    { label: 'Explain quantum computing', message: 'Explain quantum computing in simple terms', icon: '🔬' },
    { label: 'Write a haiku', message: 'Write a haiku about programming', icon: '📝' },
    { label: 'Explain React hooks', message: 'Explain React hooks with examples', icon: '⚛️' },
  ],
  tools: [
    { label: "What's the weather?", message: "What's the weather in Tokyo, Japan?", icon: '🌤️' },
    { label: 'Calculate something', message: 'Calculate (123 * 456) + 789', icon: '🔢' },
    { label: 'Search the web', message: 'Search for the latest AI news', icon: '🔍' },
  ],
  code: [
    { label: 'React component', message: 'Write a React component for a todo list with TypeScript', icon: '⚛️' },
    { label: 'API endpoint', message: 'Write a REST API endpoint for user authentication', icon: '🔌' },
    { label: 'Sort algorithm', message: 'Implement quicksort in TypeScript with comments', icon: '📊' },
  ],
};

export default function DemoApp() {
  const [selectedModel, setSelectedModel] = useState('gpt-5.6-luna');
  const [activeDemo, setActiveDemo] = useState('chat');
  const [apiKey, setApiKey] = useState('');

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        body: () => ({ model: selectedModel }),
        headers: apiKey ? () => ({ 'X-API-Key': apiKey }) : undefined,
      }),
    [selectedModel, apiKey],
  );

  const { messages, sendMessage, status, stop, setMessages, error } = useChat({ transport });

  // ─── Convert AI SDK messages → @agent-chat/react ChatSession ───
  const session = useMemo(
    () => convertToSession(messages, status, 'demo-session', error ?? null),
    [messages, status, error],
  );

  // ─── Bridge callbacks: library → AI SDK ───
  const handleSendMessage = useCallback(
    (text: string) => { sendMessage({ text }); },
    [sendMessage],
  );

  const handleCancel = useCallback(
    () => { stop(); },
    [stop],
  );

  const handleRetry = useCallback(
    () => {
      const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
      if (lastUserMsg) {
        const userText = lastUserMsg.parts
          ?.filter((p) => p.type === 'text')
          .map((p) => (p as { text: string }).text)
          .join('\n');
        setMessages(messages.filter((m) => m.id !== messages[messages.length - 1]?.id));
        if (userText) setTimeout(() => sendMessage({ text: userText }), 100);
      }
    },
    [messages, sendMessage, setMessages],
  );

  const handleNewChat = useCallback(() => { setMessages([]); }, [setMessages]);

  const isConnected = status !== 'error';
  const suggestions = DEMO_SUGGESTIONS[activeDemo] || DEMO_SUGGESTIONS.chat;

  return (
    <div className="demo-layout">
      {/* ─── Sidebar ─── */}
      <aside className="demo-sidebar">
        <div className="demo-sidebar__header">
          <div className="demo-sidebar__title">Agent Chat Demo</div>
          <div className="demo-sidebar__subtitle">@agent-chat/react + AI SDK</div>
        </div>
        <nav className="demo-sidebar__nav">
          <button className="demo-nav-item" onClick={handleNewChat}>
            <span className="demo-nav-item__icon">✨</span>New Chat
          </button>
          <div style={{ padding: '12px 14px 6px', fontSize: 11, color: '#585b70', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Demos
          </div>
          {DEMOS.map((d) => (
            <button
              key={d.id}
              className={`demo-nav-item ${activeDemo === d.id ? 'demo-nav-item--active' : ''}`}
              onClick={() => { setActiveDemo(d.id); handleNewChat(); }}
            >
              <span className="demo-nav-item__icon">{d.icon}</span>
              <div>
                <div>{d.label}</div>
                <div style={{ fontSize: 10, color: '#585b70' }}>{d.desc}</div>
              </div>
            </button>
          ))}
        </nav>
        <div className="demo-sidebar__footer">
          <div style={{ marginBottom: 6 }}>
            Status:{' '}
            <span className={`demo-badge ${isConnected ? 'demo-badge--green' : 'demo-badge--red'}`}>
              {isConnected ? 'Connected' : 'Error'}
            </span>
          </div>
          <div>450 tests · 10 phases · MIT</div>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="demo-main">
        {/* Settings Bar */}
        <div className="demo-settings">
          <div>
            <span className="demo-settings__label">Model</span>
            <select className="demo-settings__select" value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} style={{ marginLeft: 8 }}>
              {MODELS.map((m) => (<option key={m.id} value={m.id}>{m.label}</option>))}
            </select>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <span className="demo-settings__label">API Key</span>
            <input type="password" className="demo-settings__input" placeholder="sk-... (uses .env.local by default)" value={apiKey} onChange={(e) => setApiKey(e.target.value)} style={{ marginLeft: 8, width: 260 }} />
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            REAL @agent-chat/react LIBRARY USAGE
            ══════════════════════════════════════════════ */}
        <div className="demo-chat-container">
          <ChatProvider
            session={session}
            theme={darkTheme}
            onSendMessage={handleSendMessage}
            onCancelResponse={handleCancel}
            onRetryResponse={handleRetry}
            activeAgent={{ id: 'ai-assistant', name: 'AI Assistant', icon: '✨' }}
            config={{
              showVoteButtons: false,
              showCopyButton: true,
              showResponseDetails: true,
              showTokenUsage: true,
              showTodoList: true,
              placeholder:
                activeDemo === 'tools' ? 'Ask about weather, calculate, or search...'
                  : activeDemo === 'code' ? 'Describe the code you need...'
                    : 'Type a message...',
              welcomeTitle:
                activeDemo === 'tools' ? 'Tool Calling Demo'
                  : activeDemo === 'code' ? 'Code Assistant'
                    : 'AI Chat Demo',
              welcomeSuggestions: suggestions,
            }}
          >
            <AgentChat />
          </ChatProvider>
        </div>
      </main>
    </div>
  );
}
