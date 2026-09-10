# Phase 2: Theme & Styling System

## Files

- `src/theme/tokens.ts`
- `src/theme/dark.ts`
- `src/theme/light.ts`
- `src/theme/ThemeProvider.tsx`
- `src/theme/css/tokens.css`
- `src/theme/css/reset.css`
- `src/theme/css/base.css`
- `src/theme/css/atoms.css`
- `src/theme/css/content-parts.css`
- `src/theme/css/messages.css`
- `src/theme/css/input.css`

---

## 2.1 `tokens.ts` — Theme Token Interface

All visual properties are controlled via tokens. Consumers can override any token.

```typescript
export interface AgentChatTheme {
  // ═══════════════════════════════════════════
  // COLORS — Backgrounds
  // ═══════════════════════════════════════════
  /** Main chat panel background */
  bgPrimary: string;
  /** Message list area background */
  bgList: string;
  /** User request message background */
  bgRequest: string;
  /** Response content area background */
  bgResponse: string;
  /** Input area background */
  bgInput: string;
  /** Input area background when focused */
  bgInputFocus: string;
  /** Code block background */
  bgCode: string;
  /** Hover state background */
  bgHover: string;
  /** Status/badge background */
  bgStatus: string;
  /** Avatar background */
  bgAvatar: string;
  /** Confirmation card background */
  bgCard: string;
  /** Tooltip background */
  bgTooltip: string;
  /** Thinking block background */
  bgThinking: string;
  /** Terminal output background */
  bgTerminal: string;

  // ═══════════════════════════════════════════
  // COLORS — Foregrounds
  // ═══════════════════════════════════════════
  /** Primary text color */
  fgPrimary: string;
  /** Secondary/muted text */
  fgSecondary: string;
  /** Tertiary/subtle text (timestamps, details) */
  fgTertiary: string;
  /** Link color */
  fgLink: string;
  /** Avatar foreground */
  fgAvatar: string;
  /** Icon color (default) */
  fgIcon: string;
  /** Icon color on hover */
  fgIconHover: string;
  /** Placeholder text */
  fgPlaceholder: string;

  // ═══════════════════════════════════════════
  // COLORS — Semantic
  // ═══════════════════════════════════════════
  /** Success/positive (checkmarks, added lines) */
  success: string;
  /** Error/danger */
  error: string;
  /** Warning */
  warning: string;
  /** Info */
  info: string;
  /** Lines added (green) */
  diffAdded: string;
  /** Lines removed (red) */
  diffRemoved: string;
  /** Diff added background */
  diffAddedBg: string;
  /** Diff removed background */
  diffRemovedBg: string;

  // ═══════════════════════════════════════════
  // COLORS — Borders
  // ═══════════════════════════════════════════
  /** Default border color */
  border: string;
  /** Request message border */
  borderRequest: string;
  /** Input area border */
  borderInput: string;
  /** Input area border when focused */
  borderInputFocus: string;
  /** Input border animation color 1 (streaming state) */
  borderInputActive1: string;
  /** Input border animation color 2 */
  borderInputActive2: string;
  /** Code block border */
  borderCode: string;
  /** Card/confirmation border */
  borderCard: string;
  /** Separator lines */
  borderSeparator: string;
  /** Checkpoint separator */
  borderCheckpoint: string;

  // ═══════════════════════════════════════════
  // COLORS — Interactive
  // ═══════════════════════════════════════════
  /** Primary button background */
  buttonPrimaryBg: string;
  /** Primary button text */
  buttonPrimaryFg: string;
  /** Secondary button background */
  buttonSecondaryBg: string;
  /** Secondary button text */
  buttonSecondaryFg: string;
  /** Button hover overlay */
  buttonHoverOverlay: string;
  /** Followup button background */
  bgFollowup: string;
  /** Followup button text */
  fgFollowup: string;

  // ═══════════════════════════════════════════
  // COLORS — Special
  // ═══════════════════════════════════════════
  /** Shimmer animation highlight */
  shimmer: string;
  /** Shimmer base */
  shimmerBase: string;
  /** Find match highlight */
  findMatchHighlight: string;
  /** Slash command background */
  bgSlashCommand: string;
  /** Slash command text */
  fgSlashCommand: string;
  /** Edit pill filename foreground */
  fgEditedFile: string;
  /** Selection highlight */
  bgSelection: string;

  // ═══════════════════════════════════════════
  // COLORS — Risk Levels
  // ═══════════════════════════════════════════
  riskLow: string;
  riskMedium: string;
  riskHigh: string;

  // ═══════════════════════════════════════════
  // COLORS — Todo Status
  // ═══════════════════════════════════════════
  todoCompleted: string;
  todoInProgress: string;
  todoNotStarted: string;

  // ═══════════════════════════════════════════
  // SPACING
  // ═══════════════════════════════════════════
  /** 2px */
  spaceXxs: string;
  /** 4px */
  spaceXs: string;
  /** 6px */
  spaceSm: string;
  /** 8px */
  spaceMd: string;
  /** 12px */
  spaceLg: string;
  /** 16px */
  spaceXl: string;
  /** 24px */
  spaceXxl: string;
  /** 36px */
  space3xl: string;

  // ═══════════════════════════════════════════
  // TYPOGRAPHY
  // ═══════════════════════════════════════════
  /** Base font family */
  fontFamily: string;
  /** Monospace font family */
  fontFamilyMono: string;
  /** Base font size */
  fontSizeBase: string;
  /** Extra small (11px) */
  fontSizeXs: string;
  /** Small (12px) */
  fontSizeSm: string;
  /** Medium — body (13px) */
  fontSizeMd: string;
  /** Large (14px) */
  fontSizeLg: string;
  /** Extra large (16px) */
  fontSizeXl: string;
  /** Double extra large (20px) */
  fontSizeXxl: string;
  /** Line height for body text */
  lineHeight: string;
  /** Line height for code */
  lineHeightCode: string;
  /** Username font weight */
  fontWeightBold: string;

  // ═══════════════════════════════════════════
  // RADII
  // ═══════════════════════════════════════════
  /** Small radius (code blocks, badges) */
  radiusSm: string;
  /** Medium radius (cards, inputs) */
  radiusMd: string;
  /** Large radius (containers) */
  radiusLg: string;
  /** Circle (avatars) */
  radiusCircle: string;

  // ═══════════════════════════════════════════
  // SIZES
  // ═══════════════════════════════════════════
  /** Avatar size */
  avatarSize: string;
  /** Icon size (default 16px) */
  iconSize: string;
  /** Small icon size (14px) */
  iconSizeSm: string;
  /** Border width */
  strokeWidth: string;
  /** Input control height (buttons, pickers) */
  controlHeight: string;
  /** Todo item row height */
  todoRowHeight: string;
  /** File list row height */
  fileRowHeight: string;

  // ═══════════════════════════════════════════
  // SHADOWS
  // ═══════════════════════════════════════════
  /** Card/dialog shadow */
  shadowCard: string;
  /** Tooltip shadow */
  shadowTooltip: string;
  /** Dropdown shadow */
  shadowDropdown: string;

  // ═══════════════════════════════════════════
  // TRANSITIONS
  // ═══════════════════════════════════════════
  /** Default transition duration */
  transitionFast: string;
  /** Medium transition */
  transitionMedium: string;
  /** Slow transition */
  transitionSlow: string;
}
```

