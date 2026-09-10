/**
 * PlanReviewCard — large card for plan review with approve/reject workflow.
 *
 * @module components/content-parts/PlanReviewCard
 */

import { memo, useCallback } from 'react';
import type { PlanReviewPart } from '../../types/content-parts';
import { cn } from '../../utils/cn';
import { Badge } from '../atoms/Badge';
import { IconButton } from '../atoms/IconButton';
import { useChatContext } from '../../provider/useChatContext';

export interface PlanReviewCardProps extends PlanReviewPart {
  /** Additional CSS class */
  className?: string;
}

export const PlanReviewCard = memo(function PlanReviewCard({
  title,
  content,
  isOutdated,
  status,
  comments,
  className,
}: PlanReviewCardProps) {
  const { callbacks } = useChatContext();

  const handleApprove = useCallback(() => {
    callbacks.onPlanAction?.(title, 'approve');
  }, [title, callbacks]);

  const handleReject = useCallback(() => {
    callbacks.onPlanAction?.(title, 'reject');
  }, [title, callbacks]);

  return (
    <div
      className={cn('ac-plan-review', 'ac-card', 'ac-card-large', className)}
      data-testid="plan-review-card"
    >
      <div className="ac-plan-review__header">
        <span className="ac-plan-review__title">{title}</span>
        {isOutdated && <Badge text="Outdated" variant="warning" />}
      </div>
      <div className="ac-plan-review__body">{content}</div>
      {comments && comments.length > 0 && (
        <div className="ac-plan-review__comments">
          {comments.map((c) => (
            <div key={c.id} className="ac-plan-review__comment">
              <span className="ac-plan-review__comment-author">{c.author}</span>
              <span className="ac-plan-review__comment-text">{c.text}</span>
            </div>
          ))}
        </div>
      )}
      {status === 'pending' && (
        <div className="ac-plan-review__footer">
          <IconButton
            icon="✓"
            label="Approve"
            variant="primary"
            onClick={handleApprove}
            showLabel
          />
          <IconButton icon="✕" label="Reject" variant="danger" onClick={handleReject} showLabel />
        </div>
      )}
    </div>
  );
});
