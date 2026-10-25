# @agent-chat/react

A reusable, themeable, data-driven React component library for AI agent chat interfaces — inspired by VS Code's chat architecture and re-engineered as an idiomatic React library.

---

## Features

- **Backend-Agnostic & Adapter-Driven:** Zero lock-in. Connects with OpenAI, Anthropic, LangChain, Vercel AI SDK, or custom WebSockets via the `ChatAgentAdapter` interface or direct `ChatSession` state management.
- **Rich Content Parts:** Built-in renderers for Markdown (GFM, KaTeX math), syntax-highlighted code blocks (powered by Shiki), thinking/reasoning blocks, tool invocations, inline diffs, workspace edits, file change summaries, file trees, progress steps, and dockable todo lists.
- **Interactive Tool Calls:** Interactive UI for tool approval workflows, confirmations, terminal command executions, risk level indicators, and MCP app displays.
- **VS Code Look & Feel:** Includes curated dark (`darkTheme`) and light (`lightTheme`) presets built on CSS variables for seamless theme customization.
- **Performance & Scalability:** Virtualized message list powered by `react-virtuoso` to handle long conversations with minimal memory footprint.
- **Accessibility:** Designed with WCAG 2.1 AA compliance, proper ARIA live regions for screen reader announcements, and keyboard navigability.
- **TypeScript-First:** Fully typed data models, content parts, events, configuration options, and component props.

---

## Installation

```bash
npm install @agent-chat/react
```

### Peer Dependencies

Ensure your project has the required peer dependencies installed:

```bash
npm install react react-dom
```

> **Note:** `@agent-chat/react` supports React 18 and 19.

---

## Quick Start

### 1. Import Styles

Import the library's CSS in your application entry point (e.g. `main.tsx` or `App.tsx`):

```tsx
import '@agent-chat/react/styles.css';
```

### 2. Basic Setup with `AgentChat` and `ChatProvider`

Wrap the `AgentChat` widget with `ChatProvider` to provide session state, callback handlers, configuration, and theming:

```tsx
import { useState } from 'react';
import {
  ChatProvider,
  AgentChat,
  darkTheme,
  type ChatSession,
  type ChatRequest,
  type ChatResponse,
} from '@agent-chat/react';
import '@agent-chat/react/styles.css';

export function App() {
  const [session, setSession] = useState<ChatSession>({
    id: 'session-1',
    messages: [],
  });

  const handleSendMessage = (text: string) => {
    const userMessage: ChatRequest = {
      id: `req-${Date.now()}`,
      role: 'user',
      timestamp: Date.now(),
      message: { text },
    };

    const assistantMessage: ChatResponse = {
      id: `res-${Date.now()}`,
      role: 'assistant',
      timestamp: Date.now(),
      state: 'complete',
      agent: { id: 'assistant', name: 'Agent', icon: '🤖' },
      content: [
        {
          kind: 'markdown',
          content: `You said: **${text}**`,
        },
      ],
    };

    setSession((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage, assistantMessage],
    }));
  };

  return (
    <ChatProvider
      session={session}
      onSendMessage={handleSendMessage}
      theme={darkTheme}
      config={{
        welcomeTitle: 'Hello! How can I help you today?',
        showTodoList: true,
      }}
    >
      <AgentChat />
    </ChatProvider>
  );
}
```

---

## Streaming with `useAgentSession` & Adapters

For agent streaming, tool calls, and multi-turn workflows, use the built-in `useAgentSession` hook with an implementation of `ChatAgentAdapter`:

```tsx
import {
  ChatProvider,
  AgentChat,
  useAgentSession,
  darkTheme,
  type ChatAgentAdapter,
} from '@agent-chat/react';
import '@agent-chat/react/styles.css';

const myAgentAdapter: ChatAgentAdapter = {
  async *sendMessage({ message, signal }) {
    yield { type: 'reasoning', text: 'Analyzing the request...' };
    yield { type: 'text-delta', text: 'Hello! ' };
    yield { type: 'text-delta', text: 'Here is what I found.' };
    yield { type: 'done' };
  },
};

export function AgentChatApp() {
  const { session, sendMessage, cancel, isStreaming } = useAgentSession(myAgentAdapter);

  return (
    <ChatProvider
      session={session}
      onSendMessage={sendMessage}
      onCancelResponse={cancel}
      theme={darkTheme}
    >
      <AgentChat />
    </ChatProvider>
  );
}
```

---

## Architecture & Core Concepts

```
┌─────────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│  Any Agent Backend   │────▶│  Adapter Layer   │────▶│  @agent-chat/react  │
│  (OpenAI, Anthropic, │     │  Transforms data │     │  Renders streaming  │
│   LangChain, etc.)   │     │  into Session &  │     │  chat UI, tools,    │
│                      │     │  Content Parts   │     │  diffs & markdown   │
└─────────────────────┘     └──────────────────┘     └─────────────────────┘
```

1. **`ChatSession`**: The root state object containing an `id` and an array of `ChatMessage` items (`ChatRequest` or `ChatResponse`).
2. **`ChatContentPart`**: A discriminated union representing atomic response elements (`markdown`, `code-block`, `thinking`, `tool-call`, `todo-list`, `progress`, `inline-diff`, `file-tree`, etc.).
3. **`ChatProvider`**: React context provider managing session state, theme tokens, configuration, and event callbacks (`onSendMessage`, `onVote`, `onAction`, `onCancelResponse`, etc.).
4. **`AgentChat`**: The main composed widget integrating welcome banners, virtualized message lists, dockable task lists, and the rich input area.

---

## Content Parts Supported

- **Text & Markdown:** `markdown`, `collapsible-markdown`
- **Code & Diffs:** `code-block`, `inline-diff`, `workspace-edit`, `file-changes-summary`, `code-citation`
- **Reasoning & State:** `thinking`, `sub-agent`, `progress`, `working`, `todo-list`, `plan-review`
- **Tool Invocations:** `tool-call`, `tool-confirmation`, `tool-confirmation-carousel`, `terminal-command`
- **Interactive & Guidance:** `confirmation`, `elicitation`, `suggest-next`, `followup`, `command-button`, `pull-request`
- **System & Diagnostic:** `error`, `system-notification`, `workspace-transition`, `quota-exceeded`, `rate-limited`
- **Media & References:** `image`, `file-tree`, `references`, `inline-reference`

---

## Customization & Theming

### Themes

Switch between dark and light presets, or define your own:

```tsx
import { ChatProvider, AgentChat, lightTheme } from '@agent-chat/react';

<ChatProvider session={session} theme={lightTheme}>
  <AgentChat />
</ChatProvider>;
```

### Component Overrides

Override default content part and attachment renderers via `config`:

```tsx
<ChatProvider
  session={session}
  config={{
    contentPartOverrides: {
      'custom-part': ({ part }) => <div>Custom renderer</div>,
    },
  }}
>
  <AgentChat />
</ChatProvider>
```

---

## License

MIT