---

## 2.2 `dark.ts` — VS Code Dark Theme Preset

```typescript
import type { AgentChatTheme } from './tokens';

export const darkTheme: AgentChatTheme = {
  // Backgrounds
  bgPrimary: '#1e1e1e',
  bgList: '#1e1e1e',
  bgRequest: 'rgba(30, 30, 30, 0.62)',
  bgResponse: 'transparent',
  bgInput: '#2d2d2d',
  bgInputFocus: '#2d2d2d',
  bgCode: '#1e1e1e',
  bgHover: 'rgba(255, 255, 255, 0.05)',
  bgStatus: 'rgba(204, 204, 204, 0.08)',
  bgAvatar: '#1f1f1f',
  bgCard: '#252526',
  bgTooltip: '#2d2d30',
  bgThinking: 'rgba(255, 255, 255, 0.03)',
  bgTerminal: '#1a1a1a',

  // Foregrounds
  fgPrimary: '#cccccc',
  fgSecondary: '#999999',
  fgTertiary: '#6b6b6b',
  fgLink: '#4daafc',
  fgAvatar: '#cccccc',
  fgIcon: '#c5c5c5',
  fgIconHover: '#ffffff',
  fgPlaceholder: '#6b6b6b',

  // Semantic
  success: '#3fb950',
  error: '#f85149',
  warning: '#d29922',
  info: '#4daafc',
  diffAdded: '#3fb950',
  diffRemoved: '#f85149',
  diffAddedBg: 'rgba(63, 185, 80, 0.15)',
  diffRemovedBg: 'rgba(248, 81, 73, 0.15)',

  // Borders
  border: 'rgba(255, 255, 255, 0.08)',
  borderRequest: 'rgba(255, 255, 255, 0.10)',
  borderInput: 'rgba(255, 255, 255, 0.12)',
  borderInputFocus: '#0078d4',
  borderInputActive1: '#0078d4',
  borderInputActive2: '#4daafc',
  borderCode: 'rgba(255, 255, 255, 0.08)',
  borderCard: 'rgba(255, 255, 255, 0.10)',
  borderSeparator: 'rgba(255, 255, 255, 0.08)',
  borderCheckpoint: 'rgba(255, 255, 255, 0.10)',

  // Interactive
  buttonPrimaryBg: '#0078d4',
  buttonPrimaryFg: '#ffffff',
  buttonSecondaryBg: 'rgba(255, 255, 255, 0.08)',
  buttonSecondaryFg: '#cccccc',
  buttonHoverOverlay: 'rgba(255, 255, 255, 0.05)',
  bgFollowup: 'rgba(255, 255, 255, 0.06)',
  fgFollowup: '#cccccc',

  // Special
  shimmer: 'rgba(255, 255, 255, 0.12)',
  shimmerBase: 'transparent',
  findMatchHighlight: 'rgba(234, 92, 0, 0.33)',
  bgSlashCommand: 'rgba(255, 255, 255, 0.12)',
  fgSlashCommand: '#cccccc',
  fgEditedFile: '#4daafc',
  bgSelection: 'rgba(0, 120, 212, 0.3)',

  // Risk
  riskLow: '#3fb950',
  riskMedium: '#d29922',
  riskHigh: '#f85149',

  // Todo
  todoCompleted: '#3fb950',
  todoInProgress: '#4daafc',
  todoNotStarted: '#6b6b6b',

  // Spacing
  spaceXxs: '2px',
  spaceXs: '4px',
  spaceSm: '6px',
  spaceMd: '8px',
  spaceLg: '12px',
  spaceXl: '16px',
  spaceXxl: '24px',
  space3xl: '36px',

  // Typography
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
  fontFamilyMono: "'SF Mono', Monaco, Menlo, Consolas, 'Ubuntu Mono', 'Liberation Mono', 'DejaVu Sans Mono', 'Courier New', monospace",
  fontSizeBase: '13px',
  fontSizeXs: '0.846em',
  fontSizeSm: '0.923em',
  fontSizeMd: '1em',
  fontSizeLg: '1.077em',
  fontSizeXl: '1.231em',
  fontSizeXxl: '1.538em',
  lineHeight: '1.4',
  lineHeightCode: '1.5',
  fontWeightBold: '600',

  // Radii
  radiusSm: '4px',
  radiusMd: '6px',
  radiusLg: '8px',
  radiusCircle: '50%',

  // Sizes
  avatarSize: '24px',
  iconSize: '16px',
  iconSizeSm: '14px',
  strokeWidth: '1px',
  controlHeight: '22px',
  todoRowHeight: '22px',
  fileRowHeight: '22px',

  // Shadows
  shadowCard: '0 2px 8px rgba(0, 0, 0, 0.4)',
  shadowTooltip: '0 2px 4px rgba(0, 0, 0, 0.5)',
  shadowDropdown: '0 4px 12px rgba(0, 0, 0, 0.5)',

  // Transitions
  transitionFast: '100ms ease',
  transitionMedium: '200ms ease',
  transitionSlow: '300ms ease',
};
```

