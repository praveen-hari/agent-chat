/**
 * ResponseRow — renders an assistant response row with all content parts.
 *
 * @module components/messages/ResponseRow
 */

import { memo, useCallback } from 'react';
import type { ChatResponse } from '../../types/models';
import { cn } from '../../utils/cn';
import { useChatContext } from '../../provider/useChatContext';
import { useChatActions } from '../../provider/useChatActions';
import { MessageHeader } from './MessageHeader';
import { ResponseFooter } from './ResponseFooter';
import { ContentPartRenderer } from '../content-parts/ContentPartRenderer';
import { ErrorMessage } from '../notifications/ErrorMessage';
import { IconButton } from '../atoms/IconButton';

export interface ResponseRowProps {
  /** The response message data */
  response: ChatResponse;
  /** Whether this is the last response */
  isLast: boolean;
  /** Additional CSS class */
  className?: string;
}

export const ResponseRow = memo(function ResponseRow({
  response,
  isLast,
  className,
}: ResponseRowProps) {
  const { callbacks } = useChatContext();
  const actions = useChatActions();

  const handleRetry = useCallback(() => {
    actions.retryResponse(response.id);
  }, [response.id, actions]);

  const handleCancel = useCallback(() => {
    actions.cancelResponse(response.id);
  }, [response.id, actions]);

  const agentIcon = response.agent?.icon ?? '🤖';
  const agentName = response.agent?.name ?? 'Assistant';
  const isStreaming = response.state === 'streaming';
  const isComplete = response.state === 'complete' || response.state === 'failed';

  return (
    <div
      className={cn(
        'ac-message-row',
        'ac-message-row--response',
        isStreaming && 'ac-message-row--streaming',
        isLast && 'ac-message-row--last',
        className,
      )}
      role="listitem"
      aria-busy={isStreaming}
      data-testid="response-row"
    >
      <MessageHeader
        avatar={typeof agentIcon === 'string' ? agentIcon : '🤖'}
        username={agentName}
        actions={
          <>
            {isStreaming && (
              <IconButton icon="⏹" label="Cancel" onClick={handleCancel} size="small" />
            )}
            {callbacks.onRetryResponse && !isStreaming && (
              <IconButton icon="🔄" label="Retry" onClick={handleRetry} size="small" />
            )}
          </>
        }
      />

      {/* Content parts */}
      <div className="ac-message-row__content">
        {Array.isArray(response.content) && response.content.map((part, i) => (
          <ContentPartRenderer
            key={`${part.kind}-${i}`}
            part={part}
            index={i}
            isStreaming={isStreaming}
            response={response}
            isLast={i === response.content.length - 1}
          />
        ))}
      </div>

      {/* Error display */}
      {response.error && response.state === 'failed' && (
        <ErrorMessage kind="error" message={response.error.message} level={response.error.level} />
      )}

      {/* Response footer */}
      {isComplete && isLast && <ResponseFooter response={response} />}

      {/* Follow-up suggestions */}
      {response.followups &&
        response.followups.length > 0 &&
        response.state === 'complete' &&
        isLast && (
          <div className="ac-followups">
            {response.followups.map((f) => (
              <button
                key={f.id}
                className="ac-followup-btn"
                onClick={() => actions.followupClick(f)}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
    </div>
  );
});
