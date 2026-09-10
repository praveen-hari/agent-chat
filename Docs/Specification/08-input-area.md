# Phase 8: Input Area Components

## Files

All in `src/components/input/`

---

## 8.1 `ChatTextarea.tsx`

Auto-resizing textarea with paste/drop support for attachments.

```typescript
interface ChatTextareaProps {
  /** Current text value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Submit handler (Enter key) */
  onSubmit: () => void;
  /** Placeholder text */
  placeholder?: string;
  /** Maximum height in pixels (default: 250) */
  maxHeight?: number;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Whether a response is streaming (shows cancel state) */
  isStreaming?: boolean;
  /** File paste/drop handler */
  onFilePaste?: (files: File[]) => void;
  /** History navigation (up/down arrow) */
  history?: string[];
  /** Ref for external focus control */
  inputRef?: React.RefObject<HTMLTextAreaElement>;
}
```

**Features:**
1. **Auto-resize:** Height grows with content, capped at `maxHeight`
2. **Submit on Enter:** Plain Enter submits, Shift+Enter adds newline
3. **History navigation:** Up/Down arrows cycle through previous messages when cursor is at start/end
4. **Paste handling:** Intercepts paste events with files → fires `onFilePaste`
5. **Drag-and-drop:** Accepts dragged files → fires `onFilePaste`
6. **Focus management:** Auto-focuses on mount, re-focuses after send

**DOM Structure:**
```html
<div class="ac-textarea-wrapper">
  <textarea
    class="ac-textarea"
    value={value}
    onChange={handleChange}
    onKeyDown={handleKeyDown}
    onPaste={handlePaste}
    onDrop={handleDrop}
    placeholder={placeholder}
    disabled={disabled}
    rows={1}
    style={{ maxHeight: `${maxHeight}px` }}
    aria-label="Chat input"
    ref={inputRef}
  />
  {/* Drop zone overlay */}
  {isDragOver && (
    <div class="ac-textarea__drop-overlay">
      Drop files to attach
    </div>
  )}
</div>
```

**CSS:**
```css
.ac-textarea-wrapper {
  position: relative;
}
.ac-textarea {
  width: 100%;
  resize: none;
  border: none;
  outline: none;
  background: transparent;
  color: var(--ac-fg-primary);
  font-family: var(--ac-font-family);
  font-size: var(--ac-font-size-md);
  line-height: var(--ac-line-height);
  padding: var(--ac-space-lg);
  overflow-y: auto;
  min-height: 44px; /* ~2 lines */
}
.ac-textarea::placeholder {
  color: var(--ac-fg-placeholder);
}
.ac-textarea__drop-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ac-bg-hover);
  border: 2px dashed var(--ac-border-input-focus);
  border-radius: var(--ac-radius-md);
  pointer-events: none;
}
```

**Auto-resize implementation:**
```typescript
useEffect(() => {
  const el = inputRef.current;
  if (el) {
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }
}, [value, maxHeight]);
```

---

## 8.2 `AttachmentBar.tsx`

Row of attached file/image chips below the textarea.

```typescript
interface AttachmentBarProps {
  /** Current attachments */
  attachments: ChatAttachment[];
  /** Remove handler */
  onRemove: (id: string) => void;
}
```

**Renders:** `<AttachmentsRow attachments={attachments} editable onRemove={onRemove} />`

**CSS:** `.ac-attachment-bar` — `display: flex`, `flex-wrap: wrap`, `gap: var(--ac-space-xs)`, `padding: 0 var(--ac-space-lg) var(--ac-space-md)`

Only visible when `attachments.length > 0`.

---

## 8.3 `InputToolbar.tsx`

Toolbar below the textarea with mode/model pickers and submit button.

```typescript
interface InputToolbarProps {
  /** Current chat mode */
  mode: ChatMode;
  /** Mode change handler */
  onModeChange: (mode: ChatMode) => void;
  /** Current model ID */
  modelId?: string;
  /** Model change handler */
  onModelChange: (modelId: string) => void;
  /** Submit handler */
  onSubmit: () => void;
  /** Cancel handler (when streaming) */
  onCancel: () => void;
  /** Whether a response is streaming */
  isStreaming: boolean;
  /** Whether submit is enabled */
  canSubmit: boolean;
  /** Whether to show attachment add button */
  showAttachButton: boolean;
  /** Attachment add handler */
  onAttachClick?: () => void;
}
```

**DOM Structure:**
```html
<div class="ac-input-toolbar">
  <div class="ac-input-toolbar__left">
    {/* Mode picker */}
    {config.showModePicker && (
      <select class="ac-picker" value={mode} onChange={handleModeChange}>
        {config.availableModes.map(m => (
          <option key={m} value={m}>{modeLabels[m]}</option>
        ))}
      </select>
    )}
    
    {/* Model picker */}
    {config.showModelPicker && config.availableModels.length > 0 && (
      <select class="ac-picker" value={modelId} onChange={handleModelChange}>
        {config.availableModels.map(m => (
          <option key={m.id} value={m.id}>{m.label}</option>
        ))}
      </select>
    )}
    
    {/* Attach button */}
    {showAttachButton && (
      <IconButton icon="attach" label="Attach File" onClick={onAttachClick} />
    )}
  </div>
  
  <div class="ac-input-toolbar__right">
    {/* Submit / Cancel button */}
    {isStreaming ? (
      <button class="ac-btn ac-btn--danger" onClick={onCancel} aria-label="Cancel">
        ■ Stop
      </button>
    ) : (
      <button
        class="ac-btn ac-btn--primary ac-submit-btn"
        onClick={onSubmit}
        disabled={!canSubmit}
        aria-label="Send message"
      >
        ↑ Send
      </button>
    )}
  </div>
</div>
```

