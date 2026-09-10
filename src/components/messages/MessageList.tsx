/**
 * MessageList — scrollable list of message rows.
 * Uses simple scrolling (react-virtuoso integration is optional Phase 10).
 *
 * @module components/messages/MessageList
 */

import { memo, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { useChatContext } from '../../provider/useChatContext';
import { RequestRow } from './RequestRow';
import { ResponseRow } from './ResponseRow';
import type { ChatMessage } from '../../types/models';

export interface MessageListProps {
  /** Additional CSS class */
  className?: string;
}

export const MessageList = memo(function MessageList({ className }: MessageListProps) {
  const { session, config, isStreaming } = useChatContext();
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

  // Auto-scroll to bottom on new messages or streaming updates
  useEffect(() => {
    if (isAtBottomRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [session.messages, isStreaming]);

  // Track whether user has scrolled away from bottom
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    isAtBottomRef.current = scrollHeight - scrollTop - clientHeight < 100;
  };

  const messages = session.messages;

  return (
    <div
      ref={scrollRef}
      className={cn('ac-message-list', className)}
      role="log"
      aria-label={config.ariaLabel ?? 'Chat messages'}
      aria-live="polite"
      onScroll={handleScroll}
      data-testid="message-list"
    >
      {messages.map((msg: ChatMessage, i: number) => {
        const isLast = i === messages.length - 1;
        // Ensure content is always an array
        const safeMsg = {
          ...msg,
          content: Array.isArray(msg.content) ? msg.content : [],
        };
        if (safeMsg.role === 'user') {
          return <RequestRow key={safeMsg.id} request={safeMsg} isLast={isLast} />;
        }
        return <ResponseRow key={safeMsg.id} response={safeMsg} isLast={isLast} />;
      })}
    </div>
  );
});