---

## 2.3 `light.ts` — VS Code Light Theme Preset

```typescript
import type { AgentChatTheme } from './tokens';
import { darkTheme } from './dark';

export const lightTheme: AgentChatTheme = {
  ...darkTheme, // start from dark as base, override differences

  // Backgrounds
  bgPrimary: '#ffffff',
  bgList: '#ffffff',
  bgRequest: 'rgba(255, 255, 255, 0.62)',
  bgInput: '#f3f3f3',
  bgInputFocus: '#ffffff',
  bgCode: '#f5f5f5',
  bgHover: 'rgba(0, 0, 0, 0.04)',
  bgStatus: 'rgba(0, 0, 0, 0.06)',
  bgAvatar: '#f2f2f2',
  bgCard: '#f8f8f8',
  bgTooltip: '#f2f2f2',
  bgThinking: 'rgba(0, 0, 0, 0.02)',
  bgTerminal: '#f5f5f5',

  // Foregrounds
  fgPrimary: '#333333',
  fgSecondary: '#616161',
  fgTertiary: '#999999',
  fgLink: '#006ab1',
  fgAvatar: '#333333',
  fgIcon: '#424242',
  fgIconHover: '#000000',
  fgPlaceholder: '#999999',

  // Semantic
  success: '#22863a',
  error: '#cb2431',
  warning: '#b08800',
  info: '#006ab1',
  diffAdded: '#22863a',
  diffRemoved: '#cb2431',
  diffAddedBg: 'rgba(34, 134, 58, 0.10)',
  diffRemovedBg: 'rgba(203, 36, 49, 0.10)',

  // Borders
  border: 'rgba(0, 0, 0, 0.08)',
  borderRequest: 'rgba(0, 0, 0, 0.10)',
  borderInput: 'rgba(0, 0, 0, 0.12)',
  borderCode: 'rgba(0, 0, 0, 0.08)',
  borderCard: 'rgba(0, 0, 0, 0.10)',
  borderSeparator: 'rgba(0, 0, 0, 0.08)',
  borderCheckpoint: 'rgba(0, 0, 0, 0.10)',

  // Interactive
  buttonSecondaryBg: 'rgba(0, 0, 0, 0.06)',
  buttonSecondaryFg: '#333333',
  buttonHoverOverlay: 'rgba(0, 0, 0, 0.04)',
  bgFollowup: 'rgba(0, 0, 0, 0.04)',
  fgFollowup: '#333333',

  // Special
  shimmer: 'rgba(0, 0, 0, 0.08)',
  bgSlashCommand: 'rgba(0, 0, 0, 0.06)',
  fgSlashCommand: '#333333',
  fgEditedFile: '#006ab1',
  bgSelection: 'rgba(0, 120, 212, 0.15)',

  // Risk
  riskLow: '#22863a',
  riskMedium: '#b08800',
  riskHigh: '#cb2431',

  // Todo
  todoCompleted: '#22863a',
  todoInProgress: '#006ab1',
  todoNotStarted: '#999999',

  // Shadows
  shadowCard: '0 2px 8px rgba(0, 0, 0, 0.12)',
  shadowTooltip: '0 2px 4px rgba(0, 0, 0, 0.15)',
  shadowDropdown: '0 4px 12px rgba(0, 0, 0, 0.15)',
};
```

