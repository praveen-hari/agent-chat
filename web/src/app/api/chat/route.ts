/**
 * Coding Agent API Route — OpenAI Agents SDK
 *
 * Full coding agent with:
 * - File operations (read, write, search)
 * - Code execution (run commands)
 * - Web search
 * - Planning (todo list)
 * - Multi-agent handoffs (code review, research)
 *
 * Streams ChatAgentEvent-compatible SSE events.
 */

import { Agent, run, tool } from '@openai/agents';
import { z } from 'zod';

export const maxDuration = 120;
export const dynamic = 'force-dynamic';

// ─── Simulated Filesystem (in-memory for demo) ───
const virtualFS: Record<string, string> = {
  'src/index.ts': `export function hello() {\n  return "Hello World";\n}\n`,
  'src/utils.ts': `export function add(a: number, b: number) {\n  return a + b;\n}\n\nexport function multiply(a: number, b: number) {\n  return a * b;\n}\n`,
  'package.json': `{\n  "name": "demo-project",\n  "version": "1.0.0",\n  "dependencies": {\n    "typescript": "^5.0.0"\n  }\n}\n`,
  'README.md': `# Demo Project\n\nA sample TypeScript project.\n`,
  'tsconfig.json': `{\n  "compilerOptions": {\n    "target": "ES2020",\n    "strict": true\n  }\n}\n`,
};

// ─── Coding Tools ───

const readFile = tool({
  name: 'read_file',
  description: 'Read the contents of a file. Returns the file content as a string.',
  parameters: z.object({
    path: z.string().describe('File path to read, e.g. "src/index.ts"'),
  }),
  async execute({ path }) {
    const content = virtualFS[path];
    if (!content) {
      return JSON.stringify({ error: `File not found: ${path}`, available_files: Object.keys(virtualFS) });
    }
    return JSON.stringify({ path, content, lines: content.split('\n').length });
  },
});

const writeFile = tool({
  name: 'write_file',
  description: 'Write content to a file. Creates the file if it does not exist.',
  parameters: z.object({
    path: z.string().describe('File path to write'),
    content: z.string().describe('File content to write'),
  }),
  async execute({ path, content }) {
    const existed = path in virtualFS;
    virtualFS[path] = content;
    const lines = content.split('\n').length;
    return JSON.stringify({
      path,
      action: existed ? 'modified' : 'created',
      lines,
      message: `${existed ? 'Modified' : 'Created'} ${path} (${lines} lines)`,
    });
  },
});

const listFiles = tool({
  name: 'list_files',
  description: 'List all files in the project.',
  parameters: z.object({}),
  async execute() {
    const files = Object.keys(virtualFS).map((path) => ({
      path,
      lines: virtualFS[path]!.split('\n').length,
      size: virtualFS[path]!.length,
    }));
    return JSON.stringify({ files, total: files.length });
  },
});

const searchCode = tool({
  name: 'search_code',
  description: 'Search for a pattern across all files. Returns matching lines.',
  parameters: z.object({
    query: z.string().describe('Search text or pattern'),
  }),
  async execute({ query }) {
    const results: Array<{ file: string; line: number; content: string }> = [];
    for (const [path, content] of Object.entries(virtualFS)) {
      content.split('\n').forEach((line, i) => {
        if (line.toLowerCase().includes(query.toLowerCase())) {
          results.push({ file: path, line: i + 1, content: line.trim() });
        }
      });
    }
    return JSON.stringify({ query, matches: results.length, results: results.slice(0, 20) });
  },
});

