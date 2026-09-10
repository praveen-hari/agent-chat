/**
 * SystemNotification — renders system messages in three styles:
 * standard, separator, or collapsible.
 *
 * @module components/notifications/SystemNotification
 */

import { memo } from 'react';
import type { SystemNotificationPart } from '../../types/content-parts';
import { cn } from '../../utils/cn';
import { Icon } from '../atoms/Icon';
import { CollapsibleSection } from '../atoms/CollapsibleSection';

export interface SystemNotificationProps extends SystemNotificationPart {
  /** Additional CSS class */
  className?: string;
}

export const SystemNotification = memo(function SystemNotification({
  message,
  icon,
  style,
  detail,
  timing,
  className,
}: SystemNotificationProps) {
  if (style === 'separator') {
    return (
      <div
        className={cn('ac-workspace-transition', className)}
        role="separator"
        data-testid="system-notification"
      >
        <div className="ac-workspace-transition__line" />
        <span className="ac-workspace-transition__label">
          {icon && <span aria-hidden="true">{icon}</span>}
          {message}
        </span>
        <div className="ac-workspace-transition__line" />
      </div>
    );
  }

  if (style === 'collapsible') {
    return (
      <div className={className} data-testid="system-notification">
        <CollapsibleSection title={message} icon={icon}>
          {detail && <div className="ac-notification__message">{detail}</div>}
        </CollapsibleSection>
      </div>
    );
  }

  // Standard style
  return (
    <div
      className={cn('ac-notification', 'ac-notification--info', className)}
      data-testid="system-notification"
    >
      <span className="ac-notification__icon" aria-hidden="true">
        <Icon name={icon ?? 'info'} />
      </span>
      <span className="ac-notification__message">
        {message}
        {timing && <span className="ac-notification__timing"> ({timing})</span>}
      </span>
    </div>
  );
});
