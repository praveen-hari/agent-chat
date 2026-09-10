# Phase 10: Hooks & Utilities

## Files

- `src/hooks/useStreaming.ts`
- `src/hooks/useAutoScroll.ts`
- `src/hooks/useRelativeTime.ts`
- `src/hooks/useCopyToClipboard.ts`
- `src/hooks/useCollapsible.ts`
- `src/hooks/useVirtualList.ts`
- `src/utils/cn.ts`
- `src/utils/wordCount.ts`
- `src/utils/iconMap.ts`

---

## 10.1 `useStreaming.ts` — Progressive Word Reveal

Implements VS Code's word-based progressive rendering for streaming markdown content.

```typescript
/**
 * Hook that progressively reveals streaming markdown content word-by-word.
 *
 * During streaming, returns a truncated version of `content` limited to
 * `revealedWordCount` words. After streaming completes, returns full content.
 *
 * @param content - The full markdown content (may still be accumulating)
 * @param isStreaming - Whether the response is still streaming
 * @param wordsPerSecond - Reveal rate (default: 80, range: 40-2000)
 * @returns The content string to render (truncated during streaming)
 *
 * Usage:
 *   const visibleContent = useStreaming(part.content, response.state === 'streaming', 80);
 *   return <MarkdownContent content={visibleContent} />;
 */
export function useStreaming(
  content: string,
  isStreaming: boolean,
  wordsPerSecond?: number
): string;
```

**Implementation:**
1. Count total words in `content` using `countWords()`
2. Maintain `revealedCount` state, starting at 0
3. Run a `requestAnimationFrame` loop that increments `revealedCount` by `wordsPerSecond / 60` per frame
4. Use `getNWords(content, revealedCount)` to truncate
5. When `!isStreaming`, immediately return full `content`
6. Adaptive rate: if content grows faster than reveal, increase rate (VS Code uses 40-2000 range)

**VS Code reference:** `ChatListItemRenderer.getProgressiveRenderRate()` and word counting in `chatWordCounter.ts`

---

## 10.2 `useAutoScroll.ts` — Smart Auto-Scroll

Manages auto-scroll behavior for the message list.

```typescript
/**
 * Hook that auto-scrolls a container to the bottom on new content,
 * with user-scroll-lock detection.
 *
 * @param containerRef - Ref to the scrollable container
 * @param dependencies - Array of values that trigger scroll check (e.g., message count)
 * @param options - Configuration
 * @returns { isAtBottom, scrollToBottom }
 *
 * Usage:
 *   const { isAtBottom, scrollToBottom } = useAutoScroll(listRef, [messages.length]);
 */
export function useAutoScroll(
  containerRef: React.RefObject<HTMLElement>,
  dependencies: unknown[],
  options?: {
    /** Threshold in pixels to consider "at bottom" (default: 100) */
    threshold?: number;
    /** Scroll behavior (default: 'smooth') */
    behavior?: ScrollBehavior;
    /** Whether auto-scroll is enabled (default: true) */
    enabled?: boolean;
  }
): {
  /** Whether the container is currently scrolled to the bottom */
  isAtBottom: boolean;
  /** Manually scroll to bottom */
  scrollToBottom: () => void;
  /** Whether auto-scroll is currently locked (user scrolled up) */
  isLocked: boolean;
};
```

**Behavior:**
1. On mount: scroll to bottom
2. On `dependencies` change: if `isAtBottom`, scroll to bottom
3. User scrolls up (beyond threshold): set `isLocked = true`, stop auto-scrolling
4. User scrolls back to bottom: set `isLocked = false`, resume auto-scrolling
5. New message added: scroll to bottom (unless locked)

---

## 10.3 `useRelativeTime.ts` — Live Relative Timestamps

