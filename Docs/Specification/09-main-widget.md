# Phase 9: Main Widget Components

## Files

- `src/components/AgentChat.tsx`
- `src/components/ChatWelcome.tsx`
- `src/components/TodoListDock.tsx`

---

## 9.1 `AgentChat.tsx` — The Main Export

This is the primary component consumers use. It composes all other components into the complete chat UI.

```typescript
/**
 * The main chat component. Must be wrapped in <ChatProvider>.
 *
 * Usage:
 *   <ChatProvider session={session} onSendMessage={handleSend}>
 *     <AgentChat />
 *   </ChatProvider>
 */
interface AgentChatProps {
  /** Welcome screen title override */
  welcomeTitle?: string;
  /** Welcome screen subtitle */
  welcomeSubtitle?: string;
  /** Welcome screen suggestion prompts */
  welcomeSuggestions?: Array<{ label: string; message: string; icon?: string }>;
  /** Input placeholder override */
  placeholder?: string;
  /** Max container width override */
  maxWidth?: number;
  /** Additional CSS class on root element */
  className?: string;
  /** Render prop for custom header */
  renderHeader?: () => React.ReactNode;
  /** Render prop for custom footer (above input) */
  renderFooter?: () => React.ReactNode;
}
```

**DOM Structure:**
```html
<div
  class={cn('ac-root', className)}
  style={{ maxWidth: maxWidth || config.maxWidth }}
  role="region"
  aria-label={config.ariaLabel}
>
  {/* Optional custom header */}
  {renderHeader?.()}
  
  {/* Chat body — either welcome or message list */}
  {isEmpty ? (
    <ChatWelcome
      title={welcomeTitle || config.welcomeTitle}
      subtitle={welcomeSubtitle}
      suggestions={welcomeSuggestions || config.welcomeSuggestions}
    />
  ) : (
    <MessageList />
  )}
  
  {/* Dockable todo list (floats above input) */}
  {config.showTodoList && activeTodoList && (
    <TodoListDock items={activeTodoList.items} />
  )}
  
  {/* Optional custom footer */}
  {renderFooter?.()}
  
  {/* Input area */}
  <ChatInputArea />
  
  {/* Screen reader announcements (live region) */}
  {config.announceMessages && (
    <div class="ac-sr-only" role="status" aria-live="polite" aria-atomic="true">
      {lastAnnouncement}
    </div>
  )}
</div>
```

**Active todo list detection:**
```typescript
// Finds the most recent todo-list content part across all responses
const activeTodoList = useMemo(() => {
  for (let i = session.messages.length - 1; i >= 0; i--) {
    const msg = session.messages[i];
    if (msg.role === 'assistant') {
      const todoPart = msg.content.findLast(p => p.kind === 'todo-list');
      if (todoPart) return todoPart as TodoListPart;
    }
  }
  return null;
}, [session.messages]);
```

**Screen reader announcements:**
- New user message: "You said: {message}"
- New assistant response started: "{agentName} is responding"
- Response complete: "{agentName} responded"
- Error: "Error: {message}"

**CSS:**
```css
.ac-root {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 950px;
  margin: 0 auto;
  position: relative;
  font-family: var(--ac-font-family);
  font-size: var(--ac-font-size-base);
  line-height: var(--ac-line-height);
  color: var(--ac-fg-primary);
  background: var(--ac-bg-primary);
}

.ac-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

---

## 9.2 `ChatWelcome.tsx`

Empty state shown when there are no messages.

```typescript
interface ChatWelcomeProps {
  /** Title text */
  title?: string;
  /** Subtitle/description */
  subtitle?: string;
  /** Suggestion prompts */
  suggestions?: Array<{ label: string; message: string; icon?: string }>;
  /** Additional CSS class */
  className?: string;
}
```

**DOM Structure:**
```html
<div class="ac-welcome">
  <div class="ac-welcome__content">
    {/* Agent icon/logo */}
    <div class="ac-welcome__icon">
      {activeAgent ? (
        <Avatar icon={activeAgent.icon} name={activeAgent.name} size={48} />
      ) : (
        <span class="ac-welcome__default-icon">💬</span>
      )}
    </div>
    
    {/* Title */}
    <h2 class="ac-welcome__title">{title || 'How can I help you?'}</h2>
    
    {/* Subtitle */}
    {subtitle && (
      <p class="ac-welcome__subtitle">{subtitle}</p>
    )}
    
    {/* Suggestion buttons */}
    {suggestions?.length > 0 && (
      <div class="ac-welcome__suggestions">
        {suggestions.map((s, i) => (
          <button
            key={i}
            class="ac-welcome__suggestion"
            onClick={() => actions.sendMessage(s.message)}
          >
            {s.icon && <span class="ac-welcome__suggestion-icon">{s.icon}</span>}
            <span class="ac-welcome__suggestion-label">{s.label}</span>
          </button>
        ))}
      </div>
    )}
  </div>
