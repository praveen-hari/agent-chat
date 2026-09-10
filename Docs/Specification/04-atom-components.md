# Phase 4: Atom Components

## Files

All in `src/components/atoms/`

---

## 4.1 `Avatar.tsx`

Displays a user or agent avatar as a rounded icon/image/initials circle.

```typescript
interface AvatarProps {
  /** Emoji string, URL, or icon identifier */
  icon: string | { src: string } | { iconId: string };
  /** Display name (used for initials fallback and alt text) */
  name?: string;
  /** Size in pixels (default: 24) */
  size?: number;
  /** Whether to show outline border */
  outline?: boolean;
  /** Additional CSS class */
  className?: string;
}
```

**Rendering logic:**
- If `icon` is a string of 1-2 chars → render as emoji text
- If `icon` is `{ src: string }` → render as `<img>` with fallback to initials
- If `icon` is `{ iconId: string }` → render corresponding SVG icon
- Falls back to first letter of `name` in a colored circle

**CSS:** `.ac-avatar`, `.ac-avatar--outline`, `.ac-avatar__img`, `.ac-avatar__initials`

**Size:** `var(--ac-avatar-size)` (default 24px), circular via `border-radius: var(--ac-radius-circle)`

---

## 4.2 `Username.tsx`

Displays a username with appropriate heading style.

```typescript
interface UsernameProps {
  /** Display name */
  name: string;
  /** Visual variant */
  variant?: 'default' | 'compact';
  /** Additional CSS class */
  className?: string;
}
```

**CSS:** `.ac-username` — `font-weight: var(--ac-font-weight-bold)`, `font-size: var(--ac-font-size-md)`, renders as `<span>` (not `<h3>` — no semantic heading needed in a list)

---

## 4.3 `Timestamp.tsx`

Displays relative or absolute time with live updates.

```typescript
interface TimestampProps {
  /** Unix timestamp in milliseconds */
  time: number;
  /** Display format (default: 'relative') */
  format?: 'relative' | 'absolute' | 'both';
  /** Additional CSS class */
  className?: string;
}
```

**Behavior:**
- Uses `useRelativeTime(time)` hook for live "2m ago" → "1h ago" updates
- Tooltip shows absolute time on hover
- Updates every 30s for recent, every 60s for older

**CSS:** `.ac-timestamp` — `color: var(--ac-fg-tertiary)`, `font-size: var(--ac-font-size-xs)`

---

## 4.4 `ShimmerText.tsx`

Text with animated shimmer gradient effect. Used in thinking titles and progress messages.

```typescript
interface ShimmerTextProps {
  /** Text content */
  text: string;
  /** Whether shimmer is active (default: true) */
  active?: boolean;
  /** Shimmer mode: 'full' shimmers all text, 'partial' only shimmers the leading verb */
  mode?: 'full' | 'partial';
  /** Additional CSS class */
  className?: string;
}
```

**CSS:**
```css
.ac-shimmer-text {
  background: linear-gradient(90deg,
    var(--ac-fg-primary) 25%,
    var(--ac-shimmer) 50%,
    var(--ac-fg-primary) 75%
  );
  background-size: 200% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ac-shimmer 2s infinite;
}
```

For `mode: 'partial'`:
- Splits text into first word (shimmer) + rest (static)
- Only the first word gets the gradient animation

---

## 4.5 `AnimatedDots.tsx`

Three-dot typing indicator (pulsing animation).

```typescript
interface AnimatedDotsProps {
  /** Number of dots (default: 3) */
  count?: number;
  /** Additional CSS class */
  className?: string;
}
```

**CSS:** Each dot staggers with 0.2s delay per dot. Uses `ac-dot-pulse` keyframes.

---

## 4.6 `PixelSpinner.tsx`

Small pixel-art-style loading spinner. Matches VS Code's `createPixelSpinner()`.

```typescript
interface PixelSpinnerProps {
  /** Size in pixels (default: 14) */
  size?: number;
  /** Additional CSS class */
  className?: string;
}
```

**Rendering:** A small rotating square animation, thematically matching VS Code's pixel spinner used for MCP servers and tool progress.

---

## 4.7 `IconButton.tsx`

Toolbar-style action button with icon, optional label, and tooltip.

```typescript
interface IconButtonProps {
  /** Icon identifier or emoji */
  icon: string;
  /** Accessible label (also used as tooltip) */
  label: string;
  /** Click handler */
  onClick: () => void;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Visual variant */
  variant?: 'default' | 'primary' | 'danger';
  /** Size */
  size?: 'small' | 'medium';
  /** Whether to show the label text alongside icon */
  showLabel?: boolean;
  /** Keyboard shortcut hint */
  keybinding?: string;
  /** Additional CSS class */
  className?: string;
}
```

**CSS:** `.ac-icon-button` — transparent background, hover shows `var(--ac-bg-hover)`, `border-radius: var(--ac-radius-sm)`, `padding: var(--ac-space-xs)`

---

