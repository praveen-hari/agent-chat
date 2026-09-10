# Phase 7: Message Layout Components

## Files

All in `src/components/messages/`

---

## 7.1 `MessageHeader.tsx`

Shared header for both request and response rows.

```typescript
interface MessageHeaderProps {
  /** Avatar icon */
  avatar: string | { src: string } | { iconId: string };
  /** Display name */
  username: string;
  /** Subtitle detail text (e.g., "Using tool X...") */
  detail?: string;
  /** Timestamp */
  timestamp: number;
  /** Header toolbar actions (shown on hover) */
  actions?: React.ReactNode;
  /** Additional CSS class */
  className?: string;
}
```

**DOM Structure:**
```html
<div class="ac-message-header">
  <div class="ac-message-header__user">
    <Avatar icon={avatar} name={username} />
    <Username name={username} />
  </div>
  {detail && (
    <div class="ac-message-header__detail">
      <span>{detail}</span>
    </div>
  )}
  <div class="ac-message-header__toolbar">
    {actions}
  </div>
</div>
```

**CSS:**
```css
.ac-message-header {
  display: flex;
  align-items: center;
  gap: var(--ac-space-md);
  padding: var(--ac-space-md) 0;
}
.ac-message-header__user {
  display: flex;
  align-items: center;
  gap: var(--ac-space-md);
}
.ac-message-header__toolbar {
  margin-left: auto;
  opacity: 0;
  transition: opacity var(--ac-transition-fast);
}
.ac-message-row:hover .ac-message-header__toolbar,
.ac-message-row:focus-within .ac-message-header__toolbar {
  opacity: 1;
}
```

---

## 7.2 `RequestRow.tsx`

Renders a user message row.

```typescript
interface RequestRowProps {
  /** The request message data */
  request: ChatRequest;
  /** Whether this is the last message in the list */
  isLast: boolean;
}
```

**DOM Structure:**
```html
<div class="ac-message-row ac-message-row--request" role="listitem">
  <MessageHeader
    avatar="👤"
    username="User"
    timestamp={request.timestamp}
    actions={
      <>
        {onEditRequest && <IconButton icon="edit" label="Edit" onClick={handleEdit} />}
        {onDeleteRequest && <IconButton icon="delete" label="Delete" onClick={handleDelete} />}
      </>
    }
  />
  
  {/* Request origin pill (for delegated requests) */}
  {request.origin && (
    <RequestOriginPill origin={request.origin} />
  )}
  
  {/* Attachments */}
  {request.attachments?.length > 0 && (
    <AttachmentsRow attachments={request.attachments} />
  )}
  
  {/* Message content */}
  <div class="ac-message-row__content">
    {request.content.map((part, i) => (
      <ContentPartRenderer key={i} part={part} index={i} isStreaming={false} />
    ))}
  </div>
  
  {/* Timestamp (optional, for detailed view) */}
  {config.showResponseDetails && (
    <div class="ac-message-row__timestamp">
      <Timestamp time={request.timestamp} />
    </div>
  )}
</div>
```

**CSS:**
```css
.ac-message-row--request {
  border: var(--ac-stroke-width) solid var(--ac-border-request);
  background: var(--ac-bg-request);
  border-radius: var(--ac-radius-lg);
  padding: var(--ac-space-lg) var(--ac-space-xl);
  margin: var(--ac-space-md) 0;
}
```

---

## 7.3 `ResponseRow.tsx`

Renders an assistant response row with all content parts.

```typescript
interface ResponseRowProps {
  /** The response message data */
  response: ChatResponse;
  /** Whether this is the last response */
  isLast: boolean;
}
```

**DOM Structure:**
```html
<div
  class={cn(
    'ac-message-row',
    'ac-message-row--response',
    response.state === 'streaming' && 'ac-message-row--streaming',
    isLast && 'ac-message-row--last',
  )}
  role="listitem"
  aria-busy={response.state === 'streaming'}
>
  <MessageHeader
    avatar={response.agent?.icon || '🤖'}
    username={response.agent?.name || 'Assistant'}
    detail={getResponseDetail(response)}
    timestamp={response.timestamp}
    actions={
      <>
        <IconButton icon="retry" label="Retry" onClick={handleRetry} />
      </>
    }
  />
  
  {/* Content parts — the main rendering area */}
  <div class="ac-message-row__content">
    {response.content.map((part, i) => (
      <ContentPartRenderer
        key={`${part.kind}-${i}`}
        part={part}
        index={i}
        isStreaming={response.state === 'streaming'}
        response={response}
        isLast={i === response.content.length - 1}
      />
    ))}
  </div>
  
  {/* Error display */}
  {response.error && response.state === 'failed' && (
    <ErrorMessage
      message={response.error.message}
      level={response.error.level}
    />
  )}
  
  {/* Response footer (shown when complete or last) */}
  {(response.state === 'complete' || response.state === 'failed') && isLast && (
    <ResponseFooter response={response} />
  )}
  
  {/* Follow-up suggestions */}
  {response.followups?.length > 0 && response.state === 'complete' && isLast && (
    <div class="ac-followups">
      {response.followups.map(f => (
        <FollowupButton key={f.id} followup={f} onClick={() => actions.followupClick(f)} />
      ))}
    </div>
  )}
</div>
```

**CSS:**
```css
.ac-message-row--response {
  padding: var(--ac-space-md) 0;
}
.ac-message-row--streaming {
  /* Subtle left border indicator */
}
.ac-message-row--last {
  /* Show footer */
}
```

---

## 7.4 `ResponseFooter.tsx`

Footer bar with copy/vote actions and response metadata.