---

## 2.4 `ThemeProvider.tsx` — CSS Variable Injection

```typescript
/**
 * ThemeProvider converts the AgentChatTheme object into CSS custom properties
 * and injects them into a wrapper <div> element.
 *
 * All CSS files reference `var(--ac-*)` variables.
 */
interface ThemeProviderProps {
  theme: AgentChatTheme;
  children: React.ReactNode;
}

// Maps theme keys to CSS variable names
// e.g., bgPrimary → --ac-bg-primary
// Conversion: camelCase → kebab-case with --ac- prefix
```

### CSS Variable Naming Convention

```
Theme Key:        bgPrimary
CSS Variable:     --ac-bg-primary
Usage in CSS:     background: var(--ac-bg-primary);
```

All theme tokens are prefixed with `--ac-` (agent-chat) to avoid conflicts.

---

## 2.5 CSS Architecture

### Layered Imports

```css
/* src/theme/css/index.css — single entry point */
@import './reset.css';
@import './tokens.css';
@import './base.css';
@import './atoms.css';
@import './content-parts.css';
@import './messages.css';
@import './input.css';
```

### `reset.css` — Minimal Reset

Scoped to `.ac-root` container. Resets box-sizing, margins, font inheritance.

### `tokens.css` — Fallback Variable Declarations