const runCommand = tool({
  name: 'run_command',
  description: 'Run a shell command. Returns stdout and exit code.',
  parameters: z.object({
    command: z.string().describe('Shell command to run, e.g. "npm test"'),
  }),
  async execute({ command }) {
    // Simulated command execution
    const simulations: Record<string, { stdout: string; exitCode: number }> = {
      'npm test': { stdout: '✓ 12 tests passed\n✓ 0 failed\nTest Suites: 3 passed, 3 total\nTime: 1.234s', exitCode: 0 },
      'npm run build': { stdout: 'Compiling TypeScript...\n✓ Build complete\nOutput: dist/', exitCode: 0 },
      'npm run lint': { stdout: 'Linting files...\n⚠ 2 warnings\n  src/utils.ts:4 - unused variable\n  src/index.ts:1 - missing return type\n✓ 0 errors', exitCode: 0 },
      'tsc --noEmit': { stdout: 'Checking types...\n✓ No errors found', exitCode: 0 },
      'git status': { stdout: 'On branch main\nChanges not staged:\n  modified: src/utils.ts\n  new file: src/helpers.ts', exitCode: 0 },
      'git diff': { stdout: '--- a/src/utils.ts\n+++ b/src/utils.ts\n@@ -1,4 +1,8 @@\n+import { Logger } from "./logger";\n+\n export function add(a: number, b: number) {\n-  return a + b;\n+  Logger.debug(`add(${a}, ${b})`);\n+  return a + b;\n }', exitCode: 0 },
    };

    const result = simulations[command];
    if (result) {
      return JSON.stringify({ command, ...result });
    }
    // Generic simulation
    return JSON.stringify({ command, stdout: `$ ${command}\nCommand executed successfully.`, exitCode: 0 });
  },
});

const webSearch = tool({
  name: 'web_search',
  description: 'Search the web for documentation, APIs, or current information.',
  parameters: z.object({
    query: z.string().describe('Search query'),
  }),
  async execute({ query }) {
    return JSON.stringify({
      query,
      results: [
        { title: `Documentation: ${query}`, url: `https://docs.example.com/${query.replace(/\s+/g, '-')}`, snippet: `Official documentation for ${query}. Includes API reference, guides, and examples.` },
        { title: `${query} - Best Practices`, url: `https://blog.example.com/${query.replace(/\s+/g, '-')}`, snippet: `Learn best practices for ${query} with real-world examples and patterns.` },
        { title: `Stack Overflow: ${query}`, url: `https://stackoverflow.com/search?q=${encodeURIComponent(query)}`, snippet: `Community answers and discussions about ${query}.` },
      ],
    });
  },
});

const writeTodos = tool({
  name: 'write_todos',
  description: 'Create or update a task plan with todo items. Use this to break down work into steps.',
  parameters: z.object({
    items: z.array(z.object({
      id: z.number(),
      title: z.string(),
      status: z.enum(['not-started', 'in-progress', 'completed']),
    })),
  }),
  async execute({ items }) {
    return JSON.stringify({
      message: `Updated ${items.length} todo items`,
      items,
      completed: items.filter((i) => i.status === 'completed').length,
      remaining: items.filter((i) => i.status !== 'completed').length,
    });
  },
});

// ─── Specialist Agents ───

const codeReviewAgent = new Agent({
  name: 'Code Review Agent',
  instructions: `You are a senior code reviewer. When reviewing code:
1. Check for bugs, security issues, and performance problems
2. Suggest improvements with specific code examples
3. Comment on code style and readability
4. Use the read_file tool to examine code
Be thorough but constructive. Format your review with clear sections.`,
  model: 'gpt-4.1-mini',
  tools: [readFile, searchCode],
});

const researchAgent = new Agent({
  name: 'Research Agent',
  instructions: `You are a research assistant specializing in software development.
Use web_search to find relevant documentation, APIs, and best practices.
Provide clear, concise summaries with links to sources.`,
  model: 'gpt-4.1-mini',
  tools: [webSearch],
});

// ─── Main Coding Agent ───

