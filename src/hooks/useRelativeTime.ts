/**
 * Hook that returns a live-updating relative time string.
 *
 * @module hooks/useRelativeTime
 */

import { useEffect, useState } from 'react';

/** Format an age in ms to a relative time string */
function formatRelativeTime(ageMs: number): string {
  const seconds = Math.floor(ageMs / 1000);

  if (seconds < 10) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;

  // 7+ days: show date
  const date = new Date(Date.now() - ageMs);
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}

/** Determine how often to re-format based on the age bucket */
function getUpdateInterval(ageMs: number): number | null {
  const seconds = Math.floor(ageMs / 1000);
  if (seconds < 60) return 10_000; // 10s
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return 30_000; // 30s
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return 60_000; // 60s
  return null; // Static — no updates needed
}

/**
 * Returns a relative time string ("Just now", "2m ago", "1h ago") that
 * updates automatically as time passes.
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted relative time string
 *
 * @example
 * const timeAgo = useRelativeTime(message.timestamp);
 * // "Just now" → "30s ago" → "2m ago" → "1h ago" → "Yesterday"
 */
export function useRelativeTime(timestamp: number): string {
  const [age, setAge] = useState(() => Date.now() - timestamp);

  useEffect(() => {
    // Sync age when timestamp changes
    setAge(Date.now() - timestamp);

    const interval = getUpdateInterval(Date.now() - timestamp);
    if (interval === null) return;

    const id = setInterval(() => {
      setAge(Date.now() - timestamp);
    }, interval);

    return () => clearInterval(id);
  }, [timestamp]);

  return formatRelativeTime(age);
}

/** Format a timestamp as an absolute date/time string */
export function formatAbsoluteTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}
