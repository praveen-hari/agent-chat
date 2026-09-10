# Phase 12: CI/CD, Release & Maintenance

## Overview

Automated pipelines for quality gates, publishing, and long-term maintenance of `@agent-chat/react`.

---

## 12.1 CI/CD Pipeline

### Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions CI/CD                       │
│                                                              │
│  On Push/PR to main:                                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │  Lint &   │  │  Unit    │  │  Build   │  │  Visual    │  │
│  │  Typecheck│→ │  Tests   │→ │  Check   │→ │  Snapshot  │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │
│        │             │             │              │          │
│        ▼             ▼             ▼              ▼          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │  Bundle  │  │  A11y    │  │  E2E     │  │  Bundle    │  │
│  │  Size    │  │  Audit   │  │  Tests   │  │  Analyze   │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │
│                                                              │
│  On Tag (v*):                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │  All CI  │→ │  Build   │→ │  Publish  │→ │  Release   │  │
│  │  Checks  │  │  Package │  │  npm      │  │  Notes     │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  # ─── Quality Gates ───
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint

  unit-tests:
    runs-on: ubuntu-latest
    needs: lint-and-typecheck
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run test:ci
      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: coverage/lcov.info
          fail_ci_if_error: true

  build:
    runs-on: ubuntu-latest
    needs: lint-and-typecheck
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/

  bundle-size:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - name: Check bundle size
        uses: andresz1/size-limit-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          # Defined in .size-limit.json

  accessibility-audit:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run test:a11y

  visual-snapshots:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build-storybook
      - name: Run Chromatic
        uses: chromaui/action@latest
        with:
          projectToken: ${{ secrets.CHROMATIC_TOKEN }}
          buildScriptName: build-storybook

  e2e-tests:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run build
      - run: npm run test:e2e
```

```yaml
# .github/workflows/publish.yml
name: Publish

on:
  push:
    tags: ['v*']

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm run test:ci
      - run: npm run build
      - run: npm publish --provenance --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          generate_release_notes: true
```

---

## 12.2 Package Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src/ --ext .ts,.tsx",
    "lint:fix": "eslint src/ --ext .ts,.tsx --fix",

    "test": "vitest",
    "test:ci": "vitest run --coverage",
    "test:watch": "vitest --watch",
    "test:a11y": "vitest run --grep 'Accessibility'",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",

    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",

    "size": "size-limit",
    "analyze": "npx vite-bundle-visualizer",

    "clean": "rm -rf dist coverage storybook-static",
    "prepublishOnly": "npm run clean && npm run build",

    "release:patch": "npm version patch && git push --follow-tags",
    "release:minor": "npm version minor && git push --follow-tags",
    "release:major": "npm version major && git push --follow-tags",

    "changeset": "changeset",
    "changeset:version": "changeset version",
    "changeset:publish": "changeset publish"
  }
}
```

---

## 12.3 Bundle Size Budget

```json
// .size-limit.json
[
  {
    "name": "Full library (ESM)",
    "path": "dist/index.es.js",
    "limit": "120 KB",
    "gzip": true
  },
  {
    "name": "CSS bundle",
    "path": "dist/styles.css",
    "limit": "15 KB",
    "gzip": true
  },
  {
    "name": "Core only (AgentChat + Provider)",
    "path": "dist/index.es.js",
    "import": "{ AgentChat, ChatProvider }",
    "limit": "45 KB",
    "gzip": true
  },
  {
    "name": "Types only",
    "path": "dist/index.es.js",
    "import": "{ }",
    "limit": "0 KB"
  }
]
```

**Budget rationale:**
| Component | Est. Size (gzip) |
|-----------|-----------------|
| React core components | ~25 KB |
| react-markdown + plugins | ~35 KB |
| shiki (syntax highlighting) | ~40 KB |
| react-virtuoso | ~12 KB |
| CSS | ~10 KB |
| **Total** | **~120 KB** |

---

## 12.4 Code Quality Tools

### ESLint Configuration

