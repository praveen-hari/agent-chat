/**
 * Hardcoded fixtures for testing every content part type.
 * Each fixture is a complete ChatSession with mock data.
 * No API calls needed — instant rendering.
 */

import type { ChatSession, ChatRequest, ChatResponse, ChatContentPart } from '@agent-chat/react';

const agent = { id: 'agent', name: 'Coding Agent', icon: { iconId: 'copilot' } as unknown as string };
const ts = Date.now();

function req(id: string, message: string): ChatRequest {
  return { role: 'user', id: `user-${id}`, timestamp: ts, message, content: [{ kind: 'markdown', content: message }] };
}

function res(id: string, reqId: string, content: ChatContentPart[], state: 'complete' | 'streaming' = 'complete'): ChatResponse {
  return { role: 'assistant', id: `asst-${id}`, requestId: `user-${reqId}`, timestamp: ts, state, content, agent, elapsedMs: 2400 };
}

// ═══════════════════════════════════════════
// FIXTURES
// ═══════════════════════════════════════════

export const fixtures: Record<string, { label: string; icon: string; session: ChatSession }> = {

  // ─── Text & Markdown ───
  markdown: {
    label: 'Markdown & Text',
    icon: 'markdown',
    session: {
      id: 'fx-markdown', messages: [
        req('1', 'Show me markdown formatting'),
        res('1', '1', [
          { kind: 'markdown', content: `# Heading 1\n## Heading 2\n### Heading 3\n\nThis is **bold**, *italic*, and ~~strikethrough~~ text.\n\nHere's a [link](https://example.com) and some \`inline code\`.\n\n> This is a blockquote with **bold** inside.\n\n---\n\n- Bullet item 1\n- Bullet item 2\n  - Nested item\n\n1. Numbered item\n2. Another item\n\n| Column A | Column B | Column C |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |` },
        ]),
      ], createdAt: ts,
    },
  },

  codeBlocks: {
    label: 'Code Blocks',
    icon: 'file-code',
    session: {
      id: 'fx-code', messages: [
        req('2', 'Write a React component'),
        res('2', '2', [
          { kind: 'markdown', content: 'Here\'s a React component with TypeScript:' },
          { kind: 'code', code: `import { useState } from 'react';\n\ninterface TodoItem {\n  id: number;\n  text: string;\n  done: boolean;\n}\n\nexport function TodoList() {\n  const [items, setItems] = useState<TodoItem[]>([]);\n  const [input, setInput] = useState('');\n\n  const addItem = () => {\n    if (!input.trim()) return;\n    setItems(prev => [...prev, { id: Date.now(), text: input, done: false }]);\n    setInput('');\n  };\n\n  return (\n    <div>\n      <input value={input} onChange={e => setInput(e.target.value)} />\n      <button onClick={addItem}>Add</button>\n      <ul>\n        {items.map(item => (\n          <li key={item.id}>{item.text}</li>\n        ))}\n      </ul>\n    </div>\n  );\n}`, language: 'typescript', filename: 'TodoList.tsx' },
          { kind: 'markdown', content: 'And some CSS:' },
          { kind: 'code', code: `.todo-list {\n  max-width: 400px;\n  margin: 0 auto;\n}\n\n.todo-item--done {\n  text-decoration: line-through;\n  opacity: 0.6;\n}`, language: 'css', filename: 'styles.css' },
        ]),
      ], createdAt: ts,
    },
  },

  // ─── Tool Calls ───
  singleTool: {
    label: 'Single Tool Call',
    icon: 'wrench',
    session: {
      id: 'fx-single-tool', messages: [
        req('3', 'Read the utils file'),
        res('3', '3', [
          { kind: 'tool-call', toolId: 'read_file', toolCallId: 'tc-1', status: 'complete', input: { path: 'src/utils.ts' }, output: JSON.stringify({ path: 'src/utils.ts', content: 'export function add(a: number, b: number) {\n  return a + b;\n}', lines: 3 }) } as ChatContentPart,
          { kind: 'markdown', content: 'The file `src/utils.ts` contains a simple `add` function.' },
        ]),
      ], createdAt: ts,
    },
  },

  multiTool: {
    label: 'Multi-Tool Chain',
    icon: 'link',
    session: {
      id: 'fx-multi-tool', messages: [
        req('4', 'List files then read the main one'),
        res('4', '4', [
          { kind: 'tool-call', toolId: 'list_files', toolCallId: 'tc-2', status: 'complete', input: {}, output: JSON.stringify({ files: [{ path: 'src/index.ts', lines: 4 }, { path: 'src/utils.ts', lines: 8 }, { path: 'package.json', lines: 7 }], total: 3 }) } as ChatContentPart,
          { kind: 'tool-call', toolId: 'read_file', toolCallId: 'tc-3', status: 'complete', input: { path: 'src/index.ts' }, output: JSON.stringify({ path: 'src/index.ts', content: 'export function hello() {\n  return "Hello World";\n}', lines: 3 }) } as ChatContentPart,
          { kind: 'tool-call', toolId: 'read_file', toolCallId: 'tc-4', status: 'complete', input: { path: 'src/utils.ts' }, output: JSON.stringify({ path: 'src/utils.ts', content: 'export function add(a, b) { return a + b; }', lines: 1 }) } as ChatContentPart,
          { kind: 'markdown', content: 'The project has **3 files**. Here\'s what I found:\n- `src/index.ts` — exports `hello()`\n- `src/utils.ts` — exports `add()`' },
        ]),
      ], createdAt: ts,
    },
  },

  toolRunning: {
    label: 'Tool Running (streaming)',
    icon: 'loading',
    session: {
      id: 'fx-tool-running', messages: [
        req('5', 'Search for bugs'),
        res('5', '5', [
          { kind: 'tool-call', toolId: 'search_code', toolCallId: 'tc-5', status: 'running', input: { query: 'TODO|FIXME|HACK' } } as ChatContentPart,
        ], 'streaming'),
      ], createdAt: ts,
    },
  },

  toolFailed: {
    label: 'Tool Failed',
    icon: 'error',
    session: {
      id: 'fx-tool-failed', messages: [
        req('6', 'Read a missing file'),
        res('6', '6', [
          { kind: 'tool-call', toolId: 'read_file', toolCallId: 'tc-6', status: 'failed', input: { path: 'src/missing.ts' } } as ChatContentPart,
          { kind: 'error', message: 'File not found: src/missing.ts', level: 'error' } as ChatContentPart,
        ]),
      ], createdAt: ts,
    },
  },

  editTool: {
    label: 'Edit File Tool',
    icon: 'edit',
    session: {
      id: 'fx-edit', messages: [
        req('7', 'Fix the utils file'),
        res('7', '7', [
          { kind: 'tool-call', toolId: 'read_file', toolCallId: 'tc-7', status: 'complete', input: { path: 'src/utils.ts' }, output: JSON.stringify({ path: 'src/utils.ts', lines: 8 }) } as ChatContentPart,
          { kind: 'tool-call', toolId: 'write_file', toolCallId: 'tc-8', status: 'complete', input: { path: 'src/utils.ts', content: 'export function add(a: number, b: number): number {\n  return a + b;\n}' }, output: JSON.stringify({ path: 'src/utils.ts', action: 'modified', lines: 3 }) } as ChatContentPart,
          { kind: 'tool-call', toolId: 'run_command', toolCallId: 'tc-9', status: 'complete', input: { command: 'npm test' }, output: JSON.stringify({ command: 'npm test', stdout: '✓ 12 tests passed', exitCode: 0 }) } as ChatContentPart,
          { kind: 'markdown', content: 'I\'ve fixed `src/utils.ts` by adding proper TypeScript types. Tests pass ✓' },
        ]),
      ], createdAt: ts,
    },
  },

  // ─── Thinking / Chain of Thought ───
  thinking: {
    label: 'Chain of Thought',
    icon: 'symbol-misc',
    session: {
      id: 'fx-thinking', messages: [
        req('8', 'Find and fix the authentication bug'),
        res('8', '8', [
          { kind: 'thinking', content: 'Let me analyze the authentication code. The user reports login failures.\n\n1. First, I need to read the auth module\n2. Check token validation logic\n3. Look for common pitfalls like:\n   - Missing null checks\n   - Expired token handling\n   - Race conditions', isStreaming: false, title: 'Analyzing authentication', nestedToolCalls: [{ id: 't1', toolId: 'read_file', label: 'Reading src/auth.ts', status: 'complete', icon: 'file-code' }, { id: 't2', toolId: 'search_code', label: 'Searching for "validateToken"', status: 'complete', icon: 'search' }], aggregateDiff: { added: 5, removed: 2 } } as ChatContentPart,
          { kind: 'markdown', content: 'Found the bug! The token validation was missing a null check:\n\n```typescript\n// Before (buggy)\nif (token.isValid()) { ... }\n\n// After (fixed)\nif (token != null && token.isValid()) { ... }\n```' },
        ]),
      ], createdAt: ts,
    },
  },

  thinkingStreaming: {
    label: 'Thinking (streaming)',
    icon: 'loading',
    session: {
      id: 'fx-thinking-stream', messages: [
        req('9', 'Refactor the module'),
        res('9', '9', [
          { kind: 'thinking', content: 'Let me plan the refactoring approach...\n\nI need to:\n- Extract common utilities\n- Split large functions', isStreaming: true, nestedToolCalls: [{ id: 't3', toolId: 'read_file', label: 'Reading module.ts', status: 'complete' }, { id: 't4', toolId: 'search_code', label: 'Finding dependencies', status: 'running' }] } as ChatContentPart,
        ], 'streaming'),
      ], createdAt: ts,
    },
  },

  // ─── Sub-Agent ───
  subAgent: {
    label: 'Sub-Agent Handoff',
    icon: 'git-merge',
    session: {
      id: 'fx-subagent', messages: [
        req('10', 'Review my code quality'),
        res('10', '10', [
          { kind: 'sub-agent', agentName: 'Code Review Agent', description: 'Analyzing code quality, checking for bugs, security issues, and suggesting improvements', status: 'complete', modelName: 'GPT-4.1', credits: 3 } as ChatContentPart,
          { kind: 'markdown', content: '## Code Review Results\n\n**Overall Score: 7/10**\n\n### Issues Found:\n1. ⚠️ Missing error handling in `fetchData()`\n2. ⚠️ Unused import on line 3\n3. ✓ Good TypeScript usage\n4. ✓ Clean function naming' },
        ]),
      ], createdAt: ts,
    },
  },

  // ─── File Operations ───
  fileChanges: {
    label: 'File Changes Summary',
    icon: 'diff',
    session: {
      id: 'fx-files', messages: [
        req('11', 'Show me recent changes'),
        res('11', '11', [
          { kind: 'file-changes-summary', files: [{ filename: 'src/auth.ts', status: 'modified', linesAdded: 15, linesRemoved: 3 }, { filename: 'src/helpers.ts', status: 'created', linesAdded: 42, linesRemoved: 0 }, { filename: 'src/old-utils.ts', status: 'deleted', linesAdded: 0, linesRemoved: 28 }, { filename: 'src/config.ts', status: 'renamed', linesAdded: 2, linesRemoved: 1 }], totalAdded: 59, totalRemoved: 32 } as ChatContentPart,
          { kind: 'edit-pill', filename: 'src/auth.ts', status: 'modified', linesAdded: 15, linesRemoved: 3 } as ChatContentPart,
          { kind: 'edit-pill', filename: 'src/helpers.ts', status: 'created', linesAdded: 42, linesRemoved: 0 } as ChatContentPart,
        ]),
      ], createdAt: ts,
    },
  },

  // ─── Todo List ───
  todoList: {
    label: 'Todo List',
    icon: 'checklist',
    session: {
      id: 'fx-todos', messages: [
        req('12', 'Create a task plan for the refactoring'),
        res('12', '12', [
          { kind: 'todo-list', items: [{ id: 1, title: 'Analyze current codebase structure', status: 'completed' }, { id: 2, title: 'Extract shared utilities into utils/', status: 'completed' }, { id: 3, title: 'Split large components', status: 'in-progress' }, { id: 4, title: 'Add unit tests for new modules', status: 'not-started' }, { id: 5, title: 'Update documentation', status: 'not-started' }] } as ChatContentPart,
          { kind: 'markdown', content: 'I\'ve created a 5-step plan. Currently working on step 3.' },
        ]),
      ], createdAt: ts,
    },
  },

  // ─── Errors & Notifications ───
  errors: {
    label: 'Errors & Warnings',
    icon: 'warning',
    session: {
      id: 'fx-errors', messages: [
        req('13', 'Show error examples'),
        res('13', '13', [
          { kind: 'error', message: 'Rate limit exceeded. Please try again in 30 seconds.', level: 'error' } as ChatContentPart,
          { kind: 'error', message: 'The model may produce inaccurate code for this language.', level: 'warning' } as ChatContentPart,
          { kind: 'error', message: 'Using cached response from 2 minutes ago.', level: 'info' } as ChatContentPart,
          { kind: 'system-notification', message: 'Agent switched to GPT-4.1', style: 'standard' } as ChatContentPart,
          { kind: 'system-notification', message: 'New workspace', style: 'separator' } as ChatContentPart,
          { kind: 'workspace-transition', workspaceName: 'my-project' } as ChatContentPart,
        ]),
      ], createdAt: ts,
    },
  },

  // ─── Confirmations ───
  confirmation: {
    label: 'Confirmation Dialog',
    icon: 'shield',
    session: {
      id: 'fx-confirm', messages: [
        req('14', 'Delete the old config'),
        res('14', '14', [
          { kind: 'tool-confirmation', toolId: 'delete_file', toolCallId: 'tc-10', title: 'Delete src/old-config.ts', message: 'This will permanently remove the file from the project.', riskLevel: 'high', subtitle: 'Irreversible operation', actions: [{ id: 'allow', label: 'Allow Once', primary: true, keybinding: '⌘Enter' }, { id: 'skip', label: 'Skip' }] } as ChatContentPart,
        ]),
      ], createdAt: ts,
    },
  },

  // ─── References ───
  references: {
    label: 'References & Sources',
    icon: 'references',
    session: {
      id: 'fx-refs', messages: [
        req('15', 'What files did you use?'),
        res('15', '15', [
          { kind: 'references', references: [{ label: 'src/auth.ts', uri: 'file:///src/auth.ts' }, { label: 'src/utils.ts', uri: 'file:///src/utils.ts' }, { label: 'tsconfig.json', uri: 'file:///tsconfig.json' }, { label: 'package.json', uri: 'file:///package.json' }] } as ChatContentPart,
          { kind: 'markdown', content: 'I referenced 4 files to answer your question.' },
        ]),
      ], createdAt: ts,
    },
  },

  // ─── Images ───
  image: {
    label: 'Image Content',
    icon: 'file-media',
    session: {
      id: 'fx-image', messages: [
        req('16', 'Show me a diagram'),
        res('16', '16', [
          { kind: 'markdown', content: 'Here\'s the architecture diagram:' },
          { kind: 'image', src: 'https://placehold.co/600x300/1e1e2e/cdd6f4?text=Architecture+Diagram', alt: 'Architecture diagram' } as ChatContentPart,
          { kind: 'markdown', content: 'The system uses a layered architecture with clear separation of concerns.' },
        ]),
      ], createdAt: ts,
    },
  },

  // ─── Full Conversation ───
  fullConversation: {
    label: 'Full Conversation',
    icon: 'comment-discussion',
    session: {
      id: 'fx-full', messages: [
        req('20', 'Fix the login bug and run tests'),
        res('20', '20', [
          { kind: 'thinking', content: 'Let me analyze the login code to find the bug.\n\nI\'ll need to:\n1. Read the auth module\n2. Find the issue\n3. Fix it\n4. Run tests to verify', isStreaming: false, title: 'Planning approach', nestedToolCalls: [{ id: 'n1', toolId: 'read_file', label: 'Reading src/auth.ts', status: 'complete' }, { id: 'n2', toolId: 'search_code', label: 'Searching for "login"', status: 'complete' }] } as ChatContentPart,
          { kind: 'tool-call', toolId: 'read_file', toolCallId: 'tc-20', status: 'complete', input: { path: 'src/auth.ts' }, output: JSON.stringify({ path: 'src/auth.ts', lines: 45 }) } as ChatContentPart,
          { kind: 'tool-call', toolId: 'search_code', toolCallId: 'tc-21', status: 'complete', input: { query: 'validateToken' }, output: JSON.stringify({ query: 'validateToken', matches: 3 }) } as ChatContentPart,
          { kind: 'markdown', content: 'Found the bug! The token validation was missing a null check. Let me fix it:' },
          { kind: 'tool-call', toolId: 'write_file', toolCallId: 'tc-22', status: 'complete', input: { path: 'src/auth.ts' }, output: JSON.stringify({ path: 'src/auth.ts', action: 'modified', lines: 47 }) } as ChatContentPart,
          { kind: 'tool-call', toolId: 'run_command', toolCallId: 'tc-23', status: 'complete', input: { command: 'npm test' }, output: JSON.stringify({ command: 'npm test', stdout: '✓ 12 tests passed\n✓ 0 failed', exitCode: 0 }) } as ChatContentPart,
          { kind: 'markdown', content: '## Summary\n\n**Bug found and fixed!**\n\n- **Issue:** `validateToken()` called without null check\n- **Fix:** Added `token != null &&` guard\n- **Tests:** All 12 passing ✓\n\n```typescript\n// Before\nif (token.isValid()) { ... }\n\n// After  \nif (token != null && token.isValid()) { ... }\n```' },
        ]),
        req('21', 'Can you also add error logging?'),
        res('21', '21', [
          { kind: 'tool-call', toolId: 'write_file', toolCallId: 'tc-24', status: 'complete', input: { path: 'src/auth.ts' }, output: JSON.stringify({ path: 'src/auth.ts', action: 'modified', lines: 52 }) } as ChatContentPart,
          { kind: 'tool-call', toolId: 'run_command', toolCallId: 'tc-25', status: 'complete', input: { command: 'npm test' }, output: JSON.stringify({ command: 'npm test', stdout: '✓ 14 tests passed', exitCode: 0 }) } as ChatContentPart,
          { kind: 'markdown', content: 'Added error logging to the auth module. All 14 tests pass.' },
        ]),
      ], createdAt: ts,
    },
  },
};

export const fixtureList = Object.entries(fixtures).map(([key, value]) => ({
  key,
  ...value,
}));
