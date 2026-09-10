/**
 * useStreaming — progressive word reveal for streaming markdown content.
 * During streaming, returns a truncated version limited to revealedWordCount.
 * After streaming completes, returns full content immediately.
 *
 * @module hooks/useStreaming
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { countWords, getNWords, getProgressiveRenderRate } from '../utils/wordCount';

/**
 * Hook that progressively reveals streaming markdown content word-by-word.
 *
 * @param content - The full markdown content (may still be accumulating)
 * @param isStreaming - Whether the response is still streaming
 * @param wordsPerSecond - Base reveal rate (default: 80)
 * @returns The content string to render (truncated during streaming)
 */
export function useStreaming(content: string, isStreaming: boolean, wordsPerSecond = 80): string {
  const [revealedCount, setRevealedCount] = useState(0);
  const prevContentLenRef = useRef(0);
  const prevTimeRef = useRef(Date.now());
  const rafRef = useRef<number>(0);

  // Compute adaptive rate based on how fast content is growing
  const getRate = useCallback(() => {
    const now = Date.now();
    const elapsed = (now - prevTimeRef.current) / 1000;
    const newWords = countWords(content) - prevContentLenRef.current;
    const impliedRate = elapsed > 0 ? newWords / elapsed : wordsPerSecond;
    prevContentLenRef.current = countWords(content);
    prevTimeRef.current = now;
    return getProgressiveRenderRate(impliedRate);
  }, [content, wordsPerSecond]);

  useEffect(() => {
    if (!isStreaming) {
      // Not streaming — show everything immediately
      setRevealedCount(countWords(content));
      return;
    }

    const totalWords = countWords(content);
    if (revealedCount >= totalWords) return;

    let lastFrame = performance.now();

    const animate = (now: number) => {
      const delta = (now - lastFrame) / 1000; // seconds
      lastFrame = now;

      const rate = getRate();
      const increment = rate * delta;

      setRevealedCount((prev) => {
        const next = prev + increment;
        return Math.min(next, totalWords);
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [content, isStreaming, revealedCount, getRate]);

  // When not streaming, return full content
  if (!isStreaming) return content;

  // During streaming, return truncated content
  const wordCount = Math.floor(revealedCount);
  if (wordCount >= countWords(content)) return content;
  return getNWords(content, wordCount);
}
