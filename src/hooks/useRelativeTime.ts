/**
 * useRelativeTime — live-updating relative time string.
 *
 * @module hooks/useRelativeTime
 */

import { useState, useEffect } from 'react';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Format a timestamp into a relative time string.
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 10 * SECOND) return 'Just now';
  if (diff < MINUTE) return `${Math.floor(diff / SECOND)}s ago`;
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m ago`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`;
  if (diff < 2 * DAY) return 'Yesterday';
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)} days ago`;

  const date = new Date(timestamp);
  const thisYear = new Date().getFullYear();
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const month = months[date.getMonth()];
  const day = date.getDate();

  if (date.getFullYear() === thisYear) {
    return `${month} ${day}`;
  }
  return `${month} ${day}, ${date.getFullYear()}`;
}

/**
 * Determine the update interval based on the age of the timestamp.
 */
function getUpdateInterval(timestamp: number): number | null {
  const diff = Date.now() - timestamp;

  if (diff < MINUTE) return 10 * SECOND;
  if (diff < HOUR) return 30 * SECOND;
  if (diff < 2 * DAY) return MINUTE;
  // Static for older timestamps
  return null;
}

/**
 * Hook that returns a live-updating relative time string.
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted relative time string
 */
export function useRelativeTime(timestamp: number): string {
  const [formatted, setFormatted] = useState(() => formatRelativeTime(timestamp));

  useEffect(() => {
    setFormatted(formatRelativeTime(timestamp));

    const interval = getUpdateInterval(timestamp);
    if (interval === null) return;

    const id = setInterval(() => {
      setFormatted(formatRelativeTime(timestamp));

      // Check if we should stop updating
      const newInterval = getUpdateInterval(timestamp);
      if (newInterval === null) {
        clearInterval(id);
      }
    }, interval);

    return () => clearInterval(id);
  }, [timestamp]);

  return formatted;
}