```json
// eslint.config.js (flat config)
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended"
  ],
  "rules": {
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "jsx-a11y/no-autofocus": "warn",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

### Key ESLint Plugins

| Plugin | Purpose |
|--------|---------|
| `@typescript-eslint` | TypeScript-specific rules |
| `eslint-plugin-react` | React best practices |
| `eslint-plugin-react-hooks` | Hook rules (deps, order) |
| `eslint-plugin-jsx-a11y` | Accessibility rules (ARIA, roles) |
| `eslint-plugin-import` | Import order & cycle detection |

### Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

---

## 12.5 Versioning & Changelog

### Semantic Versioning Policy

| Change Type | Version Bump | Examples |
|-------------|-------------|---------|
| **Breaking** — removed/renamed prop, changed type signature | **Major** | Rename `ChatSession.messages` → `ChatSession.turns` |
| **Feature** — new component, new content part kind, new prop | **Minor** | Add `<PlanReviewCard>`, add `kind: 'plan-review'` |
| **Fix** — bug fix, style fix, performance improvement | **Patch** | Fix shimmer not stopping, fix scroll lock |
| **Chore** — docs, tests, CI, refactor (no public API change) | **None** (no publish) | Add tests, update README |

### Changesets (automated changelog)

```
.changeset/
├── config.json
└── *.md  (auto-generated changeset files)
```

```json
// .changeset/config.json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": "@changesets/changelog-github",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch"
}
```

**Workflow:**
1. Developer creates a changeset: `npx changeset`
2. Describes the change and selects semver bump
3. On merge to main: Changesets bot opens a "Version Packages" PR
4. Merging that PR: auto-publishes to npm with generated CHANGELOG.md

---

## 12.6 Dependency Management

### Automated Updates

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 10
    groups:
      production:
        patterns:
          - "react-markdown"
          - "remark-*"
          - "rehype-*"
          - "shiki"
          - "react-virtuoso"
      dev:
        patterns:
          - "@types/*"
          - "vitest"
          - "vite"
          - "@storybook/*"
          - "playwright"
          - "eslint*"
          - "typescript"
    labels:
      - "dependencies"
    reviewers:
      - "team-lead"
```

### Peer Dependency Compatibility Matrix

| Library Version | React 18 | React 19 | Node 18 | Node 20 | Node 22 |
|----------------|----------|----------|---------|---------|---------|
| 0.x (dev) | ✅ | ✅ | ✅ | ✅ | ✅ |
| 1.0 | ✅ | ✅ | ❌ | ✅ | ✅ |

**Tested in CI** via matrix strategy:
```yaml
strategy:
  matrix:
    node: [18, 20, 22]
    react: [18, 19]
```

---

## 12.7 Deprecation Policy

1. **Deprecation notice** — Add `@deprecated` JSDoc tag + console.warn on first use
2. **Migration guide** — Document the replacement in CHANGELOG and README
3. **Grace period** — Deprecated APIs remain for at least 2 minor versions
4. **Removal** — Only in the next major version

```typescript
// Example deprecation pattern
/**
 * @deprecated Use `<ToolCallDisplay>` instead. Will be removed in v2.0.
 */
export function ToolProgress(props: ToolProgressProps) {
  if (__DEV__) {
    console.warn(
      '[@agent-chat/react] <ToolProgress> is deprecated. Use <ToolCallDisplay> instead.'
    );
  }
  return <ToolCallDisplay {...props} />;
}
```

---

## 12.8 Performance Monitoring

### Bundle Size Tracking

- **size-limit** runs on every PR → comments with size diff
- Alerts if any budget is exceeded
- Historical tracking via GitHub Actions artifacts

### Runtime Performance Benchmarks

```typescript
// benchmarks/render-benchmark.ts
import { performance } from 'perf_hooks';

/**
 * Benchmarks tracked:
 * 1. Initial render time (empty → 100 messages)
 * 2. Streaming render time (append 1 content part)
 * 3. Scroll performance (virtual list with 500 messages)
 * 4. Theme switch time
 * 5. Memory usage after 1000 messages
 */

// Run periodically in CI:
// - On main branch pushes
// - Results stored as GitHub Actions artifacts
// - Alert if any benchmark regresses >20%
```

