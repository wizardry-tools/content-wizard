import { renderHook } from '@testing-library/react';
import { useCreateFetcher } from '../useCreateFetcher';

// Describe block encapsulates all the test cases related to useCreateFetcher function
describe('useCreateFetcher', () => {
  // Test Case: Check whether useCreateFetcher returns object with 3 properties
  it('useCreateFetcher should return an object containing 3 properties', () => {
    const { result } = renderHook(() => useCreateFetcher());
    expect(Object.keys(result.current).length).toBe(3);
    expect('createGraphQLFetcher' in result.current).toBe(true);
    expect('createMultiLanguageFetcher' in result.current).toBe(true);
    expect('createAPIFetcher' in result.current).toBe(true);
  });

  // Test Case: Check whether 'createGraphQLFetcher' works without throwing error
  it('useCreateFetcher should not throw error for createGraphQLFetcher', () => {
    const { result } = renderHook(() => useCreateFetcher());
    const { createGraphQLFetcher } = result.current;
    expect(() => createGraphQLFetcher({ url: '' })).not.toThrow();
  });

  // Test Case: Check whether 'createMultiLanguageFetcher' works without throwing error
  it('useCreateFetcher should not throw error for createMultiLanguageFetcher', () => {
    const { result } = renderHook(() => useCreateFetcher());
    const { createMultiLanguageFetcher } = result.current;
    expect(() => createMultiLanguageFetcher({ url: '' })).not.toThrow();
  });

  // Test Case: Check whether 'createAPIFetcher' works without throwing error
  it('useCreateFetcher should not throw error for createAPIFetcher', () => {
    const { result } = renderHook(() => useCreateFetcher());
    const { createAPIFetcher } = result.current;
    expect(() => createAPIFetcher({ url: '' })).not.toThrow();
  });

  // ... other individual test cases to cover all aspects of the functions
});
