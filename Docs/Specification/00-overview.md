# @agent-chat/react — Component Library Specification

## Overview

A generic, themeable, data-driven React component library that renders an AI agent chat interface. Inspired by VS Code's chat architecture (Model → ViewModel → Widget pattern), redesigned as idiomatic React.

**Consumers provide:** Data models + callback functions
**Library provides:** All rendering, streaming animation, layout, theming, and accessibility

---

## Architecture

```
┌─────────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│  Any Agent Backend   │────▶│  Adapter Layer   │────▶│  @agent-chat/react  │
│                      │     │  (consumer code)  │     │                     │
│  - OpenAI            │     │  transforms data   │     │  Renders beautiful  │
│  - Anthropic         │     │  into ChatSession  │     │  chat UI from data  │
│  - LangChain         │     │  + ChatContentPart │     │                     │
│  - Vercel AI SDK     │     │                    │     │  Zero backend       │
│  - Custom WebSocket  │     │                    │     │  knowledge needed   │
└─────────────────────┘     └──────────────────┘     └─────────────────────┘
```

### Design Principles

1. **Data-driven** — UI is a pure function of `ChatSession` state
2. **Backend-agnostic** — No knowledge of any AI provider
3. **Composable** — Every component usable independently
4. **Themeable** — CSS variables for full customization
5. **Accessible** — WCAG 2.1 AA compliant
6. **Performant** — Virtualized list, memoized parts, pooled editors
7. **TypeScript-first** — Full type safety on all props and models

---

## Phase Summary

| Phase | Title | Files | Description |
|-------|-------|-------|-------------|
| 1 | Foundation & Types | 4 | Core data models, content part union, events, config |
| 2 | Theme & Styling | 6 | CSS variable system, dark/light presets, base styles |
| 3 | Provider & Context | 4 | React context, state management, streaming hook |
| 4 | Atom Components | 12 | Avatar, Badge, Chip, ShimmerText, IconButton, etc. |
| 5 | Content Parts | 20 | Markdown, CodeBlock, ThinkingBlock, TodoList, etc. |
| 6 | Tool Invocations | 10 | ToolCall, Terminal, Confirmation, RiskBadge, etc. |
| 7 | Message Layout | 7 | RequestRow, ResponseRow, MessageList, Footer, etc. |
| 8 | Input Area | 5 | Textarea, AttachmentBar, Toolbar, Pickers |
| 9 | Main Widget | 3 | AgentChat, ChatWelcome, TodoListDock |
| 10 | Hooks & Utilities | 6 | useAutoScroll, useRelativeTime, useCopy, etc. |

**Total: ~77 files, ~72 components**

---

## Directory Structure

