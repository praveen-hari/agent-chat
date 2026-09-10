---
description: "Global workspace instructions for the @agent-chat/react component library. Always loaded for every interaction. Covers project context, architecture, conventions, and decision-making principles."
applyTo: "**"
---

# @agent-chat/react — Workspace Instructions

## Project Overview

This is `@agent-chat/react` — a generic, themeable, data-driven React component library that renders an AI agent chat interface. Inspired by VS Code's chat architecture (Model → ViewModel → Widget), redesigned as idiomatic React.

- **Consumers provide:** data models (`ChatSession`) + callback functions (`ChatCallbacks`)
- **Library provides:** all rendering, streaming animation, layout, theming, and accessibility
- **Backend-agnostic:** works with OpenAI, Anthropic, LangChain, Vercel AI SDK, or any custom backend

## Architecture

```
src/
├── types/           # Data models, content part union, events, config
├── theme/           # CSS variables, dark/light presets, ThemeProvider
├── provider/        # React context, ChatProvider, hooks
├── hooks/           # useStreaming, useAutoScroll, useRelativeTime, etc.
├── utils/           # cn(), wordCount, iconMap
├── components/
│   ├── atoms/       # Avatar, Chip, Badge, IconButton, CollapsibleSection, etc.
│   ├── content-parts/  # MarkdownContent, CodeBlock, ThinkingBlock, TodoList, etc.
│   ├── tool-parts/     # ToolCallDisplay, ToolConfirmation, TerminalToolDisplay, etc.
│   ├── notifications/  # ErrorMessage, SystemNotification, QuotaExceeded, etc.
│   ├── interactive/    # ConfirmationDialog, QuestionCarousel, FollowupButton, etc.
│   ├── messages/       # RequestRow, ResponseRow, MessageList, ResponseFooter
│   ├── input/          # ChatTextarea, AttachmentBar, InputToolbar, ChatInputArea
│   ├── AgentChat.tsx   # Main composed widget
│   ├── ChatWelcome.tsx # Empty state
│   └── TodoListDock.tsx
└── test-utils/      # Builders, custom render, fixtures
```

## Key Design Decisions

1. **Discriminated union on `kind`** — `ChatContentPart` is the core type. Each `kind` maps to one React component via `ContentPartRenderer`.
2. **Context over prop drilling** — `<ChatProvider>` provides session, callbacks, config, and theme to all descendants.
3. **Callbacks, not internal state** — the library never makes API calls. Consumer owns all state; library renders it.
4. **CSS variables for theming** — all tokens use `var(--ac-*)` prefix. No CSS-in-JS.
5. **Named exports only** — no default exports. Public API defined in `src/index.ts`.

## Specifications

Full specifications are in `Docs/Specification/`:
- `00-overview.md` — Architecture overview
- `01-foundation-types.md` — All TypeScript interfaces
- `02-theme-styling.md` — Theme system
- `03-provider-context.md` — Provider pattern
- `04-atom-components.md` — Atomic components
- `05-content-parts.md` — Content part components
- `06-tool-invocations.md` — Tool invocation components
- `07-message-layout.md` — Message layout
- `08-input-area.md` — Input area
- `09-main-widget.md` — Main widget & public API
- `10-hooks-utilities.md` — Hooks & utilities
- `11-testing-strategy.md` — Testing & automation
- `12-ci-cd-maintenance.md` — CI/CD & maintenance

**Always consult the relevant spec before implementing a phase.**

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| React | 18/19 | UI framework (peer dep) |
| TypeScript | 5.8+ | Type safety |
| Vite | 6.x | Build (ESM + CJS library output) |
| Vitest | 3.x | Unit & integration tests |
| React Testing Library | 16.x | Component testing |
| Playwright | 1.52+ | E2E tests |
| ESLint | 9.x | Linting (flat config) |
| Prettier | 3.x | Formatting |
| shiki | 3.x | Syntax highlighting |
| react-markdown | 9.x | Markdown rendering |
| react-virtuoso | 4.x | List virtualization |

## Global Rules

- **TypeScript strict mode** — `strict: true` in tsconfig, no `any`, no `@ts-ignore`.
- **Type-only imports** — use `import type { X }` for types. ESLint enforces `consistent-type-imports`.
- **No side effects** — components are pure functions of props. No global state mutations.
- **Accessibility first** — WCAG 2.1 AA compliance. Every interactive element is keyboard-navigable with ARIA labels.
- **Performance conscious** — `React.memo` on content parts, virtualized lists, lazy rendering for nested content.
- **Test every change** — no component without tests, no commit without passing quality gates.
- **Spec-driven** — check `Docs/Specification/` before implementing. If the spec is unclear, ask before guessing.

## When Unsure

1. Check the relevant spec in `Docs/Specification/`
2. Look at VS Code's implementation for reference patterns (the project was extracted from VS Code's chat UI)
3. Prefer the simpler solution — this is a library, not an app
4. Ask the user rather than making assumptions about behavior
