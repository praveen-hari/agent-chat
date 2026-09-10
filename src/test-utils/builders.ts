/**
 * Test data builders for creating typed test fixtures.
 * Uses builder pattern with sensible defaults that can be overridden.
 *
 * @module test-utils/builders
 */

import type {
  ChatSession,
  ChatRequest,
  ChatResponse,
  ChatAgent,
  ChatFollowup,
} from '../types/models';
import type {
  MarkdownPart,
  CodeBlockPart,
  ThinkingPart,
  ToolCallPart,
  TerminalCommandPart,
  EditPillPart,
  TodoListPart,
  TodoItem,
  ProgressPart,
  FileChangesSummaryPart,
  ToolConfirmationPart,
  ErrorPart,
  ConfirmationPart,
} from '../types/content-parts';

let idCounter = 0;
const nextId = () => `test-${++idCounter}`;

/** Reset ID counter (call in beforeEach for deterministic IDs) */
export function resetIdCounter(): void {
  idCounter = 0;
}

// ═══════════════════════════════════════════
// SESSION & MESSAGE BUILDERS
// ═══════════════════════════════════════════

export function buildSession(overrides?: Partial<ChatSession>): ChatSession {
  return {
    id: nextId(),
    messages: [],
    createdAt: Date.now(),
    ...overrides,
  };
}

export function buildRequest(overrides?: Partial<ChatRequest>): ChatRequest {
  const message = overrides?.message ?? 'Hello, world!';
  return {
    role: 'user',
    id: nextId(),
    timestamp: Date.now(),
    message,
    content: [{ kind: 'markdown', content: message }],
    ...overrides,
  };
}

export function buildResponse(overrides?: Partial<ChatResponse>): ChatResponse {
  return {
    role: 'assistant',
    id: nextId(),
    requestId: nextId(),
    timestamp: Date.now(),
    state: 'complete',
    content: [{ kind: 'markdown', content: 'Hello! How can I help?' }],
    agent: buildAgent(),
    ...overrides,
  };
}

export function buildAgent(overrides?: Partial<ChatAgent>): ChatAgent {
  return {
    id: 'test-agent',
    name: 'Test Agent',
    icon: '🤖',
    ...overrides,
  };
}

export function buildFollowup(overrides?: Partial<ChatFollowup>): ChatFollowup {
  return {
    id: nextId(),
    label: 'Tell me more',
    message: 'Tell me more about this',
    type: 'reply',
    ...overrides,
  };
}

// ═══════════════════════════════════════════
// CONTENT PART BUILDERS
// ═══════════════════════════════════════════

export function buildMarkdown(content: string): MarkdownPart {
  return { kind: 'markdown', content };
}

export function buildCodeBlock(
  code: string,
  language = 'typescript',
  filename?: string,
): CodeBlockPart {
  return { kind: 'code', code, language, filename };
}

export function buildThinking(content: string, isStreaming = false): ThinkingPart {
  return { kind: 'thinking', content, isStreaming };
}

export function buildToolCall(overrides?: Partial<ToolCallPart>): ToolCallPart {
  return {
    kind: 'tool-call',
    toolId: 'test_tool',
    toolCallId: nextId(),
    status: 'complete',
    ...overrides,
  };
}

export function buildTerminalCommand(
  overrides?: Partial<TerminalCommandPart>,
): TerminalCommandPart {
  return {
    kind: 'terminal-command',
    command: 'npm test',
    output: 'All tests passed',
    exitCode: 0,
    isRunning: false,
    ...overrides,
  };
}

export function buildEditPill(overrides?: Partial<EditPillPart>): EditPillPart {
  return {
    kind: 'edit-pill',
    filename: 'src/utils.ts',
    status: 'modified',
    linesAdded: 12,
    linesRemoved: 3,
    ...overrides,
  };
}

export function buildProgress(message: string, isActive = false): ProgressPart {
  return { kind: 'progress', message, isActive };
}

export function buildTodoList(items?: TodoItem[]): TodoListPart {
  return {
    kind: 'todo-list',
    items: items ?? [
      { id: 1, title: 'Explore codebase', status: 'completed' },
      { id: 2, title: 'Fix the bug', status: 'in-progress' },
      { id: 3, title: 'Write tests', status: 'not-started' },
    ],
  };
}

export function buildFileChangesSummary(fileCount = 3): FileChangesSummaryPart {
  const files = Array.from({ length: fileCount }, (_, i) => ({
    filename: `src/file${i + 1}.ts`,
    status: 'modified' as const,
    linesAdded: Math.floor(Math.random() * 50) + 1,
    linesRemoved: Math.floor(Math.random() * 20),
  }));
  return {
    kind: 'file-changes-summary',
    files,
    totalAdded: files.reduce((sum, f) => sum + f.linesAdded, 0),
    totalRemoved: files.reduce((sum, f) => sum + f.linesRemoved, 0),
  };
}

export function buildToolConfirmation(
  overrides?: Partial<ToolConfirmationPart>,
): ToolConfirmationPart {
  return {
    kind: 'tool-confirmation',
    toolId: 'edit_file',
    toolCallId: nextId(),
    title: 'Edit src/utils.ts',
    message: 'This tool wants to modify a file.',
    actions: [
      { id: 'allow-once', label: 'Allow Once', primary: true },
      { id: 'skip', label: 'Skip' },
    ],
    ...overrides,
  };
}

export function buildError(
  message = 'Something went wrong',
  level: ErrorPart['level'] = 'error',
): ErrorPart {
  return { kind: 'error', message, level };
}

export function buildConfirmation(overrides?: Partial<ConfirmationPart>): ConfirmationPart {
  return {
    kind: 'confirmation',
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    buttons: [
      { id: 'yes', label: 'Yes', primary: true },
      { id: 'no', label: 'No' },
    ],
    ...overrides,
  };
}

// ═══════════════════════════════════════════
// SCENARIO BUILDERS (full conversations)
// ═══════════════════════════════════════════

export function buildSimpleConversation(): ChatSession {
  const reqId = nextId();
  return buildSession({
    messages: [
      buildRequest({ id: reqId, message: 'Fix the login bug' }),
      buildResponse({
        requestId: reqId,
        content: [
          buildThinking('Let me analyze the login code...'),
          buildToolCall({ toolId: 'read_file', status: 'complete', label: 'Reading auth.ts' }),
          buildMarkdown('I found the issue. The token validation was missing a null check.'),
          buildCodeBlock(
            'if (token != null) {\n  validate(token);\n}',
            'typescript',
            'src/auth.ts',
          ),
          buildEditPill({ filename: 'src/auth.ts', linesAdded: 3, linesRemoved: 1 }),
        ],
      }),
    ],
  });
}

export function buildStreamingConversation(): ChatSession {
  const reqId = nextId();
  return buildSession({
    messages: [
      buildRequest({ id: reqId, message: 'Explain this code' }),
      buildResponse({
        requestId: reqId,
        state: 'streaming',
        content: [buildThinking('Analyzing the code structure...', true), { kind: 'working' }],
      }),
    ],
  });
}

export function buildToolConfirmationConversation(): ChatSession {
  const reqId = nextId();
  return buildSession({
    messages: [
      buildRequest({ id: reqId, message: 'Refactor the utils module' }),
      buildResponse({
        requestId: reqId,
        state: 'needs-input',
        content: [
          buildThinking('Planning the refactoring...'),
          buildToolConfirmation({
            title: 'Edit src/utils.ts',
            message: 'Replace the legacy helper functions with modern equivalents.',
            riskLevel: 'medium',
          }),
        ],
      }),
    ],
  });
}
