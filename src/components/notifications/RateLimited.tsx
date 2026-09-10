/**
 * RateLimited — info banner with sign-in action.
 *
 * @module components/notifications/RateLimited
 */

import { memo, useCallback } from 'react';
import type { RateLimitedPart } from '../../types/content-parts';
import { cn } from '../../utils/cn';

export interface RateLimitedProps extends RateLimitedPart {
  /** Additional CSS class */
  className?: string;
}

export const RateLimited = memo(function RateLimited({
  message,
  signInUrl,
  className,
}: RateLimitedProps) {
  const handleSignIn = useCallback(() => {
    if (signInUrl) {
      window.open(signInUrl, '_blank', 'noopener,noreferrer');
    }
  }, [signInUrl]);

  return (
    <div
      className={cn('ac-notification', 'ac-notification--info', className)}
      role="status"
      data-testid="rate-limited"
    >
      <span className="ac-notification__icon" aria-hidden="true">
        ℹ
      </span>
      <span className="ac-notification__message">{message}</span>
      {signInUrl && (
        <button className="ac-btn ac-btn--small ac-btn--primary" onClick={handleSignIn}>
          Sign In
        </button>
      )}
    </div>
  );
});
