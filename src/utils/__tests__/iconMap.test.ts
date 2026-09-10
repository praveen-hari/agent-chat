/**
 * Tests for iconMap utilities.
 */

import { describe, test, expect } from 'vitest';
import { resolveToolIcon, resolveFileIcon, resolveChangeStatusIcon } from '../iconMap';

describe('resolveToolIcon', () => {
  test('returns search icon for search tools', () => {
    expect(resolveToolIcon('grep_search')).toBe('🔍');
    expect(resolveToolIcon('semantic_search')).toBe('🔍');
    expect(resolveToolIcon('find_references')).toBe('🔍');
  });

  test('returns read icon for read tools', () => {
    expect(resolveToolIcon('read_file')).toBe('📖');
    expect(resolveToolIcon('get_file_contents')).toBe('📖');
  });

  test('returns edit icon for edit tools', () => {
    expect(resolveToolIcon('edit_file')).toBe('✏️');
    expect(resolveToolIcon('create_file')).toBe('✏️');
  });

  test('returns terminal icon for terminal tools', () => {
    expect(resolveToolIcon('run_in_terminal')).toBe('💻');
    expect(resolveToolIcon('shell_command')).toBe('💻');
  });

  test('returns browser icon for browser tools', () => {
    expect(resolveToolIcon('open_browser')).toBe('🌐');
    expect(resolveToolIcon('fetch_url')).toBe('🌐');
  });

  test('returns test icon for test tools', () => {
    expect(resolveToolIcon('run_test')).toBe('🧪');
  });

  test('returns git icon for git tools', () => {
    expect(resolveToolIcon('git_commit')).toBe('📦');
  });

  test('returns default wrench for unknown tools', () => {
    expect(resolveToolIcon('some_random_tool')).toBe('🔧');
  });

  test('returns deploy icon for build tools', () => {
    expect(resolveToolIcon('deploy_app')).toBe('🚀');
    expect(resolveToolIcon('build_project')).toBe('🚀');
  });

  test('returns auth icon for auth tools', () => {
    expect(resolveToolIcon('login_user')).toBe('🔐');
  });
});

describe('resolveFileIcon', () => {
  test('returns TypeScript icon for .ts files', () => {
    expect(resolveFileIcon('utils.ts')).toBe('📘');
    expect(resolveFileIcon('App.tsx')).toBe('📘');
  });

  test('returns JavaScript icon for .js files', () => {
    expect(resolveFileIcon('index.js')).toBe('📒');
  });

  test('returns CSS icon for .css files', () => {
    expect(resolveFileIcon('styles.css')).toBe('🎨');
  });

  test('returns Python icon for .py files', () => {
    expect(resolveFileIcon('main.py')).toBe('🐍');
  });

  test('returns default icon for unknown extensions', () => {
    expect(resolveFileIcon('README')).toBe('📄');
    expect(resolveFileIcon('unknown.xyz')).toBe('📄');
  });

  test('returns markdown icon for .md files', () => {
    expect(resolveFileIcon('README.md')).toBe('📝');
  });
});

describe('resolveChangeStatusIcon', () => {
  test('returns + for created', () => {
    expect(resolveChangeStatusIcon('created')).toBe('+');
  });

  test('returns ✓ for modified', () => {
    expect(resolveChangeStatusIcon('modified')).toBe('✓');
  });

  test('returns × for deleted', () => {
    expect(resolveChangeStatusIcon('deleted')).toBe('×');
  });

  test('returns → for renamed', () => {
    expect(resolveChangeStatusIcon('renamed')).toBe('→');
  });
});
