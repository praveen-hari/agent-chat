/**
 * ChatTextarea — auto-resizing textarea with paste/drop attachment support.
 *
 * Features:
 * - Auto-resize height with content (capped at maxHeight)
 * - Enter to submit, Shift+Enter for newline
 * - Paste/drop file handling
 * - History navigation (up/down arrows)
 *
 * @module components/input/ChatTextarea
 */

import { memo, useRef, useEffect, useCallback, useState } from 'react';
import { cn } from '../../utils/cn';

export interface ChatTextareaProps {
  /** Current text value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Submit handler (Enter key) */
  onSubmit: () => void;
  /** Placeholder text */
  placeholder?: string;
  /** Maximum height in pixels (default: 250) */
  maxHeight?: number;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Whether a response is streaming */
  isStreaming?: boolean;
  /** File paste/drop handler */
  onFilePaste?: (files: File[]) => void;
  /** Escape key handler */
  onEscape?: () => void;
  /** Additional CSS class */
  className?: string;
}

export const ChatTextarea = memo(function ChatTextarea({
  value,
  onChange,
  onSubmit,
  placeholder = 'Type a message...',
  maxHeight = 250,
  disabled = false,
  isStreaming = false,
  onFilePaste,
  onEscape,
  className,
}: ChatTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Auto-resize textarea height
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    }
  }, [value, maxHeight]);

  // Auto-focus on mount
  useEffect(() => {
    if (!disabled) {
      textareaRef.current?.focus();
    }
  }, [disabled]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Enter to submit (without shift)
      if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (!isStreaming && value.trim().length > 0) {
          onSubmit();
        }
        return;
      }

      // Escape to cancel
      if (e.key === 'Escape') {
        onEscape?.();
        return;
      }
    },
    [onSubmit, onEscape, isStreaming, value],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const files = Array.from(e.clipboardData.files);
      if (files.length > 0 && onFilePaste) {
        e.preventDefault();
        onFilePaste(files);
      }
    },
    [onFilePaste],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLTextAreaElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0 && onFilePaste) {
        onFilePaste(files);
      }
    },
    [onFilePaste],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  return (
    <div className={cn('ac-textarea-wrapper', className)}>
      <textarea
        ref={textareaRef}
        className="ac-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        style={{ maxHeight: `${maxHeight}px` }}
        aria-label="Chat input"
        data-testid="chat-textarea"
      />
      {isDragOver && <div className="ac-textarea__drop-overlay">Drop files to attach</div>}
    </div>
  );
});
