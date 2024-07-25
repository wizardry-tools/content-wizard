import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

jest.useFakeTimers();

describe('useDebounce function', () => {
  it('should return the same value after the delay', () => {
    const { result } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'test', delay: 500 },
    });

    expect(result.current).toBe('test');

    act(() => {
      jest.advanceTimersByTime(250);
    });

    expect(result.current).toBe('test');

    act(() => {
      jest.advanceTimersByTime(250);
    });

    expect(result.current).toBe('test');
  });

  it('should return the updated value after the delay', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'test', delay: 500 },
    });

    expect(result.current).toBe('test');

    rerender({ value: 'updated', delay: 500 });

    expect(result.current).toBe('test');

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe('updated');
  });
});
