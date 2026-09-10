/**
 * Avatar — displays a user or agent avatar as a rounded icon/image/initials circle.
 *
 * @module components/atoms/Avatar
 */

import { memo } from 'react';
import { cn } from '../../utils/cn';

export interface AvatarProps {
  /** Emoji string, URL, or icon identifier */
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

export const Avatar = memo(function Avatar({
  icon,
  name,
  size = 24,
  outline = false,
  className,
}: AvatarProps) {
  const style = { width: `${size}px`, height: `${size}px` };

  // Image URL
  if (typeof icon === 'object' && 'src' in icon) {
    return (
      <div
        className={cn('ac-avatar', outline && 'ac-avatar--outline', className)}
        style={style}
        role="img"
        aria-label={name}
      >
        <img className="ac-avatar__img" src={icon.src} alt={name ?? ''} />
      </div>
    );
  }

  // Icon ID (render as text for now; can be replaced with icon library)
  if (typeof icon === 'object' && 'iconId' in icon) {
    return (
      <div
        className={cn('ac-avatar', outline && 'ac-avatar--outline', className)}
        style={style}
        role="img"
        aria-label={name}
      >
        <span className="ac-avatar__icon">{icon.iconId}</span>
      </div>
    );
  }

  // Emoji string (1-2 chars)
  if (typeof icon === 'string' && icon.length > 0) {
    return (
      <div
        className={cn('ac-avatar', outline && 'ac-avatar--outline', className)}
        style={style}
        role="img"
        aria-label={name}
      >
        <span className="ac-avatar__emoji">{icon}</span>
      </div>
    );
  }

  // Fallback: initials from name
  const initials = name ? name.charAt(0).toUpperCase() : '?';
  return (
    <div
      className={cn('ac-avatar', outline && 'ac-avatar--outline', className)}
      style={style}
      role="img"
      aria-label={name}
    >
      <span className="ac-avatar__initials">{initials}</span>
    </div>
  );
});
