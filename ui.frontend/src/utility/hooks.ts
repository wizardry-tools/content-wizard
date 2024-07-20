import { useEffect, useRef, useState } from 'react';


export function useRenderCount():number {
  const count = useRef(0);

  count.current++;

  return count.current;
}

export function useDebounce(value: any, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}