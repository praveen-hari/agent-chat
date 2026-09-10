---
description: "Use when creating git commits. Enforces conventional commit messages, changeset requirements for public API changes, and pre-commit quality gate compliance."
applyTo: "**"
---

# Commit Standards

## Conventional Commits

All commit messages follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | When to use |
|------|-------------|
| `feat` | New component, new content part kind, new prop, new hook |
| `fix` | Bug fix, style fix, render fix |
| `test` | Adding or updating tests only |
| `refactor` | Code restructuring without behavior change |
| `style` | CSS changes, formatting only |
| `docs` | Documentation, README, spec changes |
| `chore` | Build config, CI, dependency updates |
| `perf` | Performance improvement |
| `a11y` | Accessibility improvement |

### Scopes

Use the component or module name:

```
feat(CodeBlock): add copy-to-clipboard button
fix(ThinkingBlock): stop shimmer after streaming completes
test(builders): add buildTerminalCommand builder
refactor(ContentPartRenderer): extract tool dispatch logic
style(Avatar): adjust outline border radius
docs(README): add quick start guide
chore(deps): update shiki to v3.3.0
```

## Pre-Commit Requirements

Before EVERY commit, ALL quality gates MUST pass:

```bash
npm run typecheck && npm run lint && npm run format:check && npm run test:run
```

- **Never** use `--no-verify` to bypass hooks.
- **Never** use `--no-gpg-sign` if the user has signing enabled.
- Let pre-commit and commit-msg hooks run.

## Changeset Requirements

When the change affects the **public API** (new export, changed prop, new content part kind):

1. Create a changeset describing the change
2. Specify the semver bump:
   - **patch**: bug fixes, style fixes
   - **minor**: new components, new content part kinds, new props
   - **major**: removed exports, renamed props, changed type signatures

Changes that do NOT affect public API (tests, docs, internal refactors) do not need a changeset.

## Commit Granularity

- **One logical change per commit** — don't mix a bug fix with a new feature.
- **Component + test in same commit** — never commit a component without its tests.
- **Type change + all affected files** — if you change a type, include all files that needed updating.

## Do NOT

- Do not commit generated files (dist/, coverage/).
- Do not commit with failing tests.
- Do not commit `console.log` statements.
- Do not commit TODO comments without a linked issue.
- Do not amend or force-push shared branches.
