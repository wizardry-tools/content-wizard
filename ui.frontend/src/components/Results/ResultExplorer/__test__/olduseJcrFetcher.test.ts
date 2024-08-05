import { MutableRefObject } from 'react';
import { renderHook, act } from '@testing-library/react';
import { Mock } from 'vitest';
import { FetcherProps } from '@/types';
import { useJcrFetcher } from '../useJcrFetcher';
import { useAlertDispatcher } from '@/providers';

describe('useJcrFetcher Hook', () => {
  vi.useFakeTimers();

  // Mock useAlertDispatcher
  vi.mock('@/providers', () => ({
    useAlertDispatcher: vi.fn(),
  }));

  // Mock fetch function
  const mockFetch = vi.fn();
  global.fetch = mockFetch;

  let fetching: MutableRefObject<boolean>;

  beforeEach(() => {
    // Reset mock implementations
    mockFetch.mockReset();
    (useAlertDispatcher as Mock).mockReset();

    // Initialize the fetching ref object
    fetching = { current: false };
  });

  it('should fetch data successfully and call resultHandler', async () => {
    const mockResult: Record<string, string> = { key: 'value' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve(mockResult),
    });

    const props = {
      fetching,
    } as FetcherProps;
    const { result } = renderHook(() => useJcrFetcher(props));

    const resultHandler = vi.fn((data: unknown) => {
      expect(data).toBeTruthy();
      expect(data).toBe(JSON.stringify(mockResult, null, ' '));
    });
    //expect.assertions(2);
    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      result.current.loadData({
        path: '/content/test',
        resultHandler,
        defaultResult: 'default',
      });
    });

    expect(fetching.current).toBe(false);
    expect(resultHandler).toHaveBeenCalledWith(JSON.stringify(mockResult, null, ' '));
  });

  it('should handle fetch error and call alertDispatcher', async () => {
    const mockAlertDispatcher = vi.fn();
    (useAlertDispatcher as Mock).mockReturnValue(mockAlertDispatcher);

    mockFetch.mockRejectedValueOnce(new Error('Fetch error'));

    const resultHandler = vi.fn();
    const props = {
      fetching,
    } as FetcherProps;

    const { result } = renderHook(() => useJcrFetcher(props));

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      result.current.loadData({
        path: '/content/test',
        resultHandler,
        defaultResult: 'default',
      });
    });

    expect(mockAlertDispatcher).toHaveBeenCalledWith({
      message: 'Error: could not load data for the result /content/test',
      severity: 'error',
    });
    expect(resultHandler).toHaveBeenCalledWith('"default"');
  });

  it('should not fetch data if already fetching', async () => {
    fetching.current = true;
    const resultHandler = vi.fn();
    const props = {
      fetching,
    } as FetcherProps;

    const { result } = renderHook(() => useJcrFetcher(props));

    await act(async () => {
      result.current.loadData({
        path: '/content/test',
        resultHandler,
        defaultResult: 'default',
      });
    });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(resultHandler).not.toHaveBeenCalled();
  });
});
