'use client';

/**
 * Coding Agent Demo — Full end-to-end @agent-chat/react integration
 *
 * Architecture:
 *   OpenAIAgentAdapter (ChatAgentAdapter)
 *     → useAgentSession (library hook) → ChatSession
 *       → ChatProvider (library) → AgentChat (library)
 *
 * Everything flows through the library's standard interfaces.
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { OpenAIAgentAdapter } from '@/lib/OpenAIAgentAdapter';

// ─── ALL IMPORTS FROM @agent-chat/react LIBRARY ───
import {
  ChatProvider,
  AgentChat,
  darkTheme,
  lightTheme,
  useAgentSession,
} from '@agent-chat/react';

// Import VS Code codicon font + library CSS
import '@vscode/codicons/dist/codicon.css';
import '../../../src/theme/css/index.css';

const MODELS = [
  { id: 'gpt-4.1-nano', label: 'GPT-4.1 Nano', desc: 'Fastest' },
  { id: 'gpt-4.1-mini', label: 'GPT-4.1 Mini', desc: 'Best value' },
  { id: 'gpt-4.1', label: 'GPT-4.1', desc: 'Best for coding' },
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini', desc: 'Multimodal' },
  { id: 'gpt-4o', label: 'GPT-4o', desc: 'Strong multimodal' },
  { id: 'o4-mini', label: 'o4-mini', desc: 'Reasoning' },
];

const SUGGESTIONS = [
  { label: 'Read project files', message: 'List all the files in this project and read the main source files', icon: '📂' },
  { label: 'Write a React component', message: 'Write a React TodoList component in src/components/TodoList.tsx with TypeScript. Include add, toggle, and delete functionality.', icon: '⚛️' },
  { label: 'Review the code', message: 'Review the code in src/utils.ts. Check for bugs, suggest improvements, and rate the code quality.', icon: '🔍' },
  { label: 'Fix a bug & test', message: 'Search for any issues in the codebase, fix them, and run the tests to verify.', icon: '🐛' },
  { label: 'Research & implement', message: 'Research best practices for error handling in TypeScript, then create an error handling utility in src/errors.ts', icon: '📚' },
  { label: 'Full task with plan', message: 'Create a comprehensive logging system for the project: 1) Plan the approach with todos, 2) Create logger.ts, 3) Add it to existing files, 4) Run tests', icon: '📋' },
];

export default function DemoApp() {
  const [selectedModel, setSelectedModel] = useState('gpt-4.1-mini');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Sync data-theme attribute on <html> for CSS variables
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;

  // ─── Create adapter (implements ChatAgentAdapter interface) ───
  const adapter = useMemo(() => {
    const a = new OpenAIAgentAdapter({ model: selectedModel });
    return a;
  }, [selectedModel]);

  // ─── Use the library's useAgentSession hook ───
  const { session, sendMessage, cancel, clearMessages, isStreaming, error } =
    useAgentSession(adapter, {
      sessionId: 'coding-agent-session',
      defaultAgent: { id: 'coding-agent', name: 'Coding Agent', icon: { iconId: 'copilot' } },
    });

  const handleSendMessage = useCallback(
    (text: string) => { sendMessage(text); },
    [sendMessage],
  );

  const handleCancel = useCallback(() => { cancel(); }, [cancel]);
  const handleNewChat = useCallback(() => { clearMessages(); }, [clearMessages]);

  return (
    <div className="demo-layout">
      {/* ─── Sidebar ─── */}
      <aside className="demo-sidebar">
        <div className="demo-sidebar__header">
          <div className="demo-sidebar__title">Coding Agent</div>
          <div className="demo-sidebar__subtitle">@agent-chat/react demo</div>
        </div>
        <nav className="demo-sidebar__nav">
          <button className="demo-nav-item" onClick={handleNewChat}>
            <span className="demo-nav-item__icon">
              <i className="codicon codicon-add" />
            </span>
            New Chat
          </button>

          <div style={{ padding: '16px 14px 8px', fontSize: 11, color: 'var(--demo-section-label)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Features
          </div>
          {[
            { icon: 'codicon-file-code', label: 'Read/Write Files' },
            { icon: 'codicon-search', label: 'Search Code' },
            { icon: 'codicon-terminal', label: 'Run Commands' },
            { icon: 'codicon-globe', label: 'Web Search' },
            { icon: 'codicon-checklist', label: 'Task Planning' },
            { icon: 'codicon-git-merge', label: 'Agent Handoffs' },
            { icon: 'codicon-symbol-misc', label: 'Chain of Thought' },
          ].map((f) => (
            <div key={f.label} className="demo-nav-item" style={{ cursor: 'default', opacity: 0.7 }}>
              <span className="demo-nav-item__icon"><i className={`codicon ${f.icon}`} /></span>
              {f.label}
            </div>
          ))}
        </nav>
        <div className="demo-sidebar__footer">
          <div style={{ marginBottom: 6 }}>
            <span className={`demo-badge ${!error ? 'demo-badge--green' : 'demo-badge--red'}`}>
              {!error ? '● Connected' : '✕ Error'}
            </span>
          </div>
          <div style={{ fontSize: 10, color: 'var(--demo-footer-sub)' }}>
            OpenAI Agents SDK · ChatAgentAdapter
          </div>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="demo-main">
        {/* Settings Bar */}
        <div className="demo-settings">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="demo-settings__label">Model</span>
            <select
              className="demo-settings__select"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>{m.label} — {m.desc}</option>
              ))}
            </select>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              className="demo-theme-toggle"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
{theme === 'dark' ? '☀️' : '🌙'}
            </button>
            {isStreaming && (
              <span className="demo-badge demo-badge--yellow">
                <i className="codicon codicon-loading ac-icon-spin" style={{ marginRight: 4 }} />
                Agent running…
              </span>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            @agent-chat/react LIBRARY — Full Integration
            ChatProvider + AgentChat using useAgentSession hook
            ══════════════════════════════════════════════════════ */}
        <div className="demo-chat-container">
          <ChatProvider
            session={session}
            theme={currentTheme}
            onSendMessage={handleSendMessage}
            onCancelResponse={handleCancel}
            activeAgent={{ id: 'coding-agent', name: 'Coding Agent', icon: { iconId: 'copilot' } }}
            config={{
              showVoteButtons: false,
              showCopyButton: true,
              showResponseDetails: true,
              showTokenUsage: false,
              showTodoList: true,
              placeholder: 'Ask the coding agent to read, write, search, or fix code…',
              welcomeTitle: 'Coding Agent',
              welcomeSuggestions: SUGGESTIONS,
            }}
          >
            <AgentChat
              welcomeSubtitle="I can read & write files, run commands, search code, plan tasks, and hand off to specialist agents. Try a suggestion below!"
            />
          </ChatProvider>
        </div>
      </main>
    </div>
  );
}