**Mode labels:**
```typescript
const modeLabels: Record<ChatMode, string> = {
  ask: 'Ask',
  agent: 'Agent',
  edit: 'Edit',
};
```

**CSS:**
```css
.ac-input-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--ac-space-xs) var(--ac-space-lg);
  min-height: var(--ac-control-height);
}
.ac-input-toolbar__left,
.ac-input-toolbar__right {
  display: flex;
  align-items: center;
  gap: var(--ac-space-xs);
}
.ac-picker {
  background: var(--ac-bg-status);
  color: var(--ac-fg-primary);
  border: var(--ac-stroke-width) solid var(--ac-border);
  border-radius: var(--ac-radius-sm);
  padding: var(--ac-space-xxs) var(--ac-space-md);
  font-size: var(--ac-font-size-xs);
  height: var(--ac-control-height);
  cursor: pointer;
}
.ac-submit-btn {
  min-width: 64px;
  height: 28px;
  border-radius: var(--ac-radius-sm);
}
```

---

## 8.4 `InputNotice.tsx`

Notice/tip banner displayed above or below the input area.

```typescript
interface InputNoticeProps {
  /** Notice type */
  variant: 'tip' | 'warning' | 'info';
  /** Notice message */
  message: string;
  /** Icon */
  icon?: string;
  /** Whether dismissible */
  dismissible?: boolean;
  /** Dismiss handler */
  onDismiss?: () => void;
  /** Action button */
  action?: { label: string; onClick: () => void };
}
```

**DOM Structure:**
```html
<div class="ac-input-notice ac-input-notice--{variant}">
  <span class="ac-input-notice__icon">{icon || defaultIcon}</span>
  <span class="ac-input-notice__message">{message}</span>
  {action && (
    <button class="ac-btn ac-btn--small" onClick={action.onClick}>
      {action.label}
    </button>
  )}
  {dismissible && (
    <IconButton icon="×" label="Dismiss" onClick={onDismiss} size="small" />
  )}
</div>
```

**CSS:** `.ac-input-notice` — light background tint based on variant, with icon and text.

---

## 8.5 `ChatInputArea.tsx`

Composed input area: textarea + attachments + toolbar.

```typescript
interface ChatInputAreaProps {
  /** Additional CSS class */
  className?: string;
}
```

**This is a composed component** that uses `useChatContext()` and `useChatActions()` to wire everything together.

**DOM Structure:**
```html
<div class={cn(
  'ac-input-area',
  isStreaming && 'ac-input-area--streaming',
)}>
  {/* Input notice (if any) */}
  {notice && <InputNotice {...notice} />}
  
  {/* Main input container with border */}
  <div class="ac-input-container">
    {/* Textarea */}
    <ChatTextarea
      value={inputValue}
      onChange={setInputValue}
      onSubmit={handleSubmit}
      placeholder={config.placeholder}
      maxHeight={config.maxInputHeight}
      isStreaming={isStreaming}
      onFilePaste={handleFilePaste}
      history={inputHistory}
      inputRef={textareaRef}
    />
    
    {/* Attachment bar */}
    {attachments.length > 0 && (
      <AttachmentBar
        attachments={attachments}
        onRemove={handleAttachmentRemove}
      />
    )}
    
    {/* Toolbar */}
    <InputToolbar
      mode={currentMode}
      onModeChange={handleModeChange}
      modelId={currentModelId}
      onModelChange={handleModelChange}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isStreaming={isStreaming}
      canSubmit={inputValue.trim().length > 0 && !isStreaming}
      showAttachButton={config.enableAttachments}
      onAttachClick={handleAttachClick}
    />
  </div>
</div>
```

**CSS:**
```css
.ac-input-area {
  padding: var(--ac-space-md) var(--ac-space-xl);
  flex-shrink: 0;
}
.ac-input-container {
  border: var(--ac-stroke-width) solid var(--ac-border-input);
  border-radius: var(--ac-radius-lg);
  background: var(--ac-bg-input);
  overflow: hidden;
  transition: border-color var(--ac-transition-fast);
}
.ac-input-container:focus-within {
  border-color: var(--ac-border-input-focus);
  background: var(--ac-bg-input-focus);
}
/* Animated border during streaming */
.ac-input-area--streaming .ac-input-container {
  animation: ac-input-border-pulse 2s ease infinite;
}
```

**Keyboard shortcuts:**
| Key | Action |
|-----|--------|
| Enter | Submit message |
| Shift+Enter | New line |
| ↑ (at start) | Previous message from history |
| ↓ (at end) | Next message from history |
| Escape | Cancel streaming (if active) |
