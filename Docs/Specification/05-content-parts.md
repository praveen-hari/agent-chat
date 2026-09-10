# Phase 5: Content Part Components

## Files

- `src/components/content-parts/ContentPartRenderer.tsx` — dispatcher
- `src/components/content-parts/*.tsx` — one per content part kind
- `src/components/notifications/*.tsx` — notification/alert parts
- `src/components/interactive/*.tsx` — user input/action parts

---

## 5.1 `ContentPartRenderer.tsx` — The Dispatcher

The central switch that maps `ChatContentPart.kind` to the correct React component.

```typescript
interface ContentPartRendererProps {
  /** The content part to render */
  part: ChatContentPart;
  /** Index of this part in the content array */
  index: number;
  /** Whether the parent response is still streaming */
  isStreaming: boolean;
  /** The parent response (for context) */
  response: ChatResponse;
  /** Whether this is the last part */
  isLast: boolean;
}
```

**Implementation pattern:**
```tsx
function ContentPartRenderer({ part, ...props }: ContentPartRendererProps) {
  // Check for consumer overrides first
  const { config } = useChatContext();
  const Override = config.contentPartOverrides?.[part.kind];
  if (Override) return <Override {...part} />;

  // Default dispatcher
  switch (part.kind) {
    case 'markdown':        return <MarkdownContent {...part} {...props} />;
    case 'code':            return <CodeBlock {...part} {...props} />;
    case 'thinking':        return <ThinkingBlock {...part} {...props} />;
    case 'sub-agent':       return <SubAgentDisplay {...part} {...props} />;
    case 'tool-call':       return <ToolCallDisplay {...part} {...props} />;
    case 'terminal-command': return <TerminalToolDisplay {...part} {...props} />;
    case 'progress':        return <ProgressStep {...part} {...props} />;
    case 'working':         return <WorkingIndicator {...part} {...props} />;
    case 'edit-pill':       return <EditPill {...part} {...props} />;
    case 'todo-list':       return <TodoList {...part} {...props} />;
    case 'error':           return <ErrorMessage {...part} {...props} />;
    // ... all 38+ kinds
    default:
      // Unknown kind — render nothing or a debug placeholder
      return __DEV__ ? <UnknownPart kind={(part as any).kind} /> : null;
  }
}

// Wrap with React.memo — re-render only when part changes
export default React.memo(ContentPartRenderer);
```

**Memoization strategy:**
- Each content part component is `React.memo`'d
- Parts compare by reference (consumer should use immutable updates)
- Streaming markdown parts use `content` string comparison

---

## 5.2 `MarkdownContent.tsx`

Renders markdown text with full GFM support, KaTeX math, and interactive code blocks.

```typescript
interface MarkdownContentProps extends MarkdownPart {
  /** Whether the parent response is streaming (enables progressive reveal) */
  isStreaming?: boolean;
}
```

**Features:**
- Uses `react-markdown` with plugins: `remark-gfm`, `remark-math`, `rehype-katex`
- **Code blocks** → delegates to `<CodeBlock>` component (not inline `<pre>`)
- **Inline code** → styled `<code>` with `var(--ac-bg-code)` background
- **Links** → `target="_blank"` with `rel="noopener"`, fires `onReferenceClick` for internal URIs
- **Tables** → wrapped in horizontal scroll container
- **Images** → rendered with `max-width: 100%`
- **Streaming** → uses `useStreaming()` hook for progressive word reveal

**CSS:** `.ac-markdown`, `.ac-markdown p`, `.ac-markdown ul/ol`, `.ac-markdown table`, `.ac-markdown blockquote`, `.ac-markdown h1-h6`, `.ac-markdown hr`

**Allowed HTML tags** (matching VS Code): `b, blockquote, br, code, del, em, h1-h6, hr, i, ins, li, ol, p, pre, s, strong, sub, sup, table, tbody, td, th, thead, tr, ul, a, img, span, div, input`

---

## 5.3 `CollapsibleMarkdown.tsx`

Markdown wrapped in a collapsible section.

```typescript
interface CollapsibleMarkdownProps extends CollapsibleMarkdownPart {}
```

**Renders:** `<CollapsibleSection title={title}>` → `<MarkdownContent content={content} />`

---

## 5.4 `CodeBlock.tsx`

Syntax-highlighted code block with toolbar actions.

```typescript
interface CodeBlockProps extends CodeBlockPart {
  /** Whether to show the action toolbar (default: true) */
  showToolbar?: boolean;
}
```

