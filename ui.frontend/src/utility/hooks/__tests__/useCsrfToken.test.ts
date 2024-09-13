import { renderHook, act } from '@testing-library/react';
import { useCsrfToken } from '@/utility';

describe('useCsrfToken Hook', () => {
  const mockFetch = vi.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    // Reset mock implementations
    mockFetch.mockReset();
  });

  it('should fetch CSRF Token with success', async () => {
    const { result } = renderHook(() => useCsrfToken());
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve({ token: 'ABC123' }),
    });

    let token = '';
    await act(async () => {
      token = await result.current.get();
    });
    expect(token).toBe('ABC123');
  });
  it('should fetch No Token without token', async () => {
    const { result } = renderHook(() => useCsrfToken());
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => Promise.resolve({ error: 'some error' }),
    });

    let token = '';
    await act(async () => {
      token = await result.current.get();
    });
    expect(token).toBe('No Token');
  });
  it('should should error without json', async () => {
    const { result } = renderHook(() => useCsrfToken());
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => {
        throw new Error('Bad Error');
      },
    });

    await expect(async () => {
      await act(async () => {
        await result.current.get();
      });
    }).rejects.toThrowError('Bad Error');
  });
});