```typescript
interface ResponseFooterProps {
  response: ChatResponse;
}
```

**DOM Structure:**
```html
<div class="ac-response-footer">
  <div class="ac-response-footer__toolbar">
    {/* Copy entire response */}
    {config.showCopyButton && (
      <IconButton icon="copy" label="Copy Response" onClick={handleCopyAll} />
    )}
    
    {/* Vote buttons */}
    {config.showVoteButtons && callbacks.onVote && (
      <>
        <IconButton
          icon="thumbs-up"
          label="Helpful"
          variant={response.vote === 'up' ? 'primary' : 'default'}
          onClick={() => actions.vote(response.id, 'up')}
        />
        <IconButton
          icon="thumbs-down"
          label="Not Helpful"
          variant={response.vote === 'down' ? 'danger' : 'default'}
          onClick={() => actions.vote(response.id, 'down')}
        />
      </>
    )}
  </div>
  
  {/* Response details */}
  {config.showResponseDetails && (
    <div class="ac-response-footer__details">
      {/* Relative time */}
      <span class="ac-response-footer__time">
        <Timestamp time={response.completedAt || response.timestamp} />
      </span>
      
      {/* Model name */}
      {response.agent && (
        <span class="ac-response-footer__model">
          {response.agent.name}
        </span>
      )}
      
      {/* Elapsed time */}
      {response.elapsedMs && (
        <span class="ac-response-footer__elapsed">
          {formatDuration(response.elapsedMs)}
        </span>
      )}
      
      {/* Token usage */}
      {config.showTokenUsage && response.usage && (
        <span class="ac-response-footer__tokens">
          {response.usage.totalTokens || response.usage.promptTokens + response.usage.completionTokens} tokens
        </span>
      )}
    </div>
  )}
</div>
```

**CSS:**
```css
.ac-response-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--ac-space-md) 0;
  border-top: var(--ac-stroke-width) solid var(--ac-border);
  margin-top: var(--ac-space-md);
}
.ac-response-footer__details {
  display: flex;
  gap: var(--ac-space-md);
  color: var(--ac-fg-tertiary);
  font-size: var(--ac-font-size-xs);
}
.ac-response-footer__details > span::after {
  content: '·';
  margin-left: var(--ac-space-md);
}
.ac-response-footer__details > span:last-child::after {
  content: none;
}
```

---

## 7.5 `RequestOriginPill.tsx`

Shows where a delegated/forwarded request originated from.

```typescript
interface RequestOriginPillProps {
  origin: ChatRequestOrigin;
}
```

**Renders:** `<Chip icon={origin.icon} label={origin.label} onClick={handleNavigate} variant="default" />`

**CSS:** `.ac-request-origin` — small pill positioned below the header, before content.

---

## 7.6 `AttachmentsRow.tsx`

Displays user-attached files/images/tools as a row of chips.

```typescript
interface AttachmentsRowProps {
  attachments: ChatAttachment[];
  /** Whether attachments are removable (input mode) */
  editable?: boolean;
  /** Remove handler (for input mode) */
  onRemove?: (id: string) => void;
}
```

**DOM Structure:**
```html
<div class="ac-attachments-row">
  {attachments.map(att => {
    // Check for consumer override
    const Override = config.attachmentOverrides?.[att.type];
    if (Override) return <Override key={att.id} {...att} />;
    
    // Default rendering per type
    switch (att.type) {
      case 'file':
        return <Chip key={att.id} icon="📄" label={att.filename} onClick={() => handleFileOpen(att.uri)} removable={editable} onRemove={() => onRemove?.(att.id)} />;
      case 'image':
        return <ImageAttachmentChip key={att.id} {...att} />;
      case 'terminal':
        return <Chip key={att.id} icon="💻" label={att.label} variant="terminal" />;
      case 'toolset':
        return <Chip key={att.id} icon={att.icon || '🔧'} label={att.name} variant="tool" />;
      case 'selection':
        return <Chip key={att.id} icon="📝" label={`${att.filename}:${att.range.startLine}-${att.range.endLine}`} />;
      case 'custom':
        return <Chip key={att.id} icon={att.icon} label={att.label} />;
    }
  })}
</div>
```

**CSS:** `.ac-attachments-row` — `display: flex`, `flex-wrap: wrap`, `gap: var(--ac-space-xs)`

---

## 7.7 `MessageList.tsx`

Virtualized scrollable list of message rows.

```typescript
interface MessageListProps {
  /** Additional CSS class */
  className?: string;
}
```

**Implementation:**
- Uses `react-virtuoso` for virtualizing large conversations (>50 messages)
- Falls back to simple `div` scroll for small conversations
- Auto-scrolls to bottom on new messages (with user-scroll-lock detection)
- Uses `useAutoScroll()` hook

**DOM Structure:**
```html
<div class="ac-message-list" role="list" aria-label={config.ariaLabel}>
  {/* Virtuoso handles rendering visible items */}
  <Virtuoso
    data={flattenedItems}
    itemContent={(index, item) => {
      if (item.role === 'user') {
        return <RequestRow request={item} isLast={index === items.length - 1} />;
      } else {
        return <ResponseRow response={item} isLast={index === items.length - 1} />;
      }
    }}
    followOutput="smooth"
    alignToBottom
    atBottomThreshold={100}
  />
</div>
```

**CSS:**
```css
.ac-message-list {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 var(--ac-space-xl);
}
```

**Auto-scroll behavior:**
1. New message added → scroll to bottom (smooth)
2. User scrolls up → disable auto-scroll (user is reading history)
3. User scrolls back to bottom → re-enable auto-scroll
4. Streaming content updates → scroll to bottom only if already at bottom
