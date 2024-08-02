// Importing required modules and hooks
import { renderHook } from '@testing-library/react';
import type { Mock } from 'vitest';
import { useAuthHeaders } from '../useAuthHeaders';
import { useCsrfToken } from '../useCsrfToken';

// Mocking hooks used inside useAuthHeaders
vi.mock('../useRenderCount');
vi.mock('../useCsrfToken');
describe('Test useAuthHeaders', () => {
  it('Using useAuthHeaders', async () => {
    // Creating a mock CSRF token and setting up mock for useCsrfToken hook
    const mockCsrfToken = 'mockCsrfToken';
    (useCsrfToken as Mock).mockReturnValue({
      get: vi.fn().mockResolvedValue(mockCsrfToken),
    });

    // Arrange
    const { result } = renderHook(() => useAuthHeaders());

    // Act
    const headers: HeadersInit = await result.current.get({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const token = Object.entries(headers).find((value) => {
      return value[0] === 'CSRF-Token';
    });
    // Assert
    // Checking the CSRF token is present in header for non GET methods
    expect(token?.at(1)).toEqual(mockCsrfToken);
  });
});