</div>
```

**CSS:**
```css
.ac-welcome {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--ac-space-xxl);
}
.ac-welcome__content {
  text-align: center;
  max-width: 480px;
}
.ac-welcome__title {
  font-size: var(--ac-font-size-xxl);
  font-weight: var(--ac-font-weight-bold);
  margin: var(--ac-space-xl) 0 var(--ac-space-md);
}
.ac-welcome__subtitle {
  color: var(--ac-fg-secondary);
  margin-bottom: var(--ac-space-xxl);
}
.ac-welcome__suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ac-space-md);
  justify-content: center;
}
.ac-welcome__suggestion {
  display: flex;
  align-items: center;
  gap: var(--ac-space-xs);
  padding: var(--ac-space-md) var(--ac-space-xl);
  background: var(--ac-bg-followup);
  color: var(--ac-fg-followup);
  border: var(--ac-stroke-width) solid var(--ac-border);
  border-radius: var(--ac-radius-md);
  cursor: pointer;
  transition: background var(--ac-transition-fast);
  font-size: var(--ac-font-size-sm);
}
.ac-welcome__suggestion:hover {
  background: var(--ac-bg-hover);
}
```

---

## 9.3 `TodoListDock.tsx`

Dockable todo list widget that floats above the input area.

```typescript
interface TodoListDockProps {
  /** Todo items to display */
  items: TodoItem[];
  /** Additional CSS class */
  className?: string;
}
```

**DOM Structure:**
```html
<div class={cn('ac-todo-dock', !isExpanded && 'ac-todo-dock--collapsed')}>
  <div class="ac-todo-dock__header">
    <button class="ac-todo-dock__toggle" onClick={toggleExpand}>
      <span class="ac-todo-dock__chevron">{isExpanded ? '▼' : '▶'}</span>
      <span class="ac-todo-dock__title">Todos</span>
      <Badge count={items.filter(i => i.status !== 'completed').length} variant="info" />
    </button>
    <IconButton icon="×" label="Close" onClick={handleClose} size="small" />
  </div>
  
  {isExpanded && (
    <div class="ac-todo-dock__list">
      {items.map(item => (
        <div class="ac-todo-dock__item" key={item.id}>
          <StatusIcon
            status={
              item.status === 'completed' ? 'complete' :
              item.status === 'in-progress' ? 'running' :
              'pending'
            }
          />
          <span class={cn(
            'ac-todo-dock__item-title',
            item.status === 'completed' && 'ac-todo-dock__item-title--done',
          )}>
            {item.title}
          </span>
        </div>
      ))}
    </div>
  )}
</div>
```

**CSS:**
```css
.ac-todo-dock {
  position: sticky;
  bottom: 0;
  border: var(--ac-stroke-width) solid var(--ac-border);
  border-radius: var(--ac-radius-md) var(--ac-radius-md) 0 0;
  background: var(--ac-bg-card);
  margin: 0 var(--ac-space-xl);
  overflow: hidden;
  z-index: 10;
}
.ac-todo-dock__header {
  display: flex;
  align-items: center;
  padding: var(--ac-space-xs) var(--ac-space-md);
  gap: var(--ac-space-md);
}
.ac-todo-dock__list {
  max-height: 200px;
  overflow-y: auto;
  padding: 0 var(--ac-space-md) var(--ac-space-md);
}
.ac-todo-dock__item {
  display: flex;
  align-items: center;
  gap: var(--ac-space-md);
  height: var(--ac-todo-row-height);
  font-size: var(--ac-font-size-sm);
}
.ac-todo-dock__item-title--done {
  text-decoration: line-through;
  color: var(--ac-fg-tertiary);
}
```

---

## Public API (`src/index.ts`)

The barrel export file that defines the library's public surface:

```typescript
// ═══════════════════════════════════════════
// MAIN COMPONENTS
// ═══════════════════════════════════════════
export { default as AgentChat } from './components/AgentChat';
export { default as ChatWelcome } from './components/ChatWelcome';
export { default as TodoListDock } from './components/TodoListDock';

