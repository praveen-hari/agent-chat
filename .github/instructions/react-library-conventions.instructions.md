---
description: "Use when creating or modifying React components. Enforces React library best practices: memoization, typed props, CSS variable theming, BEM naming, accessibility, composable exports, and performance patterns."
applyTo: "src/**/*.tsx"
---

# React Library Conventions

This is a **published component library**. Every component must be production-quality, accessible, and performant.

## Component Structure

```typescript
// 1. Imports (type imports first)
import type { ComponentProps } from './types';
import { memo, useCallback } from 'react';
import { useChatContext } from '../../provider/useChatContext';
import { cn } from '../../utils/cn';

// 2. Props interface (always exported, always typed)
export interface AvatarProps {
  icon: string | { src: string } | { iconId: string };
  name?: string;
  size?: number;
  className?: string;
}

// 3. Component (named export, wrapped in memo)
export const Avatar = memo(function Avatar({ icon, name, size = 24, className }: AvatarProps) {
  // hooks first, then handlers, then render
  return (
    <div
      className={cn('ac-avatar', className)}
      role="img"
      aria-label={name}
      style={{ width: size, height: size }}
    >
      {/* ... */}
    </div>
  );
});
```

## Rules

### Props & Types
- **Always export the props interface** — consumers may need it for wrapper components.
- **Use `type` imports** for type-only imports: `import type { X } from '...'`.
- **No `any` in props** — use proper types, generics, or `unknown` with narrowing.
- **Optional props have defaults** — use destructuring defaults, not `defaultProps`.
- **`className` prop on every visual component** — for consumer customization.
- **`children` only when semantically appropriate** — don't add it "just in case".

### Memoization
- **Wrap all content part components in `React.memo()`** — they re-render on every streaming tick.
- **Use named function inside memo** — `memo(function Avatar() {})` not `memo(() => {})` for better stack traces.
- **Use `useCallback` for event handlers** passed to children.
- **Use `useMemo` for derived computations** that are expensive.
- **Do NOT over-memoize** — atoms with no children don't need memo.

### CSS & Styling
- **All styles via CSS variables** — `var(--ac-*)` tokens, never hardcoded colors or sizes.
- **BEM naming with `ac-` prefix**: `.ac-{block}`, `.ac-{block}__{element}`, `.ac-{block}--{modifier}`.
- **Use `cn()` utility** for conditional class names: `cn('ac-btn', primary && 'ac-btn--primary')`.
- **No inline styles** except for dynamic values (width, height, transforms).
- **No CSS-in-JS** — plain CSS files with CSS variables for theming.
- **Responsive** — use relative units (`em`, `%`) where possible, `px` only for fixed sizes.

### Accessibility (WCAG 2.1 AA)
- **Every interactive element** must have an accessible name (`aria-label`, visible text, or `aria-labelledby`).
- **Use semantic HTML** — `<button>` not `<div onClick>`, `<nav>`, `<main>`, `<section>`.
- **Keyboard navigation** — all interactive elements reachable via Tab, activated via Enter/Space.
- **ARIA roles** — `role="list"` for message lists, `role="listitem"` for rows, `role="img"` for avatars.
- **`aria-busy`** on streaming responses.
- **`aria-live="polite"`** for dynamic announcements.
- **Focus management** — auto-focus input after send, return focus after dialog close.
- **Color contrast** — semantic colors must meet 4.5:1 ratio against their backgrounds.

### Exports
- **Named exports only** — no default exports (better tree-shaking and refactoring).
- **Barrel export from `src/index.ts`** — this is the public API.
- **Export props interfaces** alongside components.
- **Internal utilities** (cn, wordCount) are NOT exported from index.ts.

### Performance
- **Virtualize lists** — use `react-virtuoso` for message lists > 50 items.
- **Lazy render** — sub-agent children only render on expand.
- **Avoid re-renders** — content parts compare by reference via `React.memo`.
- **No heavy computation in render** — use `useMemo` for filtering, mapping, sorting.

### Patterns
- **Discriminated union rendering** — `switch(part.kind)` in ContentPartRenderer, never `if/else` chains.
- **Consumer overrides** — check `config.contentPartOverrides[kind]` before default rendering.
- **Graceful degradation** — missing callbacks hide features (no vote handler → no vote buttons).
- **Error boundaries** — content parts wrapped in error boundary to prevent one broken part from crashing the whole chat.

### Do NOT
- Do not use `forwardRef` unless the component genuinely needs to expose a DOM ref.
- Do not use `useEffect` for derived state — use `useMemo` instead.
- Do not use `index` as `key` for dynamic lists — use `id` or `kind + index`.
- Do not create wrapper `<div>` elements unnecessarily — use fragments `<>` when possible.
- Do not import from `react` what you can import from `react/jsx-runtime` automatically.
