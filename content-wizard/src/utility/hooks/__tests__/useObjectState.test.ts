import { renderHook, act } from '@testing-library/react';
import { useObjectState } from '../useObjectState';

describe('useObjectState', () => {
  it('should initialize to the initialValue', () => {
    const { result } = renderHook(() => useObjectState({ count: 0 }));
    const [state] = result.current;
    expect(state).toEqual({ count: 0 });
  });

  it('should update the state when provided a Partial<T>', () => {
    const { result } = renderHook(() => useObjectState({ count: 0, text: 'Hello' }));
    act(() => {
      const [, handleUpdate] = result.current;
      handleUpdate({ count: 1 });
    });
    const [state] = result.current;
    expect(state).toEqual({ count: 1, text: 'Hello' });
  });

  it('should update the state when provided a function returning Partial<T>', () => {
    const { result } = renderHook(() => useObjectState({ count: 0 }));
    act(() => {
      const [, handleUpdate] = result.current;
      handleUpdate((s: { count: number }) => ({ count: s.count + 1 }));
    });
    const [state] = result.current;
    expect(state).toEqual({ count: 1 });
  });

  it('should not update the state when provided a function not returning an object', () => {
    const { result } = renderHook(() => useObjectState({ count: 0 }));
    act(() => {
      const [, handleUpdate] = result.current;
      handleUpdate((s: { count: number }) => s.count + 1);
    });
    const [state] = result.current;
    expect(state).toEqual({ count: 0 });
  });
});
