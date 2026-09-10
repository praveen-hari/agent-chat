/**
 * Displays relative or absolute time with live updates.
 *
 * @module components/atoms/Timestamp
 */

import { memo } from 'react';
import { useRelativeTime, formatAbsoluteTime } from '../../hooks/useRelativeTime';
import { cn } from '../../utils/cn';

export interface TimestampProps {
  /** Unix timestamp in milliseconds */
  time: number;
  /** Display format (default: 'relative') */
  format?: 'relative' | 'absolute' | 'both';
  /** Additional CSS class */
  className?: string;
}

/**
 * Renders a timestamp — relative ("2m ago"), absolute, or both.
 * Relative times update automatically as time passes.
 * Tooltip shows the absolute time on hover.
 *
 * @example
 * ```tsx
 * <Timestamp time={message.timestamp} />
 * ```
 */
export const Timestamp = memo(function Timestamp({
  time,
  format = 'relative',
  className,
}: TimestampProps) {
  const relative = useRelativeTime(time);
  const absolute = formatAbsoluteTime(time);

  const display =
    format === 'relative'
      ? relative
      : format === 'absolute'
        ? absolute
        : `${relative} (${absolute})`;

  return (
    <time className={cn('ac-timestamp', className)} dateTime={new Date(time).toISOString()}>
      <span title={absolute}>{display}</span>
    </time>
  );
});
