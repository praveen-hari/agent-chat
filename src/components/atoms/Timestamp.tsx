/**
 * Timestamp — displays relative or absolute time with tooltip.
 *
 * @module components/atoms/Timestamp
 */

import { memo } from 'react';
import { cn } from '../../utils/cn';

export interface TimestampProps {
  /** Unix timestamp in milliseconds */
  time: number;
  /** Display format (default: 'relative') */
  format?: 'relative' | 'absolute' | 'both';
  /** Additional CSS class */
  className?: string;
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 10) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 2) return 'Yesterday';
  if (days < 7) return `${days} days ago`;

  const date = new Date(timestamp);
  const currentYear = new Date().getFullYear();
  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = date.getDate();
  return date.getFullYear() === currentYear
    ? `${month} ${day}`
    : `${month} ${day}, ${date.getFullYear()}`;
}

function formatAbsoluteTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

export const Timestamp = memo(function Timestamp({
  time,
  format = 'relative',
  className,
}: TimestampProps) {
  const absoluteStr = formatAbsoluteTime(time);
  const relativeStr = formatRelativeTime(time);

  const display = format === 'absolute' ? absoluteStr : relativeStr;
  const tooltip = format === 'relative' ? absoluteStr : undefined;

  return (
    <time
      className={cn('ac-timestamp', className)}
      dateTime={new Date(time).toISOString()}
      title={tooltip}
    >
      {display}
      {format === 'both' && <span className="ac-timestamp__absolute"> ({absoluteStr})</span>}
    </time>
  );
});
