/**
 * AttachmentBar — row of attached file/image chips below the textarea.
 * Only visible when attachments exist.
 *
 * @module components/input/AttachmentBar
 */

import { memo } from 'react';
import type { ChatAttachment } from '../../types/models';
import { cn } from '../../utils/cn';
import { AttachmentsRow } from '../messages/AttachmentsRow';

export interface AttachmentBarProps {
  /** Current attachments */
  attachments: ChatAttachment[];
  /** Remove handler */
  onRemove: (id: string) => void;
  /** Additional CSS class */
  className?: string;
}

export const AttachmentBar = memo(function AttachmentBar({
  attachments,
  onRemove,
  className,
}: AttachmentBarProps) {
  if (attachments.length === 0) return null;

  return (
    <div className={cn('ac-attachment-bar', className)} data-testid="attachment-bar">
      <AttachmentsRow attachments={attachments} editable onRemove={onRemove} />
    </div>
  );
});
