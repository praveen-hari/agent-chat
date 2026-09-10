/**
 * useCopyToClipboard — clipboard copy with visual feedback state.
 *
 * @module hooks/useCopyToClipboard
 */

import { useState, useCallback, useRef } from 'react';

/**
 * Hook that provides clipboard copy functionality with visual feedback.
 *
 * @param feedbackDuration - Duration to show "copied" state in ms (default: 2000)
 * @returns { copy, isCopied }
 */
export function useCopyToClipboard(feedbackDuration = 2000) {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        // Fallback for environments without Clipboard API
        try {
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        } catch {
          // Copy failed silently
          return;
        }
      }

      setIsCopied(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setIsCopied(false);
      }, feedbackDuration);
    },
    [feedbackDuration],
  );

  return { copy, isCopied };
}