**DOM Structure:**
```html
<div class="ac-code-block">
  <div class="ac-code-block__header">
    <span class="ac-code-block__language">typescript</span>
    <span class="ac-code-block__filename">utils.ts</span>
    <div class="ac-code-block__toolbar">
      <IconButton icon="copy" label="Copy" onClick={handleCopy} />
      <IconButton icon="apply" label="Apply" onClick={handleApply} />
      <IconButton icon="open" label="Open File" onClick={handleOpen} />
    </div>
  </div>
  <pre class="ac-code-block__content">
    <code>{highlighted code}</code>
  </pre>
</div>
```

**Syntax highlighting:** Uses `shiki` (same engine as VS Code) for tokenization. Falls back to plain text if language not supported.

**Toolbar actions:**
- **Copy** → uses `useCopyToClipboard()`, fires `callbacks.onCodeCopy`
- **Apply** → fires `callbacks.onCodeApply` (hidden if no handler)
- **Open File** → fires `callbacks.onFileOpen` (shown only if `uri` provided)

**CSS:** `.ac-code-block`, `.ac-code-block__header`, `.ac-code-block__toolbar`, `.ac-code-block__content`
- Background: `var(--ac-bg-code)`
- Border: `var(--ac-border-code)`
- Border-radius: `var(--ac-radius-md)`
- Max-height: 500px with scroll

---

## 5.5 `CodeCitation.tsx`

Shows license/citation information for generated code.

```typescript
interface CodeCitationProps extends CodeCitationPart {}
```

**Renders:** A collapsible notice with license icon, license name, and optional source link.

---

## 5.6 `ThinkingBlock.tsx`

Collapsible reasoning/thinking block with nested tool calls, edit pills, and shimmer animation.

```typescript
interface ThinkingBlockProps extends ThinkingPart {
  isStreaming: boolean;
}
```

**DOM Structure:**
```html
<div class="ac-thinking ac-thinking--active">
  <CollapsibleSection
    title={shimmerTitle}
    icon={statusDotIcon}
    isLoading={isStreaming}
    isComplete={!isStreaming}
    subtitle={aggregateDiffLabel}
    actions={<AggregateDiffButton />}
  >
    <div class="ac-thinking__body">
      <!-- Reasoning text as scrollable markdown (max 200px) -->
      <div class="ac-thinking__reasoning">
        <MarkdownContent content={content} />
      </div>
      
      <!-- Nested tool calls -->
      {nestedToolCalls?.map(tool => (
        <div class="ac-thinking__tool-item">
          <StatusIcon status={tool.status} />
          <span class="ac-thinking__tool-icon">{toolIcon}</span>
          <span class="ac-thinking__tool-label">{tool.label}</span>
        </div>
      ))}
      
      <!-- Nested edit pills -->
      {nestedEditPills?.map(pill => (
        <EditPill {...pill} compact />
      ))}
      
      <!-- Working spinner (when streaming) -->
      {isStreaming && <div class="ac-thinking__spinner"><PixelSpinner /> Thinking...</div>}
    </div>
  </CollapsibleSection>
</div>
```

**Title extraction:** If no explicit `title`, extracts from first `**bold**` line in content. Falls back to "Thinking".

**Easter egg messages** (VS Code parity, ~2% chance): "Bribing the hamster", "Reticulating splines", "Summoning Clippy", "Mining diamonds", "Consulting the oracle"

**CSS:** `.ac-thinking`, `.ac-thinking--active`, `.ac-thinking__body`, `.ac-thinking__reasoning` (max-height: 200px, overflow-y: auto), `.ac-thinking__tool-item`, `.ac-thinking__spinner`

---

## 5.7 `SubAgentDisplay.tsx`

Displays a sub-agent invocation as a collapsible thinking-style block.

```typescript
interface SubAgentDisplayProps extends SubAgentPart {
  isStreaming: boolean;
}
```

**DOM Structure:**
```html
<div class="ac-sub-agent">
  <CollapsibleSection
    title={description (truncated 100 chars)}
    icon={agentIcon}
    isLoading={status === 'running'}
    isComplete={status === 'complete'}
    actions={<IconButton label="Open Sub-Agent" onClick={handleOpenSubAgent} />}
  >
    <div class="ac-sub-agent__body">
      <!-- Lazy-rendered children (only on expand) -->
      {children?.map(child => <ContentPartRenderer part={child} />)}
    </div>
    <div class="ac-sub-agent__footer">
      <span class="ac-sub-agent__model">{modelName}</span>
      {credits && <span class="ac-sub-agent__credits">{credits} credits</span>}
    </div>
  </CollapsibleSection>
</div>
```

