# Phase 6: Tool Invocation Components

## Files

All in `src/components/tool-parts/`

---

## Overview

Tool invocations are the most complex content parts. In VS Code, the `ChatToolInvocationPart` dynamically switches between **15+ sub-parts** based on tool state and type. We simplify this into a manageable set of components.

**Architecture:**
```
<ToolCallDisplay>          ← Orchestrator (picks sub-part)
  ├── <ToolStreaming />    ← Status: 'streaming' (arguments being generated)
  ├── <ToolConfirmation /> ← Status: 'confirming' (needs user approval)
  ├── <ToolProgress />     ← Status: 'running' (executing)
  ├── <ToolOutput />       ← Status: 'complete' with custom output
  ├── <McpAppDisplay />    ← Tool has MCP app webview
  └── (default)            ← Simple progress step
```

---

## 6.1 `ToolCallDisplay.tsx` — Orchestrator

The main tool call component that picks the right sub-part.

```typescript
interface ToolCallDisplayProps extends ToolCallPart {
  isStreaming: boolean;
}
```

**Dispatch logic:**
```typescript
function ToolCallDisplay(props: ToolCallDisplayProps) {
  const { status, toolId, toolCallId } = props;

  // MCP App takes precedence
  if (props.mcpApp) {
    return <McpAppDisplay {...props} />;
  }

  switch (status) {
    case 'streaming':
      return <ToolStreaming {...props} />;
    
    case 'confirming':
      return <ToolConfirmation {...props} />;
    
    case 'running':
      // Check if this is a terminal command
      if (isTerminalTool(toolId)) {
        return <TerminalToolDisplay {...props} />;
      }
      return <ToolProgress {...props} />;
    
    case 'complete':
    case 'failed':
      if (props.hasCustomOutput) {
        return <ToolOutput {...props} />;
      }
      return <ToolProgress {...props} />;
    
    case 'cancelled':
      return <ToolProgress {...props} />;
    
    default:
      return <ToolProgress {...props} />;
  }
}
```