```typescript
/**
 * Hook that returns a live-updating relative time string.
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted relative time string (e.g., "Just now", "2m ago", "1h ago")
 *
 * Usage:
 *   const timeAgo = useRelativeTime(message.timestamp);
 *   // "Just now" → "30s ago" → "2m ago" → "1h ago" → "Yesterday" → "Sep 10"
 */
export function useRelativeTime(timestamp: number): string;
```

**Update intervals:**
| Age | Format | Update frequency |
|-----|--------|-----------------|
| < 10s | "Just now" | 10s |
| < 60s | "Ns ago" | 10s |
| < 60m | "Nm ago" | 30s |
| < 24h | "Nh ago" | 60s |
| < 48h | "Yesterday" | 60s |
| < 7d | "N days ago" | never (static) |
| ≥ 7d | "MMM DD" or "MMM DD, YYYY" | never (static) |

**Implementation:** Uses `useEffect` with `setInterval` based on the age bucket. Cleans up interval on unmount.

---

## 10.4 `useCopyToClipboard.ts` — Copy with Feedback

```typescript
/**
 * Hook that provides clipboard copy functionality with visual feedback.
 *
 * @returns { copy, isCopied }
 *
 * Usage:
 *   const { copy, isCopied } = useCopyToClipboard();
 *   <button onClick={() => copy(text)}>
 *     {isCopied ? '✓ Copied' : 'Copy'}
 *   </button>
 */
export function useCopyToClipboard(
  /** Duration to show "copied" state in ms (default: 2000) */
  feedbackDuration?: number
): {
  /** Copy text to clipboard */
  copy: (text: string) => Promise<void>;
  /** Whether the "copied" feedback is currently showing */
  isCopied: boolean;
};
```

**Implementation:**
1. Uses `navigator.clipboard.writeText(text)` 
2. Sets `isCopied = true` for `feedbackDuration` ms
3. Falls back to `document.execCommand('copy')` for older browsers

---

## 10.5 `useCollapsible.ts` — Animated Expand/Collapse

```typescript
/**
 * Hook for managing collapsible section state with animation.
 *
 * @param defaultExpanded - Initial expanded state
 * @returns { isExpanded, toggle, expand, collapse, contentRef, style }
 *
 * Usage:
 *   const { isExpanded, toggle, contentRef, style } = useCollapsible(false);
 *   <button onClick={toggle}>{isExpanded ? '▼' : '▶'}</button>
 *   <div ref={contentRef} style={style}>{children}</div>
 */
export function useCollapsible(
  defaultExpanded?: boolean,
  options?: {
    /** Animation duration in ms (default: 200) */
    duration?: number;
    /** Callback when expansion state changes */
    onToggle?: (expanded: boolean) => void;
  }
): {
  isExpanded: boolean;
  toggle: () => void;
  expand: () => void;
  collapse: () => void;
  /** Ref to attach to the collapsible content container */
  contentRef: React.RefObject<HTMLDivElement>;
  /** Inline styles for animation (height transition) */
  style: React.CSSProperties;
};
```

**Implementation:**
- Measures content height via `contentRef.current.scrollHeight`
- Transitions `height` from `0` to `scrollHeight` (or vice versa)
- Uses `requestAnimationFrame` for smooth animation
- After expand animation: sets `height: 'auto'` for dynamic content

---

## 10.6 `useVirtualList.ts` — List Virtualization

```typescript
/**
 * Hook that determines whether the message list should use virtualization.
 * Based on VS Code's approach: virtualize when list is large enough to benefit.
 *
 * @param messageCount - Number of messages in the session
 * @param threshold - Enable virtualization above this count (default: 50)
 * @returns { shouldVirtualize }
 */
export function useVirtualList(
  messageCount: number,
  threshold?: number
): {
  shouldVirtualize: boolean;
};
```

---

## 10.7 `cn.ts` — className Utility

```typescript
/**
 * Lightweight className concatenation utility.
 * Filters out falsy values and joins with spaces.
 *
 * Usage:
 *   cn('base', condition && 'modifier', undefined, 'other')
 *   // → 'base modifier other'
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
```