**Lazy rendering:** Children are only rendered when the section is expanded (performance optimization for deeply nested sub-agents).

**Auto-expand:** When `autoExpand` is true (e.g., a nested tool needs confirmation), the section auto-expands.

---

## 5.8 `ProgressStep.tsx`

A progress message row with status icon and optional shimmer.

```typescript
interface ProgressStepProps extends ProgressPart {}
```

**DOM Structure:**
```html
<div class="ac-progress-step ac-progress-step--active">
  <StatusIcon status={isActive ? 'running' : 'complete'} />
  <span class="ac-progress-step__message">
    {shimmer ? <ShimmerText text={message} mode={shimmerMode} /> : message}
  </span>
</div>
```

**CSS:** `.ac-progress-step` — `display: flex`, `gap: var(--ac-space-md)`, `align-items: center`, `padding: var(--ac-space-xs) 0`

---

## 5.9 `WorkingIndicator.tsx`

Simple animated dots or message shown while waiting for response start.

```typescript
interface WorkingIndicatorProps extends WorkingPart {}
```

**Renders:** `<AnimatedDots />` with optional message text.

---

## 5.10 `EditPill.tsx`

Inline file change chip showing filename, status, and diff stats.

```typescript
interface EditPillProps extends EditPillPart {
  /** Compact mode (used inside thinking blocks) */
  compact?: boolean;
}
```

**DOM Structure:**
```html
<div class="ac-edit-pill ac-edit-pill--modified" onClick={handleFileOpen}>
  <div class="ac-edit-pill__status-indicator">
    <StatusIcon status="complete" />
  </div>
  <div class="ac-edit-pill__content">
    {progress != null && <div class="ac-edit-pill__progress" style={{ width: `${progress}%` }} />}
    <span class="ac-edit-pill__icon">{fileIcon}</span>
    <span class="ac-edit-pill__filename">{basename(filename)}</span>
    <span class="ac-edit-pill__added">+{linesAdded}</span>
    <span class="ac-edit-pill__removed">-{linesRemoved}</span>
  </div>
</div>
```

**Status rendering:**
| Status | Icon | Badge text |
|--------|------|-----------|
| `created` | + | "Created" |
| `modified` | ✓ | (none) |
| `deleted` | × | "Deleted" |
| `renamed` | → | "Renamed" |

**CSS:** `.ac-edit-pill__added` → `color: var(--ac-diff-added)`, `.ac-edit-pill__removed` → `color: var(--ac-diff-removed)`

---

## 5.11 `FileChangesSummary.tsx`

Collapsible summary showing "Changed N files" with per-file details.

```typescript
interface FileChangesSummaryProps extends FileChangesSummaryPart {}
```

**DOM Structure:**
```html
<div class="ac-file-changes-summary">
  <CollapsibleSection
    title={`Changed ${files.length} files`}
    count={files.length}
    actions={<IconButton icon="diff" label="Open All Changes" />}
  >
    <div class="ac-file-changes-summary__list">
      {files.map(file => (
        <div class="ac-file-changes-summary__row" onClick={() => handleFileOpen(file.uri)}>
          <span class="ac-file-changes-summary__icon">{fileIcon}</span>
          <span class="ac-file-changes-summary__name">{file.filename}</span>
          <span class="ac-file-changes-summary__added">+{file.linesAdded}</span>
          <span class="ac-file-changes-summary__removed">-{file.linesRemoved}</span>
        </div>
      ))}
    </div>
  </CollapsibleSection>
</div>
```

**Row height:** `var(--ac-file-row-height)` (22px), max 6 visible rows then scroll.

---

## 5.12 `TurnPills.tsx`

Compact per-turn changes summary: "5 files +42 -18".

```typescript
interface TurnPillsProps extends TurnPillsPart {}
```

**Renders:** `<details>/<summary>` with compact stats in summary, file list in body. Same file list rendering as FileChangesSummary.

**CSS:** `.ac-turn-pills`, `.ac-turn-pills__counts`, `.ac-turn-pills__insertions`, `.ac-turn-pills__deletions`

---

## 5.13 `InlineDiff.tsx`

Side-by-side or unified diff view for a single file.

```typescript
interface InlineDiffProps extends InlineDiffPart {}
```

**Rendering options:**
1. **Simple:** Render using a unified diff algorithm (e.g., `diff` library) with line-by-line coloring
2. **Advanced:** Embed a lightweight diff editor (optional dependency)

