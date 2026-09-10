---
description: "Use when creating or modifying any TypeScript or React component. Enforces test-driven development: write tests first or alongside code, co-located test files, builder pattern for test data, and coverage requirements."
applyTo: "src/**/*.{ts,tsx}"
---

# Test-Driven Development

All code changes follow TDD. Tests are not an afterthought — they drive the design.

## Workflow

1. **Write the test first** (or simultaneously with the implementation)
2. **See it fail** — verify the test catches the right thing
3. **Write minimal code** to make it pass
4. **Refactor** — clean up while tests stay green
5. **Verify** — run `npm run test:run` before moving on

## File Structure

Tests are **co-located** next to the code they test:

```
src/components/atoms/
├── Avatar.tsx           ← Component
├── Avatar.test.tsx      ← Unit tests (co-located)
└── Avatar.stories.tsx   ← Storybook story (future)
```

Exception: integration tests go in `src/__tests__/`.

## Naming Conventions

- Test files: `{Component}.test.tsx` or `{module}.test.ts`
- Use `describe` blocks matching the component/module name
- Use `test` (not `it`) for individual test cases
- Test names describe **behavior**, not implementation:
  ```typescript
  // ✅ Good — describes behavior
  test('renders emoji icon when icon is a string', () => {})
  test('fires onCopy callback when copy button is clicked', () => {})
  test('shows shimmer animation when isStreaming is true', () => {})

  // ❌ Bad — describes implementation
  test('calls setState', () => {})
  test('renders div with class', () => {})
  ```

## Test Data Builders

Always use builders from `src/test-utils/builders.ts`:

```typescript
// ✅ Good — use builders
const session = buildSession({ title: 'Test' });
const response = buildResponse({ state: 'streaming' });
const toolCall = buildToolCall({ toolId: 'search', status: 'running' });

// ❌ Bad — inline object literals
const session = { id: '1', messages: [], createdAt: 123 };
```

- Add new builders to `builders.ts` when introducing new types.
- Call `resetIdCounter()` in `beforeEach` for deterministic IDs.

## Custom Render

Always use `renderWithChat()` for components that depend on context:

```typescript
import { renderWithChat } from '../../test-utils/render';

test('renders response with agent name', () => {
  renderWithChat(<ResponseRow response={buildResponse()} isLast />, {
    session: buildSimpleConversation(),
    callbacks: { onVote: vi.fn() },
  });
});
```

## What to Test

Every component test file MUST cover:

| Aspect | Example |
|--------|---------|
| **Renders** | Component renders without crashing with minimal props |
| **Props** | Each prop produces the expected visual output |
| **States** | Loading, active, complete, error, collapsed, expanded |
| **Interactions** | Click, keyboard, hover fire the correct callbacks |
| **Accessibility** | ARIA roles, labels, and keyboard navigation work |
| **Edge cases** | Empty arrays, undefined optional props, very long text |
| **Memoization** | `React.memo` prevents unnecessary re-renders |

## What NOT to Test

- Implementation details (internal state, private methods)
- Third-party library internals (react-markdown, shiki)
- CSS class names in isolation (test behavior, not class presence)

## Hooks Testing

Use `renderHook` from `@testing-library/react`:

```typescript
import { renderHook, act } from '@testing-library/react';

test('returns relative time string', () => {
  const { result } = renderHook(() => useRelativeTime(Date.now() - 120000));
  expect(result.current).toBe('2m ago');
});
```

## Coverage Enforcement

- **Minimum**: 90% statements, 85% branches, 90% functions, 90% lines
- New files must meet thresholds independently
- Run `npm run test:ci` to check coverage
- Never lower coverage thresholds to make CI pass
