/**
 * Displays a user or agent avatar as a rounded icon/image/initials circle.
 *
 * @module components/atoms/Avatar
 */

import { memo, useState } from 'react';
import { cn } from '../../utils/cn';

export interface AvatarProps {
  /** Emoji string, image source object, or icon identifier object */
  icon: string | { src: string } | { iconId: string };
  /** Display name (used for initials fallback and alt text) */
  name?: string;
  /** Size in pixels (default: 24) */
  size?: number;
  /** Whether to show outline border */
  outline?: boolean;
  /** Additional CSS class */
  className?: string;
}

/**
 * Renders an avatar — emoji, image, icon ID, or initials fallback.
 *
 * @example
 * ```tsx
 * <Avatar icon="🤖" name="Bot" />
 * <Avatar icon={{ src: '/avatar.png' }} name="User" />
 * ```
 */
export const Avatar = memo(function Avatar({
  icon,
  name,
  size = 24,
  outline = false,
  className,
}: AvatarProps) {
  const [imgFailed, setImgFailed] = useState(false);

  const showImage = typeof icon === 'object' && 'src' in icon && !imgFailed;
  const showIconId = typeof icon === 'object' && 'iconId' in icon;
  const showEmoji = typeof icon === 'string' && icon.length > 0 && icon.length <= 2;
  const showInitials =
    !showImage &&
    !showIconId &&
    (typeof icon !== 'string' || icon.length === 0 || icon.length > 2 || imgFailed);

  const initials = (name?.trim()?.[0] ?? '?').toUpperCase();

  // When rendering an image, the <img> element itself is the accessible
  // element — the wrapper must not duplicate role="img".
  const wrapperRole = showImage ? undefined : 'img';

  return (
    <span
      className={cn('ac-avatar', outline && 'ac-avatar--outline', className)}
      role={wrapperRole}
      aria-label={name}
      style={{ width: size, height: size }}
    >
      {showImage && (
        <img
          className="ac-avatar__img"
          src={(icon as { src: string }).src}
          alt={name ?? ''}
          onError={() => setImgFailed(true)}
        />
      )}
      {showIconId && (
        <span className="ac-avatar__icon-id" aria-hidden="true">
          {(icon as { iconId: string }).iconId}
        </span>
      )}
      {showEmoji && !showInitials && <span aria-hidden="true">{icon}</span>}
      {showInitials && name && <span className="ac-avatar__initials">{initials}</span>}
      {showInitials && !name && <span className="ac-avatar__initials">?</span>}
    </span>
  );
});