## 4.8 `Chip.tsx`

Pill/tag element for attachments, references, and labels.

```typescript
interface ChipProps {
  /** Display label */
  label: string;
  /** Icon (emoji or identifier) */
  icon?: string;
  /** Variant */
  variant?: 'default' | 'file' | 'image' | 'tool' | 'terminal' | 'error';
  /** Whether removable (shows × button) */
  removable?: boolean;
  /** Remove handler */
  onRemove?: () => void;
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS class */
  className?: string;
}
```

**CSS:** `.ac-chip` — `display: inline-flex`, `align-items: center`, `gap: var(--ac-space-xs)`, `padding: 2px 8px`, `border-radius: var(--ac-radius-sm)`, `background: var(--ac-bg-status)`, `font-size: var(--ac-font-size-xs)`

---

## 4.9 `Badge.tsx`

Notification-style count badge.

```typescript
interface BadgeProps {
  /** Count to display */
  count?: number;
  /** Text to display (alternative to count) */
  text?: string;
  /** Color variant */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  /** Additional CSS class */
  className?: string;
}
```

**CSS:** `.ac-badge` — small rounded pill, uses semantic color based on variant

---

## 4.10 `CollapsibleSection.tsx`

Animated expand/collapse panel. Core building block for thinking, references, file lists.

```typescript
interface CollapsibleSectionProps {
  /** Section header title */
  title: string;
  /** Icon in header */
  icon?: string;
  /** Count badge in header */
  count?: number;
  /** Whether expanded by default */
  defaultExpanded?: boolean;
  /** Controlled expanded state */
  expanded?: boolean;
  /** Expand/collapse change handler */
  onToggle?: (expanded: boolean) => void;
  /** Whether the section is in a "complete" state (shows checkmark) */
  isComplete?: boolean;
  /** Whether the section is actively loading */
  isLoading?: boolean;
  /** Subtitle text */
  subtitle?: string;
  /** Header toolbar actions */
  actions?: React.ReactNode;
  /** Children (body content) */
  children: React.ReactNode;
  /** Additional CSS class */
  className?: string;
}
```

**Behavior:**
- Uses `<details>` / `<summary>` for native accessibility
- Animated with `interpolate-size: allow-keywords` (CSS)
- Chevron icon rotates on expand
- When `isLoading`: shows spinner icon instead of chevron
- When `isComplete`: shows checkmark icon

**CSS:**
```css
.ac-collapsible { /* container */ }
.ac-collapsible__header { /* summary row */ }
.ac-collapsible__chevron { /* rotation animation */ }
.ac-collapsible__body { /* overflow: hidden + height transition */ }
.ac-collapsible--open { /* expanded state */ }
.ac-collapsible--complete { /* checkmark icon */ }
.ac-collapsible--loading { /* spinner icon */ }
```

---

## 4.11 `RiskBadge.tsx`

Risk level indicator for tool confirmations.

```typescript
interface RiskBadgeProps {
  /** Risk level */
  level: 'low' | 'medium' | 'high' | 'assessing';
  /** Whether to show detail text */
  showText?: boolean;
  /** Additional detail on hover */
  detail?: string;
  /** Additional CSS class */
  className?: string;
}
```

**Rendering:**
| Level | Icon | Color | Text |
|-------|------|-------|------|
| `assessing` | Spinner | muted | "Assessing risk..." |
| `low` | ✓ (check) | `var(--ac-risk-low)` green | "Low risk" |
| `medium` | ⚠ (warning) | `var(--ac-risk-medium)` orange | "Medium risk" |
| `high` | ✕ (error) | `var(--ac-risk-high)` red | "High risk" |

**CSS:** `.ac-risk-badge`, `.ac-risk-badge--low`, `.ac-risk-badge--medium`, `.ac-risk-badge--high`, `.ac-risk-badge--assessing`

---

## 4.12 `StatusIcon.tsx`

Reusable status indicator icon used across multiple components.

```typescript
interface StatusIconProps {
  /** Status to display */
  status: 'running' | 'complete' | 'failed' | 'cancelled' | 'pending' | 'warning' | 'info';
  /** Size (default: 16) */
  size?: number;
  /** Whether to animate (spin) */
  animate?: boolean;
  /** Additional CSS class */
  className?: string;
}
```

**Icon mapping:**
| Status | Icon | Color | Animated |
|--------|------|-------|----------|
| `running` | Spinner | `var(--ac-fg-icon)` | Yes (spin) |
| `complete` | ✓ Check | `var(--ac-success)` | No |
| `failed` | ✕ Error | `var(--ac-error)` | No |
| `cancelled` | ○ Circle | `var(--ac-fg-tertiary)` | No |
| `pending` | ○ Circle outline | `var(--ac-fg-tertiary)` | No |
| `warning` | ⚠ Warning | `var(--ac-warning)` | No |
| `info` | ℹ Info | `var(--ac-info)` | No |

Used in: ProgressStep, ToolCallDisplay, TodoList, ThinkingBlock
