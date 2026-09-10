# Agent Chat Demo

A comprehensive demo application showcasing **@agent-chat/react** library integrated with the **Vercel AI SDK** for building AI agent chat interfaces.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Next.js App                     │
│                                                   │
│  ┌──────────┐     ┌──────────────┐    ┌────────┐ │
│  │ AI SDK   │────→│  Adapter     │───→│ Chat   │ │
│  │ useChat  │     │  (converts   │    │ View   │ │
│  │ hook     │     │  UIMessage → │    │ (React │ │
│  │          │     │  ChatSession)│    │  UI)   │ │
│  └────┬─────┘     └──────────────┘    └────────┘ │
│       │                                           │
│  ┌────▼─────┐                                     │
│  │ API Route│  POST /api/chat                     │
│  │ streamText│  Tools: weather, calculator, search│
│  └──────────┘                                     │
└─────────────────────────────────────────────────┘
```

## Features

### 🤖 AI SDK Integration
- **Streaming** — real-time token-by-token response rendering
- **Multi-step tool calling** — weather, calculator, web search tools
- **Reasoning tokens** — displays AI reasoning in collapsible blocks
- **Message metadata** — timestamps, token usage tracking

### 💬 Chat UI
- **Rich markdown** — GFM tables, code blocks with copy button
- **Tool invocation display** — input/output visualization
- **Thinking blocks** — collapsible reasoning display
- **Working indicator** — animated typing state
- **Error handling** — error display with retry button

### 🎨 Interface
- **Catppuccin Mocha** dark theme
- **Sidebar navigation** with demo modes
- **Model picker** (GPT-4o Mini, GPT-4o, GPT-4.1 Mini)
- **Runtime API key** input
- **Responsive** layout

## Demo Modes

| Mode | Description |
|------|-------------|
| **Chat** | General conversation with AI |
| **Tool Calls** | Weather, calculator, and web search demonstrations |
| **Code Assistant** | Code generation with syntax highlighting |

## Getting Started

### 1. Install dependencies

```bash
cd agent-chat-demo
npm install
```

### 2. Set your OpenAI API key

Edit `.env.local`:

```env
OPENAI_API_KEY=sk-your-actual-key-here
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Adapter Pattern

The key architectural insight is the **adapter layer** (`src/lib/ai-sdk-adapter.ts`) that converts between:

- **AI SDK** `UIMessage[]` (with `parts: text | tool-* | reasoning`) 
- **@agent-chat/react** `ChatSession` (with `content: ChatContentPart[]`)

This pattern makes the library backend-agnostic — swap the adapter to support:
- Vercel AI SDK ✅ (this demo)
- LangChain / LangGraph
- Anthropic SDK
- OpenAI SDK
- Custom backends

## Tech Stack

| Tool | Purpose |
|------|---------|
| Next.js 15 | React framework with App Router |
| AI SDK v7 | `useChat` hook + `streamText` |
| @ai-sdk/openai | OpenAI model provider |
| react-markdown | Markdown rendering |
| remark-gfm | GFM support |
| TypeScript | Type safety |

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main demo page
│   ├── globals.css         # Global styles
│   └── api/chat/route.ts   # AI SDK API route
├── components/
│   └── ChatView.tsx        # Chat rendering component
└── lib/
    └── ai-sdk-adapter.ts   # AI SDK → ChatSession adapter
```
