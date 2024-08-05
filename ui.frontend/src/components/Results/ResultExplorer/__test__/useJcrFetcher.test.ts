import { test, Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useJcrFetcher } from '../useJcrFetcher';
import { MutableRefObject } from 'react';
import { FetcherProps } from '@/types';

test('testing useJcrFetcher function', async () => {
  const fakeFetch = global.fetch as Mock;
  // setup our fake response
  const fakeResponse = Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: 'test-data' }),
  });
  fakeFetch.mockImplementationOnce(() => fakeResponse);
  const fetching: MutableRefObject<boolean> = { current: false };
  const props = { fetching } as FetcherProps;
  const { result, rerender } = renderHook(() => useJcrFetcher(props));

  act(() => {
    result.current.loadData({
      path: '/test-path',
      defaultResult: '',
      resultHandler: vi.fn(),
    });
  });
  // we should start with an initial state of fetching = true
  expect(props.fetching.current).toBe(true);
  rerender();
  // we should have a result of fetching = false
  expect(props.fetching.current).toBe(false);
});
