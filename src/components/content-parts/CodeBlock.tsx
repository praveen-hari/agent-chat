/**
 * CodeBlock — syntax-highlighted code block with toolbar actions.
 * Supports copy, apply, and open file actions.
 *
 * @module components/content-parts/CodeBlock
 */

import { memo, useState, useCallback } from 'react';
import type { CodeBlockPart } from '../../types/content-parts';
import { cn } from '../../utils/cn';
import { useChatContext } from '../../provider/useChatContext';
import { IconButton } from '../atoms/IconButton';

export interface CodeBlockProps extends CodeBlockPart {
  /** Whether to show the action toolbar (default: true) */
  showToolbar?: boolean;
  /** Additional CSS class */
  className?: string;
}

export const CodeBlock = memo(function CodeBlock({
  code,
  language,
  filename,
  uri,
  showToolbar = true,
  className,
}: CodeBlockProps) {
  const { callbacks } = useChatContext();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      callbacks.onCodeCopy?.(code);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may not be available
    }
  }, [code, callbacks]);

  const handleApply = useCallback(() => {
    callbacks.onCodeApply?.(code, language, uri);
  }, [code, language, uri, callbacks]);

  const handleOpen = useCallback(() => {
    if (uri) {
      callbacks.onFileOpen?.(uri);
    }
  }, [uri, callbacks]);

  return (
    <div className={cn('ac-code-block', className)} data-testid="code-block">
      <div className="ac-code-block__header">
        {language && <span className="ac-code-block__language">{language}</span>}
        {filename && <span className="ac-code-block__filename">{filename}</span>}
        {showToolbar && (
          <div className="ac-code-block__toolbar">
            <IconButton
              icon={copied ? '✓' : '📋'}
              label={copied ? 'Copied!' : 'Copy'}
              onClick={handleCopy}
              size="small"
            />
            {callbacks.onCodeApply && (
              <IconButton icon="✎" label="Apply" onClick={handleApply} size="small" />
            )}
            {uri && callbacks.onFileOpen && (
              <IconButton icon="↗" label="Open File" onClick={handleOpen} size="small" />
            )}
          </div>
        )}
      </div>
      <pre className="ac-code-block__content">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
});
