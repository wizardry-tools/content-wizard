// Importing required modules and hooks
import { renderHook } from '@testing-library/react';

import { useAuthHeaders } from '../useAuthHeaders';
import { useCsrfToken } from '../useCsrfToken';
import { useLogger } from 'src/providers/LoggingProvider';

//jest.mock('src/providers/LoggingProvider');
// Mocking hooks used inside useAuthHeaders
jest.mock('../useRenderCount');
jest.mock('../useCsrfToken');

test('Using useAuthHeaders', async () => {


  // Creating a mock CSRF token and setting up mock for useCsrfToken hook
  const mockCsrfToken = 'mockCsrfToken';
  (useCsrfToken as jest.Mock).mockReturnValue({
    get: jest.fn().mockResolvedValue(mockCsrfToken),
  });

  // Arrange
  const { result } = renderHook(() => useAuthHeaders());

  // Act
  const headers:HeadersInit = await result.current.get({
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  const token = Object.entries(headers).find((value)=>{
    return value[0] === 'CSRF-Token'
  })
  // Assert
  // Checking the CSRF token is present in header for non GET methods
  expect(token?.at(1)).toEqual(mockCsrfToken);
  // Checking if logger's debug message has been called with expected output
  expect(useLogger().debug).toHaveBeenCalledWith({ message: 'useAuthHeaders getAuthorizationHeaders()' });
});