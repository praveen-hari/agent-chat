import { describe, test, expect } from 'vitest';
import { cn } from '../cn';

describe('cn', () => {
  test('joins class names with space', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  test('filters out false values', () => {
    const shouldHide = false;
    expect(cn('base', shouldHide && 'hidden')).toBe('base');
  });

  test('filters out undefined values', () => {
    expect(cn('base', undefined, 'other')).toBe('base other');
  });

  test('filters out null values', () => {
    expect(cn('base', null, 'other')).toBe('base other');
  });

  test('handles conditional classes', () => {
    const isActive = true;
    const isDisabled = false;
    expect(cn('btn', isActive && 'btn--active', isDisabled && 'btn--disabled')).toBe(
      'btn btn--active',
    );
  });

  test('returns empty string for no truthy values', () => {
    expect(cn(false, null, undefined)).toBe('');
  });

  test('returns empty string for no arguments', () => {
    expect(cn()).toBe('');
  });

  test('handles single class', () => {
    expect(cn('only')).toBe('only');
  });
});