**CSS:** `.ac-inline-diff`, `.ac-inline-diff__line--added`, `.ac-inline-diff__line--removed`, `.ac-inline-diff__line--unchanged`

Colors: added lines use `var(--ac-diff-added-bg)`, removed use `var(--ac-diff-removed-bg)`

---

## 5.14 `WorkspaceEdit.tsx`

Displays file operations (create, delete, rename) as progress steps.

```typescript
interface WorkspaceEditProps extends WorkspaceEditPart {}
```

**Renders:** A list of `<ProgressStep>` items:
- Created → `+ Created {filename}` with file link
- Deleted → `× Deleted {filename}` with trash icon
- Renamed → `→ Renamed {old} to {new}` with arrow icon

---

## 5.15 `TodoList.tsx`

Displays the agent's task list with status indicators.

```typescript
interface TodoListProps extends TodoListPart {}
```

**DOM Structure:**
```html
<div class="ac-todo-list">
  {items.map(item => (
    <div class="ac-todo-list__item ac-todo-list__item--{status}" key={item.id}>
      <span class="ac-todo-list__status">
        {status === 'completed'   && <CheckIcon color="var(--ac-todo-completed)" />}
        {status === 'in-progress' && <DotIcon color="var(--ac-todo-in-progress)" />}
        {status === 'not-started' && <CircleIcon color="var(--ac-todo-not-started)" />}
      </span>
      <span class="ac-todo-list__title">{item.title}</span>
    </div>
  ))}
</div>
```

**Row height:** `var(--ac-todo-row-height)` (22px)
**CSS:** Status icons colored by todo status tokens

---

## 5.16 `PlanReviewCard.tsx`

Large card for plan review with approve/reject workflow.

```typescript
interface PlanReviewCardProps extends PlanReviewPart {}
```

**DOM Structure:**
```html
<div class="ac-plan-review ac-card-large">
  <div class="ac-plan-review__header">
    <span class="ac-plan-review__title">{title}</span>
    {isOutdated && <Badge text="Outdated" variant="warning" />}
    <div class="ac-plan-review__actions">
      <IconButton icon="collapse" />
    </div>
  </div>
  <div class="ac-plan-review__body">
    <MarkdownContent content={content} />
  </div>
  {comments?.length > 0 && (
    <div class="ac-plan-review__comments">
      {comments.map(c => <PlanComment key={c.id} {...c} />)}
    </div>
  )}
  <div class="ac-plan-review__footer">
    <IconButton icon="approve" label="Approve" variant="primary" onClick={handleApprove} />
    <IconButton icon="reject" label="Reject" variant="danger" onClick={handleReject} />
  </div>
</div>
```

---

## 5.17 `FileTree.tsx`

Hierarchical tree display of files/folders.

```typescript
interface FileTreeProps extends FileTreePart {}
```

**Renders:** Recursive tree nodes with indent levels, folder collapse/expand, file click handling.

**CSS:** `.ac-file-tree`, `.ac-file-tree__node`, `.ac-file-tree__node--dir`, `.ac-file-tree__node--file`, indentation via `padding-left: calc(level * var(--ac-space-xl))`

---

## 5.18 `ReferencesList.tsx`

Collapsible list of file/resource references used in the response.

```typescript
interface ReferencesListProps extends ReferencesPart {}
```

**Renders:** `<CollapsibleSection title="Used N references">` with list of `<Chip>` items, each clickable to navigate.

---

## 5.19 `InlineReference.tsx`

Clickable file/symbol reference link rendered inline in markdown.

```typescript
interface InlineReferenceProps extends InlineReferencePart {}
```

**Renders:** A styled link (`.ac-inline-ref`) with file icon + text, fires `onReferenceClick` on click.

---

## 5.20 `ImageContent.tsx`

Displays an image within the response.

```typescript
interface ImageContentProps extends ImagePart {}
```

**Renders:** `<img>` with `max-width: 100%`, `border-radius: var(--ac-radius-md)`, alt text, and optional dimensions.

---

## 5.21 Notification Components (`src/components/notifications/`)

### `ErrorMessage.tsx`

```typescript
interface ErrorMessageProps extends ErrorPart {}
```

**DOM:** `.ac-notification.ac-notification--{level}` with icon + markdown message.
- Error: red icon, red-tinted background
- Warning: yellow icon, yellow-tinted background  
- Info: blue icon, blue-tinted background

### `WarningMessage.tsx`

Alias for `<ErrorMessage level="warning" />`. Exported separately for convenience.

### `SystemNotification.tsx`

