import { describe, test, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCollapsible } from '../useCollapsible';

describe('useCollapsible', () => {
  test('defaults to collapsed', () => {
    const { result } = renderHook(() => useCollapsible());
    expect(result.current.isExpanded).toBe(false);
  });

  test('respects defaultExpanded=true', () => {
    const { result } = renderHook(() => useCollapsible(true));
    expect(result.current.isExpanded).toBe(true);
  });

  test('toggle flips state', () => {
    const { result } = renderHook(() => useCollapsible(false));

    act(() => {
      result.current.toggle();
    });
    expect(result.current.isExpanded).toBe(true);

    act(() => {
      result.current.toggle();
    });
    expect(result.current.isExpanded).toBe(false);
  });

  test('expand forces expanded state', () => {
    const { result } = renderHook(() => useCollapsible(false));

    act(() => {
      result.current.expand();
    });
    expect(result.current.isExpanded).toBe(true);
  });

  test('collapse forces collapsed state', () => {
    const { result } = renderHook(() => useCollapsible(true));

    act(() => {
      result.current.collapse();
    });
    expect(result.current.isExpanded).toBe(false);
  });

  test('fires onToggle callback with new state', () => {
    const onToggle = vi.fn();
    const { result } = renderHook(() => useCollapsible(false, { onToggle }));

    act(() => {
      result.current.toggle();
    });
    expect(onToggle).toHaveBeenCalledWith(true);

    act(() => {
      result.current.collapse();
    });
    expect(onToggle).toHaveBeenCalledWith(false);
  });

  test('provides style with height animation', () => {
    const { result } = renderHook(() => useCollapsible(false));

    expect(result.current.style).toEqual({
      height: '0',
      overflow: 'hidden',
    });

    act(() => {
      result.current.expand();
    });
    expect(result.current.style.height).toBe('auto');
  });

  test('provides contentRef', () => {
    const { result } = renderHook(() => useCollapsible());
    expect(result.current.contentRef).toBeDefined();
    expect(result.current.contentRef.current).toBeNull();
  });
});
