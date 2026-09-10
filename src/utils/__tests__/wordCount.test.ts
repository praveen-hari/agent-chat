/**
 * Tests for wordCount utilities.
 */

import { describe, test, expect } from 'vitest';
import { countWords, getNWords, getProgressiveRenderRate } from '../wordCount';

describe('countWords', () => {
  test('counts words in a simple sentence', () => {
    expect(countWords('hello world foo')).toBe(3);
  });

  test('returns 0 for empty string', () => {
    expect(countWords('')).toBe(0);
  });

  test('handles multiple spaces', () => {
    expect(countWords('  hello   world  ')).toBe(2);
  });

  test('handles newlines and tabs', () => {
    expect(countWords('hello\nworld\tfoo')).toBe(3);
  });

  test('counts markdown text', () => {
    expect(countWords('**bold** and *italic* text')).toBe(4);
  });

  test('counts single word', () => {
    expect(countWords('hello')).toBe(1);
  });
});

describe('getNWords', () => {
  test('gets first N words', () => {
    expect(getNWords('one two three four five', 3)).toBe('one two three');
  });

  test('returns full text when N exceeds word count', () => {
    expect(getNWords('one two', 5)).toBe('one two');
  });

  test('returns empty for N=0', () => {
    expect(getNWords('hello world', 0)).toBe('');
  });

  test('returns empty for empty string', () => {
    expect(getNWords('', 5)).toBe('');
  });

  test('handles single word', () => {
    expect(getNWords('hello', 1)).toBe('hello');
  });

  test('preserves markdown structure', () => {
    const result = getNWords('**bold** text here more words', 3);
    expect(result).toBe('**bold** text here');
  });
});

describe('getProgressiveRenderRate', () => {
  test('returns rate above minimum', () => {
    expect(getProgressiveRenderRate(10)).toBeGreaterThanOrEqual(40);
  });

  test('caps at maximum rate', () => {
    expect(getProgressiveRenderRate(5000)).toBeLessThanOrEqual(2000);
  });

  test('scales with load rate', () => {
    const slow = getProgressiveRenderRate(20);
    const fast = getProgressiveRenderRate(200);
    expect(fast).toBeGreaterThan(slow);
  });

  test('uses custom min/max', () => {
    expect(getProgressiveRenderRate(10, 100, 500)).toBeGreaterThanOrEqual(100);
    expect(getProgressiveRenderRate(10000, 100, 500)).toBeLessThanOrEqual(500);
  });
});
