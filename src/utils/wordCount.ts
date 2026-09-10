/**
 * Word counting utilities for streaming progressive rendering.
 * Matches VS Code's word counting logic from chatWordCounter.ts.
 *
 * @module utils/wordCount
 */

/**
 * Count words in a string. Splits on whitespace and filters empty tokens.
 */
export function countWords(text: string): number {
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

/**
 * Get the first N words of a string, preserving markdown structure.
 * Returns the substring up to and including the Nth word boundary.
 */
export function getNWords(text: string, n: number): string {
  if (n <= 0) return '';
  if (!text) return '';

  let count = 0;
  let inWord = false;
  let lastEnd = 0;

  for (let i = 0; i < text.length; i++) {
    const isSpace = /\s/.test(text[i]!);

    if (inWord && isSpace) {
      count++;
      lastEnd = i;
      inWord = false;
      if (count >= n) return text.slice(0, lastEnd);
    } else if (!isSpace) {
      inWord = true;
    }
  }

  // If we end while still in a word, count it
  if (inWord) {
    count++;
  }

  // If we have enough words, return the text
  if (count <= n) return text;
  return text.slice(0, lastEnd);
}

/**
 * Calculate the adaptive streaming rate based on content load rate.
 * Returns words per second, clamped to [minRate, maxRate].
 *
 * @param impliedWordLoadRate - Words arriving per second from backend
 * @param minRate - Minimum render rate (default: 40)
 * @param maxRate - Maximum render rate (default: 2000)
 */
export function getProgressiveRenderRate(
  impliedWordLoadRate: number,
  minRate = 40,
  maxRate = 2000,
): number {
  // Rate should be slightly faster than load rate so we don't fall behind
  const rate = Math.max(impliedWordLoadRate * 1.5, minRate);
  return Math.min(rate, maxRate);
}