```css
.ac-root {
  /* Fallback values if ThemeProvider is not used */
  --ac-bg-primary: #1e1e1e;
  --ac-fg-primary: #cccccc;
  /* ... all tokens with dark theme defaults ... */
}
```

### `base.css` — Shared Base Styles

```css
/* Container */
.ac-root {
  font-family: var(--ac-font-family);
  font-size: var(--ac-font-size-base);
  line-height: var(--ac-line-height);
  color: var(--ac-fg-primary);
  background: var(--ac-bg-primary);
}

.ac-chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: var(--ac-max-width, 950px);
  margin: 0 auto;
}

/* Scrollable area */
.ac-message-list {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Markdown base */
.ac-markdown { /* ... */ }
.ac-markdown p { margin: 0 0 var(--ac-space-md); }
.ac-markdown code { /* inline code */ }
.ac-markdown pre { /* code blocks handled by CodeBlock component */ }
.ac-markdown table { /* scrollable table wrapper */ }
.ac-markdown a { color: var(--ac-fg-link); }
```

---

## 2.6 Key CSS Patterns (from VS Code)

### Shimmer Animation

```css
@keyframes ac-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.ac-shimmer {
  background: linear-gradient(
    90deg,
    var(--ac-shimmer-base) 25%,
    var(--ac-shimmer) 50%,
    var(--ac-shimmer-base) 75%
  );
  background-size: 200% 100%;
  animation: ac-shimmer 2s infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### Animated Input Border (Streaming)

```css
@keyframes ac-input-border-pulse {
  0%, 100% { border-color: var(--ac-border-input-active1); }
  50% { border-color: var(--ac-border-input-active2); }
}

.ac-input--streaming {
  animation: ac-input-border-pulse 2s ease infinite;
}
```

### Typing Dots

```css
@keyframes ac-dot-pulse {
  0%, 80%, 100% { opacity: 0; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
}

.ac-dot { animation: ac-dot-pulse 1.4s infinite; }
.ac-dot:nth-child(2) { animation-delay: 0.2s; }
.ac-dot:nth-child(3) { animation-delay: 0.4s; }
```

### Collapsible Section (Animated)

```css
.ac-collapsible {
  interpolate-size: allow-keywords;
}
.ac-collapsible__body {
  overflow: hidden;
  height: 0;
  transition: height var(--ac-transition-medium);
}
.ac-collapsible--open .ac-collapsible__body {
  height: auto;
}
```

### Hover-Reveal Toolbar

```css
.ac-message-row .ac-header-toolbar {
  opacity: 0;
  transition: opacity var(--ac-transition-fast);
}
.ac-message-row:hover .ac-header-toolbar,
.ac-message-row:focus-within .ac-header-toolbar {
  opacity: 1;
}
```

---

## 2.7 CSS Class Naming Convention

**BEM-inspired with `ac-` prefix:**

```
.ac-{block}
.ac-{block}__{element}
.ac-{block}--{modifier}
```

Examples:
```
.ac-message-row
.ac-message-row__header
.ac-message-row--request
.ac-message-row--response
.ac-message-row--streaming

.ac-code-block
.ac-code-block__toolbar
.ac-code-block__content
.ac-code-block--with-filename

.ac-thinking
.ac-thinking__title
.ac-thinking__body
.ac-thinking--active
.ac-thinking--collapsed
```
