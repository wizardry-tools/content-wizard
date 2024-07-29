import { DYNAMIC_HEADERS } from '../http';
import { useCallback, useMemo } from 'react';

export const useCsrfToken = () => {
  const getCsrfToken = useCallback(async (): Promise<string> => {
    try {
      const response: Response = await fetch('/libs/granite/csrf/token.json', DYNAMIC_HEADERS);
      const json = await response.json();
      if ('token' in json) {
        const { token } = json;
        if (typeof token === 'string') {
          return token;
        }
      }
    } catch (error) {
      console.error('Failed to fetch CSRF Token: ', error);
      throw error;
    }
    // this will indicate to devs that a token was not provided by the fetch.
    return 'No Token';
  }, []);

  return useMemo(
    () => ({
      get: getCsrfToken,
    }),
    [getCsrfToken],
  );
};