function createAgent(model: string) {
  return Agent.create({
    name: 'Coding Agent',
    instructions: `You are an expert coding agent. You can read, write, and search code, run commands, and plan tasks.

IMPORTANT BEHAVIORS:
1. **Always plan first**: Use write_todos to break down complex tasks before starting
2. **Read before writing**: Always read_file before modifying existing code
3. **Search before creating**: Use search_code to find existing patterns
4. **Verify your work**: Run relevant commands (tests, lint, build) after changes
5. **Explain your reasoning**: Think through problems step by step

AVAILABLE TOOLS:
- read_file: Read file contents
- write_file: Create or modify files
- list_files: See all project files
- search_code: Search across codebase
- run_command: Execute shell commands (npm test, npm run build, tsc, git, etc.)
- web_search: Search documentation and APIs
- write_todos: Create task plans

HANDOFFS:
- Hand off to "Code Review Agent" for code review tasks
- Hand off to "Research Agent" for documentation research

Use markdown formatting. Show code changes clearly.`,
    model,
    tools: [readFile, writeFile, listFiles, searchCode, runCommand, webSearch, writeTodos],
    handoffs: [codeReviewAgent, researchAgent],
  });
}

// ─── SSE Stream Handler ───

export async function POST(req: Request) {
  const { message, history, model: modelId } = await req.json();
  const agent = createAgent(modelId || 'gpt-4.1-mini');

  // Normalize history for OpenAI Agents SDK
  // Assistant messages need content as array of output blocks, not plain string
  const normalizedHistory = (history || []).map((msg: { role: string; content: string }) => {
    if (msg.role === 'assistant') {
      return {
        role: 'assistant' as const,
        content: [{ type: 'output_text' as const, text: msg.content }],
      };
    }
    return { role: msg.role as 'user', content: msg.content };
  });

  const input = [
    ...normalizedHistory,
    { role: 'user' as const, content: message },
  ];

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const stream = await run(agent, input, { stream: true });
        let currentAgentName = 'Coding Agent';

        for await (const event of stream) {
          // Agent handoff
          if (event.type === 'agent_updated_stream_event') {
            currentAgentName = event.agent?.name || 'Coding Agent';
            send({ type: 'agent-handoff', agentName: currentAgentName, agentIcon: 'copilot' });
          }

          // Text streaming
          if (event.type === 'raw_model_stream_event') {
            const data = event.data as Record<string, unknown>;
            if (data.type === 'output_text_delta') {
              const delta = (data.delta as string) || '';
              send({ type: 'text-delta', text: delta });
            }
          }

          // Tool & handoff events
          if (event.type === 'run_item_stream_event') {
            const item = event.item as unknown as Record<string, unknown>;

            if (event.name === 'tool_called') {
              // Extract tool name from RunItem — could be in .name, .toolName, or nested
              const toolName = (item.name as string)
                || (item.toolName as string)
                || (item.rawItem as Record<string, unknown>)?.name as string
                || (item.rawItem as Record<string, unknown>)?.function_name as string
                || String(item.type || 'tool');
              const callId = (item.callId as string)
                || (item.rawItem as Record<string, unknown>)?.call_id as string
                || `tc-${Date.now()}`;

              // Log for debugging
              console.log('[tool_called]', JSON.stringify(item, null, 2).slice(0, 500));

              send({
                type: 'tool-call-start',
                toolCallId: callId,
                toolId: toolName,
                input: item.arguments,
              });
            }

            if (event.name === 'tool_output') {
              const callId = (item.callId as string)
                || (item.rawItem as Record<string, unknown>)?.call_id as string
                || '';
              send({
                type: 'tool-call-end',
                toolCallId: callId,
                output: typeof item.output === 'string' ? item.output : JSON.stringify(item.output),
                success: true,
              });
            }

            if (event.name === 'reasoning_item_created') {
              send({
                type: 'reasoning',
                text: typeof item.text === 'string' ? item.text : '',
              });
            }

            if (event.name === 'handoff_occurred') {
              send({
                type: 'agent-handoff',
                agentName: String((item as Record<string, unknown>).targetAgent || 'specialist'),
              });
            }
          }
        }

        await stream.completed;
        send({
          type: 'done',
          agentName: stream.lastAgent?.name || currentAgentName,
        });

        controller.close();
      } catch (error) {
        send({
          type: 'error',
          message: error instanceof Error ? error.message : 'Agent run failed',
          level: 'error',
        });
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
