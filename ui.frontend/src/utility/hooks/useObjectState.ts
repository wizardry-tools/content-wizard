import { useCallback, useState } from 'react';
import { isPlainObject } from '../libs';

// handleUpdate
type ObjectStateHandleUpdate<T> = (state: T) => void;
// arg()
type ObjectStateUpdateCallback<T> = (state: T) => T;
type ObjectStateOrCallback<T> = ObjectStateUpdateCallback<T> | T;

export function useObjectState<T>(initialValue: T): [T, ObjectStateHandleUpdate<T>] {
  const [state, setState] = useState(initialValue);

  const handleUpdate = useCallback((arg: ObjectStateOrCallback<T>) => {
    if (typeof arg === 'function') {
      setState((s: T): T => {
        const newState: T = arg(s);
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
      setState(
        (s: T): T => ({
          ...s,
          ...arg,
        }),
      );
    }
  }, []);

  return [state, handleUpdate];
}
