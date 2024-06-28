import { useRef } from 'react';

/**
 * Simple use hook that setups up a counter reference that increases
 * each time the hook renders, and returns the count.
 * @return number
 */
export function useRenderCount(): number {
  const count = useRef(0);

  count.current++;

  return count.current;
}
