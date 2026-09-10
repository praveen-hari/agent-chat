/**
 * RequestRow — renders a user message row.
 *
 * @module components/messages/RequestRow
 */

import { memo, useCallback } from 'react';
import type { ChatRequest } from '../../types/models';
import { cn } from '../../utils/cn';
import { useChatContext } from '../../provider/useChatContext';
import { useChatActions } from '../../provider/useChatActions';
import { MessageHeader } from './MessageHeader';
import { AttachmentsRow } from './AttachmentsRow';
import { ContentPartRenderer } from '../content-parts/ContentPartRenderer';
import { IconButton } from '../atoms/IconButton';
import { Timestamp } from '../atoms/Timestamp';
import { Chip } from '../atoms/Chip';

export interface RequestRowProps {
  /** The request message data */
  request: ChatRequest;
  /** Whether this is the last message in the list */
  isLast: boolean;
  /** Additional CSS class */
  className?: string;
}

export const RequestRow = memo(function RequestRow({
  request,
  isLast: _isLast,
  className,
}: RequestRowProps) {
  const { config, callbacks } = useChatContext();
  const actions = useChatActions();

  const handleEdit = useCallback(() => {
    actions.editRequest(request.id, request.message);
  }, [request.id, request.message, actions]);

  const handleDelete = useCallback(() => {
    actions.deleteRequest(request.id);
  }, [request.id, actions]);

  // Build a dummy response for ContentPartRenderer (request parts don't need it)
  const dummyResponse = {
    role: 'assistant' as const,
    id: '',
    requestId: request.id,
    timestamp: request.timestamp,
    state: 'complete' as const,
    content: [],
  };

  return (
    <div
      className={cn('ac-message-row', 'ac-message-row--request', className)}
      role="listitem"
      data-testid="request-row"
    >
      <MessageHeader
        avatar="👤"
        username="You"
        actions={
          <>
            {callbacks.onEditRequest && (
              <IconButton icon="✏️" label="Edit" onClick={handleEdit} size="small" />
            )}
            {callbacks.onDeleteRequest && (
              <IconButton icon="🗑" label="Delete" onClick={handleDelete} size="small" />
            )}
          </>
        }
      />

      {/* Request origin pill */}
      {request.origin && (
        <div className="ac-request-origin">
          <Chip icon={request.origin.icon ?? '↩'} label={request.origin.label} />
        </div>
      )}

      {/* Attachments */}
      {request.attachments && request.attachments.length > 0 && (
        <AttachmentsRow attachments={request.attachments} />
      )}

      {/* Message content */}
      <div className="ac-message-row__content">
        {Array.isArray(request.content) && request.content.map((part, i) => (
          <ContentPartRenderer
            key={`${part.kind}-${i}`}
            part={part}
            index={i}
            isStreaming={false}
            response={dummyResponse}
            isLast={i === request.content.length - 1}
          />
        ))}
      </div>

      {/* Timestamp */}
      {config.showResponseDetails && (
        <div className="ac-message-row__timestamp">
          <Timestamp time={request.timestamp} />
        </div>
      )}
    </div>
  );
});
