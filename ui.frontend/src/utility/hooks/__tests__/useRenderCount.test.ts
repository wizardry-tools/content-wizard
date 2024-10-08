import { renderHook } from '@testing-library/react';
import { useRenderCount } from '../useRenderCount';

describe('useRenderCount', () => {
  it('should increase count each time hook renders', () => {
    const { result, rerender } = renderHook(() => useRenderCount());

    expect(result.current).toBe(1);

    rerender();

    expect(result.current).toBe(2);

    rerender();

    expect(result.current).toBe(3);
  });
});
