'use client';

/**
 * Demo App — @agent-chat/react + OpenAI Agents SDK
 *
 * Architecture:
 *   useAgentChat hook → SSE → API route (@openai/agents) → Agent loop
 *   useAgentChat produces ChatSession → ChatProvider → AgentChat (library)
 */

import { useState, useCallback } from 'react';
import { useAgentChat } from '@/lib/useAgentChat';

// ─── IMPORT FROM @agent-chat/react LIBRARY ───
import { ChatProvider, AgentChat, darkTheme } from '@agent-chat/react';

// Import the library's CSS
import '../../../src/theme/css/index.css';

const MODELS = [
  { id: 'gpt-4.1-nano', label: 'GPT-4.1 Nano', desc: 'Fastest' },
  { id: 'gpt-4.1-mini', label: 'GPT-4.1 Mini', desc: 'Affordable' },
  { id: 'gpt-4.1', label: 'GPT-4.1', desc: 'Best for coding' },
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini', desc: 'Multimodal' },
  { id: 'gpt-4o', label: 'GPT-4o', desc: 'Strong multimodal' },
  { id: 'o4-mini', label: 'o4-mini', desc: 'Fast reasoning' },
];

const DEMOS = [
  { id: 'chat', label: 'Chat', icon: '💬', desc: 'General AI assistant' },
  { id: 'tools', label: 'Agent + Tools', icon: '🔧', desc: 'Weather, calculator, search' },
  { id: 'code', label: 'Code Agent', icon: '💻', desc: 'Multi-agent handoff to Code Assistant' },
  { id: 'research', label: 'Research Agent', icon: '🔍', desc: 'Multi-agent handoff to Research' },
];

const DEMO_SUGGESTIONS: Record<string, Array<{ label: string; message: string; icon?: string }>> = {
  chat: [
    { label: 'Explain quantum computing', message: 'Explain quantum computing in simple terms', icon: '🔬' },
    { label: 'Write a haiku', message: 'Write a haiku about programming', icon: '📝' },
  ],
  tools: [
    { label: 'Weather in Tokyo', message: "What's the weather in Tokyo, Japan?", icon: '🌤️' },
    { label: 'Calculate 123 × 456', message: 'Calculate (123 * 456) + 789', icon: '🔢' },
    { label: 'Multi-step task', message: "Get the weather in London, then calculate the square of the temperature number", icon: '🔄' },
  ],
  code: [
    { label: 'React Todo component', message: 'Write a React component for a todo list with TypeScript', icon: '⚛️' },
    { label: 'REST API endpoint', message: 'Write a REST API endpoint in Node.js for user authentication', icon: '🔌' },
  ],
  research: [
    { label: 'Latest AI news', message: 'Research the latest developments in AI and summarize them', icon: '🤖' },
    { label: 'Quantum computing advances', message: 'Search for recent quantum computing breakthroughs and write a brief summary', icon: '🔬' },
  ],
};

export default function DemoApp() {
  const [selectedModel, setSelectedModel] = useState('gpt-4.1-mini');
  const [activeDemo, setActiveDemo] = useState('chat');

  const { session, sendMessage, cancel, clearMessages, isStreaming, error } =
    useAgentChat({ model: selectedModel });

  const handleSendMessage = useCallback(
    (text: string) => { sendMessage(text); },
    [sendMessage],
  );

  const handleCancel = useCallback(() => { cancel(); }, [cancel]);

  const handleNewChat = useCallback(() => { clearMessages(); }, [clearMessages]);

  const suggestions = DEMO_SUGGESTIONS[activeDemo] || DEMO_SUGGESTIONS.chat;

  return (
    <div className="demo-layout">
      {/* ─── Sidebar ─── */}
      <aside className="demo-sidebar">
        <div className="demo-sidebar__header">
          <div className="demo-sidebar__title">Agent Chat Demo</div>
          <div className="demo-sidebar__subtitle">@agent-chat/react + OpenAI Agents</div>
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
            <span className={`demo-badge ${!error ? 'demo-badge--green' : 'demo-badge--red'}`}>
              {!error ? 'Connected' : 'Error'}
            </span>
          </div>
          <div>OpenAI Agents SDK · Agent Loop</div>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
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
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>
          <div style={{ marginLeft: 16 }}>
            <span className={`demo-badge ${isStreaming ? 'demo-badge--yellow' : 'demo-badge--green'}`}>
              {isStreaming ? '⟳ Agent running...' : '● Ready'}
            </span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            @agent-chat/react LIBRARY — ChatProvider + AgentChat
            ══════════════════════════════════════════════ */}
        <div className="demo-chat-container">
          <ChatProvider
            session={session}
            theme={darkTheme}
            onSendMessage={handleSendMessage}
            onCancelResponse={handleCancel}
            activeAgent={{ id: 'ai-assistant', name: 'AI Assistant', icon: '✨' }}
            config={{
              showVoteButtons: false,
              showCopyButton: true,
              showResponseDetails: true,
              showTokenUsage: false,
              showTodoList: true,
              placeholder:
                activeDemo === 'tools' ? 'Ask about weather, calculate, or search...'
                  : activeDemo === 'code' ? 'Ask me to write code (hands off to Code Agent)...'
                    : activeDemo === 'research' ? 'Ask me to research a topic...'
                      : 'Type a message...',
              welcomeTitle:
                activeDemo === 'tools' ? '🔧 Agent + Tools Demo'
                  : activeDemo === 'code' ? '💻 Code Agent (Multi-Agent Handoff)'
                    : activeDemo === 'research' ? '🔍 Research Agent (Multi-Agent Handoff)'
                      : '✨ AI Chat with Agent Loop',
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
