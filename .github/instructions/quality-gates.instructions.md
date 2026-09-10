---
description: "Use when writing, editing, or reviewing any source code. Enforces mandatory quality gates that must pass before any code is committed. Covers typecheck, lint, format, test, and bundle size checks."
applyTo: "src/**"
---

# Quality Gates

Every code change MUST pass all quality gates before being committed. No exceptions.

## Mandatory Pre-Commit Checks

Run these checks in order. ALL must pass — a failure in any gate blocks the commit.

1. **TypeScript Typecheck** — `npm run typecheck` (zero errors)
2. **ESLint** — `npm run lint` (zero errors, zero warnings treated as errors in CI)
3. **Prettier** — `npm run format:check` (all files formatted)
4. **Tests** — `npm run test:run` (all tests pass)
5. **Build** — `npm run build` (clean build with no errors)

## Rules

### Zero Tolerance
- **No `any` types** — use proper types or generics. `unknown` only when truly necessary with type narrowing.
- **No `@ts-ignore` or `@ts-expect-error`** — fix the root cause.
- **No `eslint-disable`** without a comment explaining why.
- **No skipping tests** — do not use `.skip` or comment out tests.
- **No `console.log`** in production code — use `console.warn` or `console.error` only for genuine warnings.

### After Every Edit
After editing or creating files, verify your changes compile:
- Run `npm run typecheck` for type errors.
- Run `npm run test:run` to ensure no test regressions.
- If you create a new component, there MUST be a corresponding `.test.tsx` file.

### Before Committing
- Run the full gate: `npm run typecheck && npm run lint && npm run format:check && npm run test:run && npm run build`
- Never commit with `--no-verify`.
- If a test fails, fix the code — never fix the test to match broken behavior.

### Coverage Requirements
- **Statements**: ≥ 90%
- **Branches**: ≥ 85%
- **Functions**: ≥ 90%
- **Lines**: ≥ 90%
- Run `npm run test:ci` to verify coverage thresholds.
- New files MUST have tests that meet these thresholds.

### Bundle Size
- Run `npm run size` to check bundle size stays within budget.
- Total library (gzip): ≤ 120 KB
- CSS bundle (gzip): ≤ 15 KB
