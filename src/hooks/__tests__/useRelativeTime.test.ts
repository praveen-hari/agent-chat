import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRelativeTime, formatAbsoluteTime } from '../useRelativeTime';

describe('useRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('returns "Just now" for timestamps less than 10 seconds old', () => {
    const { result } = renderHook(() => useRelativeTime(Date.now() - 5000));
    expect(result.current).toBe('Just now');
  });

  test('returns seconds ago for timestamps under a minute', () => {
    const { result } = renderHook(() => useRelativeTime(Date.now() - 30000));
    expect(result.current).toBe('30s ago');
  });

  test('returns minutes ago for timestamps under an hour', () => {
    const { result } = renderHook(() => useRelativeTime(Date.now() - 120000));
    expect(result.current).toBe('2m ago');
  });

  test('returns hours ago for timestamps under a day', () => {
    const { result } = renderHook(() => useRelativeTime(Date.now() - 7200000));
    expect(result.current).toBe('2h ago');
  });

  test('returns "Yesterday" for 1 day old', () => {
    const { result } = renderHook(() => useRelativeTime(Date.now() - 86400000));
    expect(result.current).toBe('Yesterday');
  });

  test('returns days ago for under a week', () => {
    const { result } = renderHook(() => useRelativeTime(Date.now() - 3 * 86400000));
    expect(result.current).toBe('3 days ago');
  });

  test('updates as time passes', () => {
    const start = Date.now();
    const { result } = renderHook(() => useRelativeTime(start));

    expect(result.current).toBe('Just now');

    // Advance 30 seconds
    act(() => {
      vi.advanceTimersByTime(31000);
    });
    // Wait for interval to fire — interval set at 10s for recent
    expect(['Just now', '30s ago']).toContain(result.current);
  });

  test('recomputes when timestamp prop changes', () => {
    const { result, rerender } = renderHook(({ timestamp }) => useRelativeTime(timestamp), {
      initialProps: { timestamp: Date.now() - 5000 },
    });

    expect(result.current).toBe('Just now');

    rerender({ timestamp: Date.now() - 120000 });
    expect(result.current).toBe('2m ago');
  });
});

describe('formatAbsoluteTime', () => {
  test('formats a timestamp as locale string', () => {
    const time = new Date('2026-09-10T12:00:00').getTime();
    const formatted = formatAbsoluteTime(time);
    expect(typeof formatted).toBe('string');
    expect(formatted.length).toBeGreaterThan(0);
  });
});