```typescript
interface SystemNotificationProps extends SystemNotificationPart {}
```

Three rendering modes based on `style`:
1. **standard** — icon + markdown progress step
2. **separator** — horizontal line with centered label (workspace transition style)
3. **collapsible** — disclosure with summary header + expandable detail body

### `WorkspaceTransition.tsx`

```typescript
interface WorkspaceTransitionProps extends WorkspaceTransitionPart {}
```

**DOM:** `.ac-workspace-transition` — horizontal separator with `──── 📁 WorkspaceName ────` pattern.

### `HookResult.tsx`

```typescript
interface HookResultProps extends HookResultPart {}
```

**Renders:** Collapsible section with blocked (red) or warning (orange) styling, showing hook type, tool name, reason, and message.

### `TipContent.tsx`

```typescript
interface TipContentProps extends TipPart {}
```

**Renders:** Light info banner with 💡 icon, message text, and optional dismiss button.

### `QuotaExceeded.tsx`

```typescript
interface QuotaExceededProps extends QuotaExceededPart {}
```

**Renders:** Warning banner with "Manage Budget" / "Upgrade" button.

### `RateLimited.tsx`

```typescript
interface RateLimitedProps extends RateLimitedPart {}
```

**Renders:** Info banner with "Sign In" / "Enable more features" button.

---

## 5.22 Interactive Components (`src/components/interactive/`)

### `ConfirmationDialog.tsx`

```typescript
interface ConfirmationDialogProps extends ConfirmationPart {}
```

**DOM Structure:**
```html
<div class="ac-confirmation ac-card">
  <div class="ac-confirmation__title">{title}</div>
  {subtitle && <div class="ac-confirmation__subtitle">{subtitle}</div>}
  <div class="ac-confirmation__message">
    <MarkdownContent content={message} />
  </div>
  <div class="ac-confirmation__buttons">
    {buttons.map(btn => (
      <button class={cn('ac-btn', btn.primary && 'ac-btn--primary')}>
        {btn.label}
        {btn.keybinding && <kbd>{btn.keybinding}</kbd>}
      </button>
    ))}
  </div>
</div>
```

### `ElicitationDialog.tsx`

Same structure as ConfirmationDialog, but with `isResolved` state handling — shows accepted result after resolution.

### `QuestionCarousel.tsx`

```typescript
interface QuestionCarouselProps extends QuestionCarouselPart {}
```

**DOM Structure:**
```html
<div class="ac-question-carousel ac-card-large">
  <div class="ac-question-carousel__header">
    <span class="ac-question-carousel__title">Questions</span>
    <span class="ac-question-carousel__step">{currentStep + 1} of {questions.length}</span>
    <IconButton icon="prev" onClick={handlePrev} disabled={currentStep === 0} />
    <IconButton icon="next" onClick={handleNext} disabled={currentStep === questions.length - 1} />
    <IconButton icon="close" onClick={handleClose} />
  </div>
  <div class="ac-question-carousel__body">
    {/* Current question input */}
    {question.type === 'text' && <input class="ac-input" />}
    {question.type === 'single-select' && <RadioGroup options={question.options} />}
    {question.type === 'multi-select' && <CheckboxGroup options={question.options} />}
    {question.type === 'freeform' && <textarea class="ac-textarea" />}
  </div>
  <div class="ac-question-carousel__footer">
    <button class="ac-btn ac-btn--primary" onClick={handleSubmit}>Submit</button>
    <button class="ac-btn" onClick={handleSkip}>Skip All</button>
  </div>
</div>
```

### `FollowupButton.tsx`

```typescript
interface FollowupButtonProps {
  followup: ChatFollowup;
  onClick: () => void;
}
```

**CSS:** `.ac-followup-btn` — styled as a suggestion chip with hover effect.

### `SuggestNext.tsx`

```typescript
interface SuggestNextProps extends SuggestNextPart {}
```

**Renders:** Grid/list of suggestion buttons, similar to welcome screen suggestions.

### `CommandButton.tsx`

```typescript
interface CommandButtonProps extends CommandButtonPart {}
```

**Renders:** Styled button that fires `onCommandClick` callback.

### `PullRequestCard.tsx`

```typescript
interface PullRequestCardProps extends PullRequestPart {}
```

**DOM:**
```html
<div class="ac-pull-request" onClick={() => onPullRequestClick(url)}>
  <span class="ac-pull-request__icon">🔀</span>
  <span class="ac-pull-request__title">{title}</span>
  <span class="ac-pull-request__author">by {author}</span>
</div>
```
