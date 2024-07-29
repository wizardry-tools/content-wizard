import { useCallback, useState } from 'react';
import { ObjectStateHandleUpdate, ObjectStateOrCallback, ObjectStateUpdateCallback } from '@/types';
import { isPlainObject } from '../libs';

export function useObjectState<T>(initialValue: T): [T, ObjectStateHandleUpdate<T>] {
  const [state, setState] = useState(initialValue);

  const handleUpdate = useCallback((arg: ObjectStateOrCallback<T>) => {
    const callback = arg as ObjectStateUpdateCallback<T>;
    if (typeof callback === 'function') {
      setState((s: T): T => {
        const newState: T = callback(s);
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
