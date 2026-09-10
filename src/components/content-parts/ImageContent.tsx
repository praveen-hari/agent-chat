/**
 * ImageContent — displays an image within the response.
 *
 * @module components/content-parts/ImageContent
 */

import { memo } from 'react';
import type { ImagePart } from '../../types/content-parts';
import { cn } from '../../utils/cn';

export interface ImageContentProps extends ImagePart {
  /** Additional CSS class */
  className?: string;
}

export const ImageContent = memo(function ImageContent({
  src,
  alt,
  width,
  height,
  className,
}: ImageContentProps) {
  return (
    <div className={cn('ac-image', className)} data-testid="image-content">
      <img
        src={src}
        alt={alt ?? ''}
        width={width}
        height={height}
        loading="lazy"
        style={{ maxWidth: '100%', borderRadius: 'var(--ac-radius-md)' }}
      />
    </div>
  );
});
