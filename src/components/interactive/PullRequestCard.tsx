/**
 * PullRequestCard — displays a linked pull request.
 *
 * @module components/interactive/PullRequestCard
 */

import { memo, useCallback } from 'react';
import type { PullRequestPart } from '../../types/content-parts';
import { cn } from '../../utils/cn';

export interface PullRequestCardProps extends PullRequestPart {
  /** Additional CSS class */
  className?: string;
}

const STATE_ICONS: Record<string, string> = {
  open: '🔀',
  merged: '🟣',
  closed: '🔴',
};

export const PullRequestCard = memo(function PullRequestCard({
  title,
  author,
  url,
  state = 'open',
  className,
}: PullRequestCardProps) {
  const handleClick = useCallback(() => {
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [url]);

  return (
    <div
      className={cn('ac-pull-request', className)}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      role="link"
      tabIndex={0}
      data-testid="pull-request-card"
    >
      <span className="ac-pull-request__icon" aria-hidden="true">
        {STATE_ICONS[state] ?? '🔀'}
      </span>
      <span className="ac-pull-request__title">{title}</span>
      <span className="ac-pull-request__author">by {author}</span>
    </div>
  );
});
