/**
 * useVirtualList — determines whether the message list should be virtualized.
 *
 * @module hooks/useVirtualList
 */

/**
 * Hook that determines whether virtualization should be enabled
 * based on the message count.
 *
 * @param messageCount - Number of messages in the session
 * @param threshold - Enable virtualization above this count (default: 50)
 */
export function useVirtualList(
  messageCount: number,
  threshold = 50,
): { shouldVirtualize: boolean } {
  return {
    shouldVirtualize: messageCount > threshold,
  };
}
