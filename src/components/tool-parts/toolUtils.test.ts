/**
 * Tests for tool utility functions.
 */

import { describe, test, expect } from 'vitest';
import { resolveToolIcon, isTerminalTool, truncate, formatToolStatus } from './toolUtils';

describe('resolveToolIcon', () => {
  test('returns explicit icon when provided', () => {
    expect(resolveToolIcon('any_tool', '⭐')).toBe('⭐');
  });

  test('returns search icon for search tools', () => {
    expect(resolveToolIcon('grep_search')).toBe('search');
    expect(resolveToolIcon('semantic_search')).toBe('search');
    expect(resolveToolIcon('find_references')).toBe('search');
  });

  test('returns read icon for read tools', () => {
    expect(resolveToolIcon('read_file')).toBe('file-code');
    expect(resolveToolIcon('get_file_contents')).toBe('file-code');
  });

  test('returns edit icon for edit tools', () => {
    expect(resolveToolIcon('edit_file')).toBe('edit');
    expect(resolveToolIcon('create_file')).toBe('edit');
    expect(resolveToolIcon('replace_string')).toBe('edit');
  });

  test('returns terminal icon for terminal tools', () => {
    expect(resolveToolIcon('run_in_terminal')).toBe('terminal');
  });

  test('returns browser icon for browser tools', () => {
    expect(resolveToolIcon('open_browser')).toBe('globe');
  });

  test('returns test icon for test tools', () => {
    expect(resolveToolIcon('run_test')).toBe('beaker');
  });

  test('returns default wrench for unknown tools', () => {
    expect(resolveToolIcon('custom_tool')).toBe('wrench');
  });
});

describe('isTerminalTool', () => {
  test('returns true for terminal tools', () => {
    expect(isTerminalTool('run_in_terminal')).toBe(true);
    expect(isTerminalTool('shell_command')).toBe(true);
    expect(isTerminalTool('run_command')).toBe(true);
  });

  test('returns false for non-terminal tools', () => {
    expect(isTerminalTool('read_file')).toBe(false);
    expect(isTerminalTool('edit_file')).toBe(false);
  });
});

describe('truncate', () => {
  test('returns original string if under limit', () => {
    expect(truncate('short', 10)).toBe('short');
  });

  test('truncates with ellipsis when over limit', () => {
    expect(truncate('a very long string', 10)).toBe('a very lon…');
  });

  test('handles exact length', () => {
    expect(truncate('exact', 5)).toBe('exact');
  });
});

describe('formatToolStatus', () => {
  test('formats known statuses', () => {
    expect(formatToolStatus('streaming')).toBe('Preparing…');
    expect(formatToolStatus('confirming')).toBe('Awaiting approval');
    expect(formatToolStatus('running')).toBe('Running');
    expect(formatToolStatus('complete')).toBe('Complete');
    expect(formatToolStatus('failed')).toBe('Failed');
    expect(formatToolStatus('cancelled')).toBe('Cancelled');
  });

  test('returns raw string for unknown status', () => {
    expect(formatToolStatus('unknown')).toBe('unknown');
  });
});