```
@agent-chat/react/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── index.ts                              # Public barrel export
│   │
│   ├── types/                                # Phase 1
│   │   ├── models.ts                         # ChatSession, ChatMessage, ChatAgent
│   │   ├── content-parts.ts                  # ChatContentPart discriminated union
│   │   ├── events.ts                         # Callback interfaces
│   │   └── config.ts                         # Configuration options
│   │
│   ├── theme/                                # Phase 2
│   │   ├── tokens.ts                         # Theme token interface
│   │   ├── dark.ts                           # VS Code dark preset
│   │   ├── light.ts                          # VS Code light preset
│   │   ├── ThemeProvider.tsx                  # Injects CSS variables
│   │   └── css/
│   │       ├── reset.css                     # Minimal reset
│   │       ├── tokens.css                    # CSS variable declarations
│   │       ├── base.css                      # Shared base styles
│   │       ├── atoms.css                     # Atom component styles
│   │       ├── content-parts.css             # Content part styles
│   │       ├── messages.css                  # Message row styles
│   │       └── input.css                     # Input area styles
│   │
│   ├── provider/                             # Phase 3
│   │   ├── ChatProvider.tsx                  # Top-level context provider
│   │   ├── ChatContext.ts                    # Context definition
│   │   ├── useChatContext.ts                 # Context consumer hook
│   │   └── useChatActions.ts                 # Action dispatch hook
│   │
│   ├── hooks/                                # Phase 10
│   │   ├── useStreaming.ts                   # Progressive word-reveal
│   │   ├── useAutoScroll.ts                  # Smart auto-scroll
│   │   ├── useRelativeTime.ts                # "2m ago" with live updates
│   │   ├── useCopyToClipboard.ts             # Copy with feedback
│   │   ├── useCollapsible.ts                 # Animated expand/collapse
│   │   └── useVirtualList.ts                 # List virtualization
│   │
│   ├── components/
│   │   ├── AgentChat.tsx                     # Phase 9: Main export
│   │   ├── ChatWelcome.tsx                   # Phase 9: Empty state
│   │   ├── TodoListDock.tsx                  # Phase 9: Dockable todo
│   │   │
│   │   ├── atoms/                            # Phase 4
│   │   │   ├── Avatar.tsx
│   │   │   ├── Username.tsx
│   │   │   ├── Timestamp.tsx
│   │   │   ├── ShimmerText.tsx
│   │   │   ├── AnimatedDots.tsx
│   │   │   ├── PixelSpinner.tsx
│   │   │   ├── IconButton.tsx
│   │   │   ├── Chip.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── CollapsibleSection.tsx
│   │   │   ├── RiskBadge.tsx
│   │   │   └── StatusIcon.tsx
│   │   │
│   │   ├── content-parts/                    # Phase 5
│   │   │   ├── ContentPartRenderer.tsx       # kind → component dispatcher
│   │   │   ├── MarkdownContent.tsx
│   │   │   ├── CollapsibleMarkdown.tsx
│   │   │   ├── CodeBlock.tsx
│   │   │   ├── CodeCitation.tsx
│   │   │   ├── ThinkingBlock.tsx
│   │   │   ├── SubAgentDisplay.tsx
│   │   │   ├── ProgressStep.tsx
│   │   │   ├── WorkingIndicator.tsx
│   │   │   ├── EditPill.tsx
│   │   │   ├── FileChangesSummary.tsx
│   │   │   ├── TurnPills.tsx
│   │   │   ├── InlineDiff.tsx
│   │   │   ├── WorkspaceEdit.tsx
│   │   │   ├── TodoList.tsx
│   │   │   ├── PlanReviewCard.tsx
│   │   │   ├── FileTree.tsx
│   │   │   ├── ReferencesList.tsx
│   │   │   ├── InlineReference.tsx
│   │   │   └── ImageContent.tsx
│   │   │
│   │   ├── tool-parts/                       # Phase 6
│   │   │   ├── ToolCallDisplay.tsx           # Orchestrator
│   │   │   ├── ToolProgress.tsx
│   │   │   ├── ToolConfirmation.tsx
│   │   │   ├── ToolConfirmationCarousel.tsx
│   │   │   ├── ToolOutput.tsx
│   │   │   ├── ToolStreaming.tsx
│   │   │   ├── TerminalToolDisplay.tsx
│   │   │   ├── TerminalToolConfirmation.tsx
│   │   │   ├── McpAppDisplay.tsx
│   │   │   └── RiskBadgeWidget.tsx
│   │   │
│   │   ├── notifications/                    # Phase 5 (contd)
│   │   │   ├── ErrorMessage.tsx
│   │   │   ├── WarningMessage.tsx
│   │   │   ├── SystemNotification.tsx
│   │   │   ├── WorkspaceTransition.tsx
│   │   │   ├── HookResult.tsx
│   │   │   ├── TipContent.tsx
│   │   │   ├── QuotaExceeded.tsx
│   │   │   └── RateLimited.tsx
│   │   │
│   │   ├── interactive/                      # Phase 5 (contd)
│   │   │   ├── ConfirmationDialog.tsx
│   │   │   ├── ElicitationDialog.tsx
│   │   │   ├── QuestionCarousel.tsx
│   │   │   ├── FollowupButton.tsx
│   │   │   ├── SuggestNext.tsx
│   │   │   ├── CommandButton.tsx
│   │   │   └── PullRequestCard.tsx
│   │   │
│   │   ├── messages/                         # Phase 7
│   │   │   ├── MessageHeader.tsx
│   │   │   ├── RequestRow.tsx
│   │   │   ├── ResponseRow.tsx
│   │   │   ├── ResponseFooter.tsx
│   │   │   ├── RequestOriginPill.tsx
│   │   │   ├── AttachmentsRow.tsx
│   │   │   └── MessageList.tsx
│   │   │
│   │   └── input/                            # Phase 8
│   │       ├── ChatTextarea.tsx
│   │       ├── AttachmentBar.tsx
│   │       ├── InputToolbar.tsx
│   │       ├── InputNotice.tsx
│   │       └── ChatInputArea.tsx
│   │
│   └── utils/
│       ├── cn.ts                             # classNames utility
│       ├── wordCount.ts                      # Word counting for streaming
│       └── iconMap.ts                        # Tool ID → icon mapping
│
└── Docs/
    └── Specification/
        ├── 00-overview.md                    # This file
        ├── 01-foundation-types.md            # Phase 1
        ├── 02-theme-styling.md               # Phase 2
        ├── 03-provider-context.md            # Phase 3
        ├── 04-atom-components.md             # Phase 4
        ├── 05-content-parts.md               # Phase 5
        ├── 06-tool-invocations.md            # Phase 6
        ├── 07-message-layout.md              # Phase 7
        ├── 08-input-area.md                  # Phase 8
        ├── 09-main-widget.md                 # Phase 9
        └── 10-hooks-utilities.md             # Phase 10
```

---

## Consumer API (Final Usage)

```tsx
import { AgentChat, ChatProvider, darkTheme } from '@agent-chat/react';
import '@agent-chat/react/styles.css';

function MyApp() {
  const [session, setSession] = useState<ChatSession>(initialSession);

  return (
    <ChatProvider
      session={session}
      agents={[{ id: 'copilot', name: 'Copilot', icon: '🤖' }]}
      onSendMessage={async (msg, attachments) => { /* your backend */ }}
      onCancelResponse={(responseId) => { /* abort */ }}
      onToolAction={(toolCallId, action) => { /* approve/deny */ }}
      onVote={(messageId, direction) => { /* telemetry */ }}
      onFollowupClick={(followup) => { /* send followup */ }}
      theme={darkTheme}
    >
      <AgentChat
        welcomeTitle="How can I help?"
        welcomeSuggestions={['Fix a bug', 'Write tests', 'Explain code']}
        placeholder="Ask anything..."
        maxWidth={950}
      />
    </ChatProvider>
  );
}
```

---

## Peer Dependencies

```json
{
  "react": "^18.0.0 || ^19.0.0",
  "react-dom": "^18.0.0 || ^19.0.0"
}
```

## Bundled Dependencies

```json
{
  "react-markdown": "^9.0.0",
  "remark-gfm": "^4.0.0",
  "rehype-katex": "^7.0.0",
  "remark-math": "^6.0.0",
  "shiki": "^1.0.0",
  "react-virtuoso": "^4.0.0"
}
```
