import { useCallback, useState } from 'react';
import { isPlainObject } from '../libs';

export function useObjectState<T>(initialValue: T): [T, (arg: Partial<T> | Function) => void] {
  const [state, setState] = useState(initialValue);

  const handleUpdate = useCallback((arg: any) => {
    if (typeof arg === 'function') {
      setState((s) => {
        const newState = arg(s);

        if (isPlainObject(newState)) {
          return {
            ...s,
            ...newState,
          };
        } else {
          return s;
        }
      });
    }

    if (isPlainObject(arg)) {
      setState((s) => ({
        ...s,
        ...arg,
      }));
    }
  }, []);

  return [state, handleUpdate];
}
