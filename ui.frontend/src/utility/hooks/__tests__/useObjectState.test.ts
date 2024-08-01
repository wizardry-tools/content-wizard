import { renderHook, act } from '@testing-library/react';
import { useObjectState } from '../useObjectState';

type TestObject = {
  count: number;
  text?: string | undefined;
};
describe('useObjectState', () => {
  it('should initialize to the initialValue', () => {
    const { result } = renderHook(() => useObjectState({ count: 0 } as TestObject));
    const [state] = result.current;
    expect(state).toEqual({ count: 0 });
  });

  it('should update the state when provided a Partial<T>', () => {
    const { result } = renderHook(() => useObjectState({ count: 0, text: 'Hello' } as TestObject));
    act(() => {
      const [, handleUpdate] = result.current;
      handleUpdate({ count: 1 });
    });
    const [state] = result.current;
    expect(state).toEqual({ count: 1, text: 'Hello' });
  });

  it('should update the state when provided a function returning Partial<T>', () => {
    const { result } = renderHook(() => useObjectState({ count: 0 } as TestObject));
    act(() => {
      const [, handleUpdate] = result.current;
      // @ts-expect-error Compiler thinks this isn't assignable, need to figure out why
      handleUpdate((s: { count: number }) => ({ count: s.count + 1 }));
    });
    const [state] = result.current;
    expect(state).toEqual({ count: 1 });
  });

  it('should not update the state when provided a function not returning an object', () => {
    const { result } = renderHook(() => useObjectState({ count: 0 } as TestObject));
    act(() => {
      const [, handleUpdate] = result.current;
      // @ts-expect-error Compiler thinks this isn't assignable, need to figure out why
      handleUpdate((s: { count: number }) => s.count + 1);
    });
    const [state] = result.current;
    expect(state).toEqual({ count: 0 });
  });
});
