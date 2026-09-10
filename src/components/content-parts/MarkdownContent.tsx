/**
 * MarkdownContent — renders markdown text with GFM support.
 * Uses react-markdown with remark-gfm for tables, strikethrough, etc.
 *
 * @module components/content-parts/MarkdownContent
 */

import { memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { MarkdownPart } from '../../types/content-parts';
import { cn } from '../../utils/cn';
import { useChatContext } from '../../provider/useChatContext';

export interface MarkdownContentProps extends MarkdownPart {
  /** Whether the parent response is streaming (enables progressive reveal) */
  isStreaming?: boolean;
  /** Additional CSS class */
  className?: string;
}

const remarkPlugins = [remarkGfm];

export const MarkdownContent = memo(function MarkdownContent({
  content,
  isStreaming = false,
  className,
}: MarkdownContentProps) {
  const { callbacks } = useChatContext();

  const components = useMemo(
    () => ({
      a: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            if (href && callbacks.onReferenceClick) {
              e.preventDefault();
              callbacks.onReferenceClick(href);
            }
          }}
          {...props}
        >
          {children}
        </a>
      ),
      table: ({ children, ...props }: React.TableHTMLAttributes<HTMLTableElement>) => (
        <div className="ac-markdown__table-wrapper">
          <table {...props}>{children}</table>
        </div>
      ),
      img: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
        <img src={src} alt={alt ?? ''} style={{ maxWidth: '100%' }} loading="lazy" {...props} />
      ),
    }),
    [callbacks],
  );

  if (!content) {
    return null;
  }

  return (
    <div
      className={cn('ac-markdown', isStreaming && 'ac-markdown--streaming', className)}
      data-testid="markdown-content"
    >
      <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
});
