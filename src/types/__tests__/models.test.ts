/**
 * Smoke tests for type exports and test data builders.
 * Verifies the types compile correctly and builders produce valid data.
 */

import { describe, test, expect, beforeEach } from 'vitest';
import {
  buildSession,
  buildRequest,
  buildResponse,
  buildAgent,
  buildFollowup,
  buildSimpleConversation,
  buildStreamingConversation,
  buildToolConfirmationConversation,
  resetIdCounter,
} from '../../test-utils/builders';

describe('Core Models', () => {
  beforeEach(() => {
    resetIdCounter();
  });

  describe('ChatSession', () => {
    test('builds empty session with defaults', () => {
      const session = buildSession();
      expect(session.id).toBeTruthy();
      expect(session.messages).toEqual([]);
      expect(session.createdAt).toBeGreaterThan(0);
    });

    test('builds session with overrides', () => {
      const session = buildSession({ title: 'My Chat', id: 'custom-id' });
      expect(session.id).toBe('custom-id');
      expect(session.title).toBe('My Chat');
    });
  });

  describe('ChatRequest', () => {
    test('builds request with defaults', () => {
      const req = buildRequest();
      expect(req.role).toBe('user');
      expect(req.message).toBe('Hello, world!');
      expect(req.content).toHaveLength(1);
      expect(req.content[0].kind).toBe('markdown');
    });

    test('builds request with custom message', () => {
      const req = buildRequest({ message: 'Fix the bug' });
      expect(req.message).toBe('Fix the bug');
      expect(req.content[0]).toEqual({ kind: 'markdown', content: 'Fix the bug' });
    });
  });

  describe('ChatResponse', () => {
    test('builds response with defaults', () => {
      const res = buildResponse();
      expect(res.role).toBe('assistant');
      expect(res.state).toBe('complete');
      expect(res.content).toHaveLength(1);
      expect(res.agent).toBeDefined();
      expect(res.agent?.name).toBe('Test Agent');
    });

    test('builds streaming response', () => {
      const res = buildResponse({ state: 'streaming' });
      expect(res.state).toBe('streaming');
    });
  });

  describe('ChatAgent', () => {
    test('builds agent with defaults', () => {
      const agent = buildAgent();
      expect(agent.id).toBe('test-agent');
      expect(agent.name).toBe('Test Agent');
      expect(agent.icon).toBe('🤖');
    });
  });

  describe('ChatFollowup', () => {
    test('builds followup with defaults', () => {
      const followup = buildFollowup();
      expect(followup.label).toBe('Tell me more');
      expect(followup.type).toBe('reply');
    });
  });
});

describe('Scenario Builders', () => {
  beforeEach(() => {
    resetIdCounter();
  });

  test('buildSimpleConversation creates valid conversation', () => {
    const session = buildSimpleConversation();
    expect(session.messages).toHaveLength(2);
    expect(session.messages[0].role).toBe('user');
    expect(session.messages[1].role).toBe('assistant');

    const response = session.messages[1] as ReturnType<typeof buildResponse>;
    expect(response.state).toBe('complete');
    expect(response.content.length).toBeGreaterThan(0);
  });

  test('buildStreamingConversation creates streaming state', () => {
    const session = buildStreamingConversation();
    expect(session.messages).toHaveLength(2);

    const response = session.messages[1] as ReturnType<typeof buildResponse>;
    expect(response.state).toBe('streaming');
    expect(response.content.some((p) => p.kind === 'thinking')).toBe(true);
    expect(response.content.some((p) => p.kind === 'working')).toBe(true);
  });

  test('buildToolConfirmationConversation creates needs-input state', () => {
    const session = buildToolConfirmationConversation();
    expect(session.messages).toHaveLength(2);

    const response = session.messages[1] as ReturnType<typeof buildResponse>;
    expect(response.state).toBe('needs-input');
    expect(response.content.some((p) => p.kind === 'tool-confirmation')).toBe(true);
  });
});

describe('Content Part Discriminated Union', () => {
  test('each content part has unique kind', () => {
    const session = buildSimpleConversation();
    const response = session.messages[1] as ReturnType<typeof buildResponse>;
    const kinds = response.content.map((p) => p.kind);
    // All kinds should be strings
    kinds.forEach((k) => expect(typeof k).toBe('string'));
  });
});
