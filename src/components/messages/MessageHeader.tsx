/**
 * MessageHeader — shared header for request and response rows.
 * Displays avatar, username, optional detail text, and toolbar actions.
 *
 * @module components/messages/MessageHeader
 */

import { memo } from 'react';
import { cn } from '../../utils/cn';
import { Avatar } from '../atoms/Avatar';
import { Username } from '../atoms/Username';

export interface MessageHeaderProps {
  /** Avatar icon (emoji, URL object, or icon ID object) */
  avatar: string | { src: string } | { iconId: string };
  /** Display name */
  username: string;
  /** Detail text (e.g., "Using tool X...") */
  detail?: string;
  /** Header toolbar actions (shown on hover) */
  actions?: React.ReactNode;
  /** Additional CSS class */
  className?: string;
}

export const MessageHeader = memo(function MessageHeader({
  avatar,
  username,
  detail,
  actions,
  className,
}: MessageHeaderProps) {
  return (
    <div className={cn('ac-message-header', className)} data-testid="message-header">
      <div className="ac-message-header__user">
        <Avatar icon={avatar} name={username} size={24} />
        <Username name={username} />
      </div>
      {detail && (
        <div className="ac-message-header__detail">
          <span>{detail}</span>
        </div>
      )}
      {actions && <div className="ac-message-header__toolbar">{actions}</div>}
    </div>
  );
});