// ═══════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════
export { ChatProvider } from './provider/ChatProvider';
export { useChatContext, useChatSelector } from './provider/useChatContext';
export { useChatActions } from './provider/useChatActions';

// ═══════════════════════════════════════════
// THEME
// ═══════════════════════════════════════════
export { darkTheme } from './theme/dark';
export { lightTheme } from './theme/light';
export type { AgentChatTheme } from './theme/tokens';

// ═══════════════════════════════════════════
// TYPES (for consumers building adapters)
// ═══════════════════════════════════════════
export type {
  // Models
  ChatSession,
  ChatMessage,
  ChatRequest,
  ChatResponse,
  ChatAgent,
  ChatFollowup,
  ChatError,
  ChatUsage,
  ChatAttachment,
  FileAttachment,
  ImageAttachment,
  TerminalAttachment,
  ToolSetAttachment,
  SelectionAttachment,
  CustomAttachment,
  ChatMode,
  ResponseState,
  VoteDirection,
  ChatRequestOrigin,

  // Content Parts
  ChatContentPart,
  MarkdownPart,
  CodeBlockPart,
  ThinkingPart,
  SubAgentPart,
  ToolCallPart,
  ToolConfirmationPart,
  TerminalCommandPart,
  EditPillPart,
  FileChangesSummaryPart,
  TurnPillsPart,
  TodoListPart,
  TodoItem,
  PlanReviewPart,
  ProgressPart,
  ConfirmationPart,
  ElicitationPart,
  QuestionCarouselPart,
  ReferencesPart,
  ErrorPart,
  // ... all content part types

  // Events
  ChatCallbacks,
  SendMessageOptions,

  // Config
  AgentChatConfig,
  ModelOption,
  ContentPartRendererMap,
  AttachmentRendererMap,
} from './types';

// ═══════════════════════════════════════════
// INDIVIDUAL COMPONENTS (for advanced use)
// ═══════════════════════════════════════════
// Atoms
export { default as Avatar } from './components/atoms/Avatar';
export { default as Username } from './components/atoms/Username';
export { default as Timestamp } from './components/atoms/Timestamp';
export { default as ShimmerText } from './components/atoms/ShimmerText';
export { default as AnimatedDots } from './components/atoms/AnimatedDots';
export { default as IconButton } from './components/atoms/IconButton';
export { default as Chip } from './components/atoms/Chip';
export { default as Badge } from './components/atoms/Badge';
export { default as CollapsibleSection } from './components/atoms/CollapsibleSection';
export { default as RiskBadge } from './components/atoms/RiskBadge';
export { default as StatusIcon } from './components/atoms/StatusIcon';

// Content Parts
export { default as ContentPartRenderer } from './components/content-parts/ContentPartRenderer';
export { default as MarkdownContent } from './components/content-parts/MarkdownContent';
export { default as CodeBlock } from './components/content-parts/CodeBlock';
export { default as ThinkingBlock } from './components/content-parts/ThinkingBlock';
export { default as SubAgentDisplay } from './components/content-parts/SubAgentDisplay';
export { default as ProgressStep } from './components/content-parts/ProgressStep';
export { default as EditPill } from './components/content-parts/EditPill';
export { default as FileChangesSummary } from './components/content-parts/FileChangesSummary';
export { default as TodoList } from './components/content-parts/TodoList';
// ... all content parts

// Tool Parts
export { default as ToolCallDisplay } from './components/tool-parts/ToolCallDisplay';
export { default as ToolConfirmation } from './components/tool-parts/ToolConfirmation';
export { default as TerminalToolDisplay } from './components/tool-parts/TerminalToolDisplay';
// ... all tool parts

// Messages
export { default as MessageList } from './components/messages/MessageList';
export { default as RequestRow } from './components/messages/RequestRow';
export { default as ResponseRow } from './components/messages/ResponseRow';
export { default as ResponseFooter } from './components/messages/ResponseFooter';

// Input
export { default as ChatInputArea } from './components/input/ChatInputArea';
export { default as ChatTextarea } from './components/input/ChatTextarea';
export { default as InputToolbar } from './components/input/InputToolbar';

// ═══════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════
export { useStreaming } from './hooks/useStreaming';
export { useAutoScroll } from './hooks/useAutoScroll';
export { useRelativeTime } from './hooks/useRelativeTime';
export { useCopyToClipboard } from './hooks/useCopyToClipboard';
export { useCollapsible } from './hooks/useCollapsible';
```