---

## 10.8 `wordCount.ts` — Word Counting for Streaming

```typescript
/**
 * Count words in a string (matching VS Code's word counting logic).
 */
export function countWords(text: string): number;

/**
 * Get the first N words of a string, preserving markdown structure.
 * Returns the substring up to and including the Nth word.
 */
export function getNWords(text: string, n: number): string;

/**
 * Calculate the adaptive streaming rate based on content load rate.
 * Returns words per second (range: 40-2000).
 *
 * @param impliedWordLoadRate - Words arriving per second from the backend
 * @param minRate - Minimum render rate (default: 40)
 * @param maxRate - Maximum render rate (default: 2000)
 */
export function getProgressiveRenderRate(
  impliedWordLoadRate: number,
  minRate?: number,
  maxRate?: number
): number;
```

---

## 10.9 `iconMap.ts` — Tool Icon Resolution

```typescript
/**
 * Resolves a tool ID to a display icon (emoji or icon identifier).
 * Matches VS Code's getToolInvocationIcon() logic.
 *
 * @param toolId - The tool identifier string
 * @returns Icon string (emoji or icon ID)
 */
export function resolveToolIcon(toolId: string): string;

/**
 * Resolves a file extension to a file type icon.
 *
 * @param filename - The filename
 * @returns Icon string
 */
export function resolveFileIcon(filename: string): string;

/**
 * Maps file change status to a status icon.
 */
export function resolveChangeStatusIcon(
  status: 'created' | 'modified' | 'deleted' | 'renamed'
): string;
```

**Tool icon mapping:**
```typescript
const TOOL_ICON_PATTERNS: Array<[RegExp, string]> = [
  [/comment/i, '💬'],
  [/search|grep|find|list|semantic|changes|codebase/i, '🔍'],
  [/read|get_file|problems/i, '📖'],
  [/edit|create|replace|patch|write/i, '✏️'],
  [/terminal|shell|exec|run/i, '💻'],
  [/browser|fetch|url|web/i, '🌐'],
  [/test|spec|assert/i, '🧪'],
  [/git|commit|push|pull|branch/i, '📦'],
  [/database|sql|query/i, '🗄️'],
  [/image|screenshot|visual/i, '🖼️'],
  [/deploy|build|compile/i, '🚀'],
  [/auth|login|token/i, '🔐'],
];

const DEFAULT_TOOL_ICON = '🔧';
```

---

## Build Configuration

### `package.json`

```json
{
  "name": "@agent-chat/react",
  "version": "0.1.0",
  "description": "Reusable React component library for AI agent chat interfaces",
  "main": "dist/index.cjs.js",
  "module": "dist/index.es.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.es.js",
      "require": "./dist/index.cjs.js",
      "types": "./dist/index.d.ts"
    },
    "./styles.css": "./dist/styles.css"
  },
  "files": ["dist"],
  "sideEffects": ["*.css"],
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0"
  },
  "dependencies": {
    "react-markdown": "^9.0.0",
    "remark-gfm": "^4.0.0",
    "rehype-katex": "^7.0.0",
    "remark-math": "^6.0.0",
    "shiki": "^1.0.0",
    "react-virtuoso": "^4.0.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "vite": "^6.0.0",
    "vite-plugin-dts": "^4.0.0",
    "@types/react": "^18.0.0 || ^19.0.0",
    "@types/react-dom": "^18.0.0 || ^19.0.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src/",
    "clean": "rm -rf dist"
  },
  "license": "MIT",
  "keywords": [
    "react",
    "chat",
    "ai",
    "agent",
    "component-library",
    "copilot",
    "llm",
    "coding-agent"
  ]
}
```

### `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    dts({ rollupTypes: true }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'AgentChat',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'es' : 'cjs'}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    cssCodeSplit: false, // Single CSS bundle
  },
});
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```