**Icon resolution** (from VS Code's `getToolInvocationIcon()`):

```typescript
function resolveToolIcon(toolId: string): string {
  const id = toolId.toLowerCase();
  if (id.includes('comment'))                               return '💬';
  if (/search|grep|find|list|semantic|changes|codebase/.test(id)) return '🔍';
  if (/read|get_file|problems/.test(id))                    return '📖';
  if (/edit|create|replace|patch|write/.test(id))           return '✏️';
  if (id.includes('terminal'))                               return '💻';
  if (id.includes('browser'))                                return '🌐';
  if (id.includes('test'))                                   return '🧪';
  if (id.includes('git'))                                    return '📦';
  return '🔧'; // default
}
```

**CSS:** `.ac-tool-call` — base container with `display: flex`, `gap: var(--ac-space-md)`

---

## 6.2 `ToolStreaming.tsx`

Shown while tool arguments are being generated (before execution starts).

```typescript
interface ToolStreamingProps {
  toolId: string;
  toolCallId: string;
  progressMessage?: string;
  icon?: string;
}
```

**Renders:** A `<ProgressStep>` with shimmer effect:
```html
<div class="ac-tool-streaming">
  <ProgressStep
    message={progressMessage || `Preparing ${toolId}...`}
    isActive={true}
    shimmer={true}
  />
</div>
```

---

## 6.3 `ToolConfirmation.tsx`

Approval/denial dialog for tool execution.

```typescript
interface ToolConfirmationProps extends ToolConfirmationPart {
  /** Callback for action selection */
  onAction: (actionId: string) => void;
}
```

**DOM Structure:**
```html
<div class="ac-tool-confirmation ac-card">
  <div class="ac-tool-confirmation__header">
    <span class="ac-tool-confirmation__icon">{resolveToolIcon(toolId)}</span>
    <div class="ac-tool-confirmation__title-group">
      <span class="ac-tool-confirmation__title">{title}</span>
      {subtitle && <span class="ac-tool-confirmation__subtitle">{subtitle}</span>}
    </div>
    {riskLevel && <RiskBadge level={riskLevel} showText />}
  </div>
  
  {message && (
    <div class="ac-tool-confirmation__message">
      <MarkdownContent content={message} />
    </div>
  )}
  
  {input && (
    <div class="ac-tool-confirmation__input">
      <CollapsibleSection title="Tool Input" defaultExpanded={false}>
        <CodeBlock code={input} language="json" showToolbar={false} />
      </CollapsibleSection>
    </div>
  )}
  
  <div class="ac-tool-confirmation__actions">
    {actions.map(action => (
      <button
        key={action.id}
        class={cn('ac-btn', action.primary && 'ac-btn--primary')}
        onClick={() => onAction(action.id)}
      >
        {action.label}
        {action.keybinding && <kbd class="ac-keybinding">{action.keybinding}</kbd>}
        {action.children && <span class="ac-btn__dropdown-arrow">▾</span>}
      </button>
    ))}
  </div>
</div>
```

**Standard actions (VS Code default):**
```typescript
const DEFAULT_TOOL_ACTIONS: ToolConfirmationAction[] = [
  {
    id: 'allow-once',
    label: 'Allow Once',
    primary: true,
    keybinding: '⌘Enter',
    children: [
      { id: 'always-allow', label: 'Always Allow' },
      { id: 'allow-skip-review', label: 'Allow and Skip Review' },
    ],
  },
  { id: 'skip', label: 'Skip' },
];
```

**CSS:** `.ac-tool-confirmation`, `.ac-tool-confirmation__header`, `.ac-tool-confirmation__actions`, uses card styles (`var(--ac-bg-card)`, `var(--ac-border-card)`)

---

## 6.4 `ToolConfirmationCarousel.tsx`

When multiple tools need confirmation simultaneously, shows them as a navigable carousel.

```typescript
interface ToolConfirmationCarouselProps extends ToolConfirmationCarouselPart {
  onAction: (toolCallId: string, actionId: string) => void;
  onNavigate: (index: number) => void;
}
```

**DOM Structure:**
```html
<div class="ac-tool-confirmation-carousel">
  <div class="ac-tool-confirmation-carousel__nav">
    <IconButton icon="prev" onClick={() => onNavigate(currentIndex - 1)} />
    <span>{currentIndex + 1} of {tools.length}</span>
    <IconButton icon="next" onClick={() => onNavigate(currentIndex + 1)} />
  </div>
  <ToolConfirmation
    {...tools[currentIndex]}
    onAction={(actionId) => onAction(tools[currentIndex].toolCallId, actionId)}
  />
</div>
```

---

## 6.5 `ToolProgress.tsx`

Simple tool execution progress display with optional input/output.

```typescript
interface ToolProgressProps {
  toolId: string;
  toolCallId: string;
  status: ToolCallStatus;
  label?: string;
  icon?: string;
  input?: unknown;
  output?: string;
  progressMessage?: string;
}
```

**DOM Structure:**
```html
<div class="ac-tool-progress">
  <CollapsibleSection
    title={label || progressMessage || toolId}
    icon={resolvedIcon}
    isLoading={status === 'running'}
    isComplete={status === 'complete'}
    subtitle={statusLabel}
  >
    {input && (
      <div class="ac-tool-progress__input">
        <div class="ac-tool-progress__section-label">Input</div>
        <CodeBlock code={JSON.stringify(input, null, 2)} language="json" showToolbar={false} />
      </div>
    )}
    {output && (
      <div class="ac-tool-progress__output">
        <div class="ac-tool-progress__section-label">Output</div>
        <CodeBlock code={output} language="text" showToolbar={false} />
      </div>
    )}
  </CollapsibleSection>
</div>
```

---

## 6.6 `ToolOutput.tsx`

Custom output display for tools that provide rich output.

```typescript
interface ToolOutputProps {
  toolId: string;
  output?: string;
  label?: string;
}
```

**Renders:** The output as markdown or custom HTML within a scrollable container (max-height: 80vh).

---

## 6.7 `TerminalToolDisplay.tsx`

Embedded terminal output mirror for shell command tools.

```typescript
interface TerminalToolDisplayProps extends TerminalCommandPart {}
```

**DOM Structure:**
```html
<div class="ac-terminal-tool">
  <div class="ac-terminal-tool__header">
    <span class="ac-terminal-tool__icon">💻</span>
    <span class="ac-terminal-tool__command" title={command}>
      {truncate(command, 50)}
    </span>
    <div class="ac-terminal-tool__actions">
      {isRunning && <PixelSpinner />}
      {!isRunning && <ExitCodeBadge code={exitCode} />}
      <IconButton icon="terminal" label="Focus Terminal" onClick={handleFocusTerminal} />
      {isRunning && <IconButton icon="background" label="Continue in Background" onClick={handleBackground} />}
      <IconButton icon="expand" label="Toggle Output" onClick={toggleExpand} />
    </div>
  </div>
  
  <div class="ac-terminal-tool__output" style={{ maxHeight: `${visibleRows * 20}px` }}>
    <pre class="ac-terminal-tool__pre">
      <code>{output}</code>
    </pre>
  </div>
</div>
```

**Exit code badge:**
| Exit Code | Icon | Color |
|-----------|------|-------|
| 0 | ✓ | green |
| non-zero | ✕ | red |
| null (running) | spinner | default |

**Output styling:**
- Monospace font: `var(--ac-font-family-mono)`
- Background: `var(--ac-bg-terminal)`
- Min rows: 1, max rows: 10, scrollable
- Line height: `var(--ac-line-height-code)`

**CSS:** `.ac-terminal-tool`, `.ac-terminal-tool__header`, `.ac-terminal-tool__output`, `.ac-terminal-tool__pre`, `.ac-terminal-tool__command`

---

## 6.8 `TerminalToolConfirmation.tsx`

Specialized confirmation for terminal commands (shows command preview).

```typescript
interface TerminalToolConfirmationProps extends ToolConfirmationPart {
  command: string;
  cwd?: string;
}
```

**Extends** `ToolConfirmation` with additional command display:
```html
<div class="ac-terminal-tool-confirmation">
  <div class="ac-terminal-tool-confirmation__command-preview">
    <span class="ac-terminal-tool-confirmation__prompt">$</span>
    <code>{command}</code>
  </div>
  {cwd && <span class="ac-terminal-tool-confirmation__cwd">in {cwd}</span>}
  <ToolConfirmation {...rest} />
</div>
```

---

## 6.9 `McpAppDisplay.tsx`

Embedded display for MCP app tool results (renders custom HTML).

```typescript
interface McpAppDisplayProps {
  toolId: string;
  toolCallId: string;
  mcpApp: { html: string; resources?: McpResource[] };
  status: ToolCallStatus;
}
```

**DOM Structure:**
```html
<div class="ac-mcp-app">
  <div class="ac-mcp-app__header">
    <span class="ac-mcp-app__title">{toolId}</span>
    <StatusIcon status={status === 'running' ? 'running' : 'complete'} />
  </div>
  
  {status === 'running' && !mcpApp.html && (
    <div class="ac-mcp-app__loading">
      <PixelSpinner /> Loading...
    </div>
  )}
  
  {mcpApp.html && (
    <iframe
      class="ac-mcp-app__frame"
      srcDoc={sanitizedHtml}
      sandbox="allow-scripts"
      style={{ minHeight: '100px', maxHeight: '75vh' }}
    />
  )}
  
  {mcpApp.resources?.length > 0 && (
    <div class="ac-mcp-app__resources">
      {mcpApp.resources.map(r => (
        <Chip key={r.uri} label={r.name} icon="📎" onClick={() => handleDownload(r)} />
      ))}
    </div>
  )}
</div>
```

**Security:** HTML is sanitized before rendering in iframe. Sandbox attribute restricts capabilities.

---

## 6.10 `RiskBadgeWidget.tsx`

Extended risk badge with loading state and detail tooltip. This is the widget version used in tool confirmations (vs the simpler atom `RiskBadge`).

```typescript
interface RiskBadgeWidgetProps {
  level: RiskLevel;
  detail?: string;
  onDetailClick?: () => void;
}
```

**States:**
1. **Assessing** → Spinner icon + "Assessing risk..." text
2. **Resolved** → Risk icon + level text + info icon (clickable for detail)

**Renders:**
```html
<div class="ac-risk-badge-widget ac-risk-badge-widget--{level}">
  {level === 'assessing' ? (
    <>
      <PixelSpinner size={12} />
      <span>Assessing risk…</span>
    </>
  ) : (
    <>
      <span class="ac-risk-badge-widget__icon">{riskIcon}</span>
      <span class="ac-risk-badge-widget__text">{riskLabel}</span>
      {detail && (
        <IconButton icon="info" label="Risk details" onClick={onDetailClick} size="small" />
      )}
    </>
  )}
</div>
```
