/**
 * ResponseFooter — footer bar with copy/vote actions and response metadata.
 *
 * @module components/messages/ResponseFooter
 */

import { memo, useCallback, useState } from 'react';
import type { ChatResponse } from '../../types/models';
import { cn } from '../../utils/cn';
import { useChatContext } from '../../provider/useChatContext';
import { useChatActions } from '../../provider/useChatActions';
import { IconButton } from '../atoms/IconButton';
import { Timestamp } from '../atoms/Timestamp';

export interface ResponseFooterProps {
  /** The response data */
  response: ChatResponse;
  /** Additional CSS class */
  className?: string;
}

/** Format milliseconds into a human-readable duration */
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.round(ms / 100) / 10;
  return `${seconds}s`;
}

export const ResponseFooter = memo(function ResponseFooter({
  response,
  className,
}: ResponseFooterProps) {
  const { config, callbacks } = useChatContext();
  const actions = useChatActions();
  const [copied, setCopied] = useState(false);

  const handleCopyAll = useCallback(async () => {
    const textParts = response.content
      .filter((p) => p.kind === 'markdown')
      .map((p) => (p as { content: string }).content)
      .join('\n\n');
    try {
      await navigator.clipboard.writeText(textParts);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may not be available
    }
  }, [response.content]);

  return (
    <div className={cn('ac-response-footer', className)} data-testid="response-footer">
      <div className="ac-response-footer__toolbar">
        {config.showCopyButton && (
          <IconButton
            icon={copied ? '✓' : '📋'}
            label={copied ? 'Copied!' : 'Copy Response'}
            onClick={handleCopyAll}
            size="small"
          />
        )}
        {config.showVoteButtons && callbacks.onVote && (
          <>
            <IconButton
              icon="👍"
              label="Helpful"
              variant={response.vote === 'up' ? 'primary' : 'default'}
              onClick={() => actions.vote(response.id, 'up')}
              size="small"
            />
            <IconButton
              icon="👎"
              label="Not Helpful"
              variant={response.vote === 'down' ? 'danger' : 'default'}
              onClick={() => actions.vote(response.id, 'down')}
              size="small"
            />
          </>
        )}
      </div>

      {config.showResponseDetails && (
        <div className="ac-response-footer__details">
          <span className="ac-response-footer__time">
            <Timestamp time={response.completedAt ?? response.timestamp} />
          </span>
          {response.agent && (
            <span className="ac-response-footer__model">{response.agent.name}</span>
          )}
          {response.elapsedMs != null && (
            <span className="ac-response-footer__elapsed">
              {formatDuration(response.elapsedMs)}
            </span>
          )}
          {config.showTokenUsage && response.usage && (
            <span className="ac-response-footer__tokens">
              {response.usage.totalTokens ??
                response.usage.promptTokens + response.usage.completionTokens}{' '}
              tokens
            </span>
          )}
        </div>
      )}
    </div>
  );
});
