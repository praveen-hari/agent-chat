'use client';

/**
 * Fixture Page — renders every content part type with hardcoded mock data.
 * No API calls, no LLM needed. Click a scenario → see it rendered instantly.
 */

import { useState } from 'react';
import { fixtureList, fixtures } from '@/lib/fixtures';

// Library imports
import { ChatProvider, AgentChat, darkTheme } from '@agent-chat/react';

// CSS
import '@vscode/codicons/dist/codicon.css';
import '../../../../src/theme/css/index.css';

export default function FixturePage() {
  const [activeFixture, setActiveFixture] = useState(fixtureList[0]?.key ?? 'markdown');

  const current = fixtures[activeFixture];
  if (!current) return null;

  return (
    <div className="demo-layout">
      {/* Sidebar */}
      <aside className="demo-sidebar">
        <div className="demo-sidebar__header">
          <div className="demo-sidebar__title">Component Fixtures</div>
          <div className="demo-sidebar__subtitle">All content part types</div>
        </div>
        <nav className="demo-sidebar__nav" style={{ overflowY: 'auto' }}>
          {fixtureList.map((fx) => (
            <button
              key={fx.key}
              className={`demo-nav-item ${activeFixture === fx.key ? 'demo-nav-item--active' : ''}`}
              onClick={() => setActiveFixture(fx.key)}
            >
              <span className="demo-nav-item__icon">
                <i className={`codicon codicon-${fx.icon}`} />
              </span>
              {fx.label}
            </button>
          ))}
        </nav>
        <div className="demo-sidebar__footer">
          <div>{fixtureList.length} fixtures · No API calls</div>
        </div>
      </aside>

      {/* Main */}
      <main className="demo-main">
        <div className="demo-settings">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <i className={`codicon codicon-${current.icon}`} style={{ fontSize: 16 }} />
            <strong>{current.label}</strong>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 11, color: '#585b70' }}>
            Session: {current.session.id} · {current.session.messages.length} messages
          </div>
        </div>

        <div className="demo-chat-container">
          <ChatProvider
            session={current.session}
            theme={darkTheme}
            onSendMessage={() => {}}
            activeAgent={{ id: 'agent', name: 'Coding Agent', icon: { iconId: 'copilot' } }}
            config={{
              showCopyButton: true,
              showResponseDetails: true,
              showTodoList: true,
              showVoteButtons: false,
              placeholder: 'Fixtures mode — read only',
            }}
          >
            <AgentChat />
          </ChatProvider>
        </div>
      </main>
    </div>
  );
}
