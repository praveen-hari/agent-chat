/**
 * Tests for hooks: useRelativeTime, useCopyToClipboard, useCollapsible, useVirtualList.
 * (useStreaming and useAutoScroll require more complex DOM/timing setup — tested via integration)
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRelativeTime, formatRelativeTime } from '../useRelativeTime';
import { useCopyToClipboard } from '../useCopyToClipboard';
import { useCollapsible } from '../useCollapsible';
import { useVirtualList } from '../useVirtualList';

// ─── formatRelativeTime (pure function) ───

describe('formatRelativeTime', () => {
  test('returns "Just now" for very recent timestamps', () => {
    expect(formatRelativeTime(Date.now() - 3000)).toBe('Just now');
  });

  test('returns seconds ago for <60s', () => {
    const result = formatRelativeTime(Date.now() - 30000);
    expect(result).toMatch(/\d+s ago/);
  });

  test('returns minutes ago for <60m', () => {
    const result = formatRelativeTime(Date.now() - 5 * 60 * 1000);
    expect(result).toMatch(/\d+m ago/);
  });

  test('returns hours ago for <24h', () => {
    const result = formatRelativeTime(Date.now() - 3 * 60 * 60 * 1000);
    expect(result).toMatch(/\d+h ago/);
  });

  test('returns "Yesterday" for <48h', () => {
    const result = formatRelativeTime(Date.now() - 30 * 60 * 60 * 1000);
    expect(result).toBe('Yesterday');
  });

  test('returns days ago for <7d', () => {
    const result = formatRelativeTime(Date.now() - 4 * 24 * 60 * 60 * 1000);
    expect(result).toMatch(/\d+ days ago/);
  });

  test('returns date string for older timestamps', () => {
    const result = formatRelativeTime(Date.now() - 30 * 24 * 60 * 60 * 1000);
    expect(result).toMatch(/\w+ \d+/);
  });
});

// ─── useRelativeTime ───

describe('useRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('returns relative time string', () => {
    const now = Date.now();
    const { result } = renderHook(() => useRelativeTime(now));
    expect(result.current).toBe('Just now');
  });

  test('updates over time', () => {
    const timestamp = Date.now() - 5000;
    const { result } = renderHook(() => useRelativeTime(timestamp));
    expect(result.current).toBe('Just now');

    act(() => {
      vi.advanceTimersByTime(15000);
    });

    expect(result.current).toMatch(/\d+s ago/);
  });
});

// ─── useCopyToClipboard ───

describe('useCopyToClipboard', () => {
  test('isCopied is initially false', () => {
    const { result } = renderHook(() => useCopyToClipboard());
    expect(result.current.isCopied).toBe(false);
  });

  test('sets isCopied to true after copy', async () => {
    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy('hello');
    });

    expect(result.current.isCopied).toBe(true);
  });

  test('resets isCopied after feedback duration', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useCopyToClipboard(1000));

    await act(async () => {
      await result.current.copy('hello');
    });

    expect(result.current.isCopied).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1100);
    });

    expect(result.current.isCopied).toBe(false);
    vi.useRealTimers();
  });
});

// ─── useCollapsible ───

describe('useCollapsible', () => {
  test('starts collapsed by default', () => {
    const { result } = renderHook(() => useCollapsible());
    expect(result.current.isExpanded).toBe(false);
  });

  test('starts expanded when defaultExpanded is true', () => {
    const { result } = renderHook(() => useCollapsible(true));
    expect(result.current.isExpanded).toBe(true);
  });

  test('toggles expanded state', () => {
    const { result } = renderHook(() => useCollapsible(false));

    act(() => result.current.toggle());
    expect(result.current.isExpanded).toBe(true);

    act(() => result.current.toggle());
    expect(result.current.isExpanded).toBe(false);
  });

  test('expand sets expanded to true', () => {
    const { result } = renderHook(() => useCollapsible(false));

    act(() => result.current.expand());
    expect(result.current.isExpanded).toBe(true);
  });

  test('collapse sets expanded to false', () => {
    const { result } = renderHook(() => useCollapsible(true));

    act(() => result.current.collapse());
    expect(result.current.isExpanded).toBe(false);
  });

  test('calls onToggle callback', () => {
    const onToggle = vi.fn();
    const { result } = renderHook(() => useCollapsible(false, { onToggle }));

    act(() => result.current.toggle());
    expect(onToggle).toHaveBeenCalledWith(true);

    act(() => result.current.toggle());
    expect(onToggle).toHaveBeenCalledWith(false);
  });

  test('provides style with height transition', () => {
    const { result } = renderHook(() => useCollapsible(false));
    expect(result.current.style).toHaveProperty('overflow', 'hidden');
    expect(result.current.style).toHaveProperty('height', 0);
  });

  test('style height is auto when expanded', () => {
    const { result } = renderHook(() => useCollapsible(true));
    expect(result.current.style).toHaveProperty('height', 'auto');
  });
});

// ─── useVirtualList ───

describe('useVirtualList', () => {
  test('returns false for small lists', () => {
    const { result } = renderHook(() => useVirtualList(10));
    expect(result.current.shouldVirtualize).toBe(false);
  });

  test('returns true for large lists', () => {
    const { result } = renderHook(() => useVirtualList(100));
    expect(result.current.shouldVirtualize).toBe(true);
  });

  test('uses custom threshold', () => {
    const { result } = renderHook(() => useVirtualList(25, 20));
    expect(result.current.shouldVirtualize).toBe(true);
  });

  test('returns false at exactly threshold', () => {
    const { result } = renderHook(() => useVirtualList(50));
    expect(result.current.shouldVirtualize).toBe(false);
  });
});
