---
description: "Use when creating or modifying content part components in the chat rendering system. Enforces the discriminated union pattern, ContentPartRenderer dispatch, memoization, CSS structure, and streaming compatibility."
applyTo: "src/components/content-parts/**"
---

# Content Part Component Patterns

Content parts are the core rendering units. Every visual element in a chat response is a `ChatContentPart` rendered by a dedicated React component.

## Architecture

```
ChatContentPart (discriminated union on `kind`)
    ↓
ContentPartRenderer.tsx (switch on kind → component)
    ↓
Individual component (e.g., ThinkingBlock, CodeBlock, EditPill)
```

## Creating a New Content Part

### Step 1: Add the type

In `src/types/content-parts.ts`:
1. Define the interface with `kind` as a string literal
2. Add it to the `ChatContentPart` union
3. Export it from `src/index.ts`

```typescript
export interface MyNewPart {
  kind: 'my-new-part';  // unique string literal
  // ... properties
}
```

### Step 2: Create the component

In `src/components/content-parts/MyNewPart.tsx`:

```typescript
import type { MyNewPart as MyNewPartData } from '../../types/content-parts';
import { memo } from 'react';
import { cn } from '../../utils/cn';

export interface MyNewPartProps extends MyNewPartData {
  isStreaming?: boolean;
}

export const MyNewPart = memo(function MyNewPart({
  /* destructure props */
  className,
}: MyNewPartProps) {
  return (
    <div className={cn('ac-my-new-part', className)}>
      {/* rendering */}
    </div>
  );
});
```

### Step 3: Register in ContentPartRenderer

In `ContentPartRenderer.tsx`, add the case:
```typescript
case 'my-new-part':
  return <MyNewPart {...(part as MyNewPartData)} isStreaming={isStreaming} />;
```

### Step 4: Write tests

In `MyNewPart.test.tsx`, cover:
- Renders with minimal props
- All visual states
- Interactions (if any)
- Streaming vs. complete behavior
- Accessibility

### Step 5: Export

Add to `src/index.ts`:
```typescript
export { MyNewPart } from './components/content-parts/MyNewPart';
export type { MyNewPartProps } from './components/content-parts/MyNewPart';
```

## Rules

### Discriminated Union
- Every content part interface MUST have a `kind` field with a unique string literal type.
- The `ChatContentPart` union MUST include all part types.
- `ContentPartRenderer` MUST handle all `kind` values — use exhaustive switch.
- Unknown kinds render `null` in production, debug placeholder in development.

### Memoization
- ALL content part components MUST be wrapped in `React.memo()`.
- During streaming, content parts re-render on every word — memo prevents wasted renders.
- Props interface should extend the data type: `interface CodeBlockProps extends CodeBlockPart {}`.

### CSS Structure
Each content part follows this CSS pattern:
```css
/* Container */
.ac-{part-name} { }

/* Child elements */
.ac-{part-name}__header { }
.ac-{part-name}__body { }
.ac-{part-name}__footer { }

/* State modifiers */
.ac-{part-name}--active { }
.ac-{part-name}--streaming { }
.ac-{part-name}--complete { }
```

### Streaming Compatibility
- Accept `isStreaming?: boolean` prop.
- When streaming: show progress indicators, shimmer effects, or animated dots.
- When complete: show final state with checkmarks, static content.
- Use `useStreaming()` hook for progressive word reveal in markdown parts.

### Consumer Overrides
The `ContentPartRenderer` MUST check for consumer overrides before rendering defaults:
```typescript
const Override = config.contentPartOverrides?.[part.kind];
if (Override) return <Override {...part} />;
```

### Context Access
- Use `useChatContext()` to access session, config, and theme.
- Use `useChatActions()` to dispatch callbacks (e.g., tool approval, file open).
- Never prop-drill callbacks through multiple levels — use context.
