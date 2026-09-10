/**
 * Pre-built test fixtures for common test scenarios.
 * Use these in integration tests and snapshot tests.
 *
 * @module test-utils/fixtures
 */

import {
  buildSession,
  buildRequest,
  buildResponse,
  buildMarkdown,
  buildCodeBlock,
  buildThinking,
  buildToolCall,
  buildTerminalCommand,
  buildEditPill,
  buildProgress,
  buildTodoList,
  buildFileChangesSummary,
  buildError,
  buildConfirmation,
  buildFollowup,
  buildStreamingConversation,
  buildToolConfirmationConversation,
  buildSimpleConversation,
} from './builders';

/**
 * Standard fixtures for testing. Re-created on each access via getters
 * to ensure test isolation (fresh IDs each time).
 */
export function createFixtures() {
  return {
    /** Empty session — triggers welcome screen */
    emptySession: buildSession(),

    /** Simple 1-turn conversation */
    simpleChat: buildSimpleConversation(),

    /** Active streaming response */
    streamingChat: buildStreamingConversation(),

    /** Response waiting for tool confirmation */
    toolConfirmation: buildToolConfirmationConversation(),

    /** Session with all content part types for snapshot testing */
    allContentParts: buildSession({
      messages: [
        buildRequest({ message: 'Show me everything' }),
        buildResponse({
          content: [
            buildMarkdown('# Hello\n\nThis is **bold** and `code`.'),
            buildCodeBlock('const x = 1;', 'typescript'),
            buildThinking('**Analyzing** the request...'),
            {
              kind: 'sub-agent',
              agentName: 'Explore',
              description: 'Searching codebase',
              status: 'complete' as const,
            },
            buildToolCall({
              toolId: 'search',
              status: 'complete',
              label: 'Searching files',
            }),
            buildTerminalCommand(),
            buildProgress('Analyzing code...'),
            buildEditPill(),
            buildFileChangesSummary(2),
            buildTodoList(),
            {
              kind: 'references',
              references: [{ label: 'src/app.ts', uri: 'file:///src/app.ts' }],
            },
            buildError('Something went wrong', 'warning'),
            buildConfirmation(),
            { kind: 'command', label: 'Open Settings', commandId: 'settings.open' },
            { kind: 'image', src: 'https://example.com/image.png', alt: 'Screenshot' },
            {
              kind: 'workspace-transition',
              workspaceName: 'my-project',
            },
            { kind: 'working' },
          ],
          followups: [buildFollowup()],
        }),
      ],
    }),

    /** Session with multiple turns */
    multiTurnChat: buildSession({
      messages: [
        buildRequest({ message: 'Hello' }),
        buildResponse({
          content: [buildMarkdown('Hi! How can I help?')],
          followups: [
            buildFollowup({ label: 'Fix a bug', message: 'Fix the login bug' }),
            buildFollowup({ label: 'Write tests', message: 'Write unit tests' }),
          ],
        }),
        buildRequest({ message: 'Fix the login bug' }),
        buildResponse({
          content: [
            buildThinking('Looking at the auth module...'),
            buildToolCall({ toolId: 'read_file', status: 'complete' }),
            buildMarkdown('Found the issue in `auth.ts`.'),
            buildEditPill({ filename: 'src/auth.ts', linesAdded: 5, linesRemoved: 2 }),
          ],
        }),
      ],
    }),

    /** Failed response */
    failedResponse: buildSession({
      messages: [
        buildRequest({ message: 'Do something impossible' }),
        buildResponse({
          state: 'failed',
          content: [],
          error: {
            message: 'An unexpected error occurred. Please try again.',
            level: 'error',
          },
        }),
      ],
    }),

    /** Cancelled response */
    cancelledResponse: buildSession({
      messages: [
        buildRequest({ message: 'Write a novel' }),
        buildResponse({
          state: 'cancelled',
          content: [buildMarkdown('I was starting to write...')],
        }),
      ],
    }),
  };
}
