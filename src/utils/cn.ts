/**
 * Lightweight className concatenation utility.
 * Filters out falsy values and joins with spaces.
 *
 * @example
 * cn('base', condition && 'modifier', undefined, 'other')
 * // → 'base modifier other'
 *
 * @module utils/cn
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