### Lighthouse CI (for demo app)

```yaml
# In CI workflow
- name: Lighthouse CI
  uses: treosh/lighthouse-ci-action@v11
  with:
    urls: 'http://localhost:5173/demo'
    budgetPath: '.lighthouserc.json'
```

```json
// .lighthouserc.json
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }]
      }
    }
  }
}
```

---

## 12.9 Documentation Maintenance

### Auto-Generated API Docs

```json
// In package.json scripts
{
  "docs": "typedoc --entryPoints src/index.ts --out docs/api",
  "docs:serve": "npx serve docs/api"
}
```

**TypeDoc** generates API documentation from TSDoc comments on every release.

### README Maintenance Checklist

On each release, verify:
- [ ] Installation instructions current
- [ ] Quick start example works
- [ ] All exported components listed
- [ ] Breaking changes documented
- [ ] Peer dependency versions updated
- [ ] Badge links (npm, CI, coverage) working

### Storybook as Living Documentation

- Storybook auto-deploys to GitHub Pages on each main push
- URL: `https://<org>.github.io/agent-chat/`
- Includes:
  - Component playground (all props adjustable)
  - Dark/light theme toggle
  - Accessibility audit panel
  - Full conversation demos

---

## 12.10 Issue & Bug Management

### Issue Templates

```yaml
# .github/ISSUE_TEMPLATE/bug_report.yml
name: Bug Report
description: Report a bug in @agent-chat/react
labels: [bug]
body:
  - type: textarea
    id: description
    attributes:
      label: Describe the bug
    validations:
      required: true
  - type: input
    id: version
    attributes:
      label: Library version
    validations:
      required: true
  - type: dropdown
    id: component
    attributes:
      label: Affected component
      options:
        - AgentChat (main widget)
        - MessageList
        - CodeBlock
        - ThinkingBlock
        - ToolCallDisplay
        - TerminalToolDisplay
        - ChatInputArea
        - TodoList
        - Theme/Styling
        - Streaming
        - Accessibility
        - Other
  - type: textarea
    id: reproduction
    attributes:
      label: Steps to reproduce
    validations:
      required: true
  - type: textarea
    id: expected
    attributes:
      label: Expected behavior
  - type: dropdown
    id: browser
    attributes:
      label: Browser
      options: [Chrome, Firefox, Safari, Edge, Other]
```

### PR Review Checklist

Every PR must pass:
- [ ] All CI checks green
- [ ] Unit tests for new/changed code
- [ ] Storybook story for new components
- [ ] Accessibility audit passes
- [ ] Bundle size within budget
- [ ] No `any` types added
- [ ] JSDoc on all public exports
- [ ] Changeset added (if user-facing change)

---

## 12.11 Security

### Supply Chain Security

```yaml
# .github/workflows/security.yml
name: Security Audit
on:
  schedule:
    - cron: '0 8 * * 1' # Weekly Monday 8am
  push:
    branches: [main]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm audit --audit-level=high
      - run: npx lockfile-lint --path package-lock.json --type npm --allowed-hosts npm registry.npmjs.org

  codeql:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with:
          languages: javascript-typescript
      - uses: github/codeql-action/analyze@v3
```

### Content Security

- `<McpAppDisplay>` renders user HTML in sandboxed iframe only
- Markdown rendering sanitizes HTML tags (allowlist in Phase 5 spec)
- No `dangerouslySetInnerHTML` outside sandboxed contexts
- All external links open with `rel="noopener noreferrer"`
- No eval(), no Function() constructor

---

## 12.12 Maintenance Schedule

| Frequency | Task |
|-----------|------|
| **Every PR** | CI runs: lint, typecheck, tests, bundle size, a11y |
| **Weekly** | Dependabot PRs reviewed & merged |
| **Weekly** | Security audit (npm audit) |
| **Monthly** | Performance benchmark comparison |
| **Quarterly** | Major dependency updates (React, shiki, markdown) |
| **Per release** | CHANGELOG update, API docs regeneration, Storybook deploy |
| **Annually** | Review browser support matrix, drop old Node/React versions |
