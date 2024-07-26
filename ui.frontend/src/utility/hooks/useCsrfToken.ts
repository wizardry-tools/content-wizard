import { DYNAMIC_HEADERS } from '../http';
import { useCallback, useMemo } from 'react';

export const useCsrfToken = () => {
  const getCsrfToken = useCallback(async (): Promise<string> => {
    try {
      const response: Response = await fetch('/libs/granite/csrf/token.json', DYNAMIC_HEADERS);
      const json = await response.json();
      return json.token;
    } catch (error) {
      console.error('Failed to fetch CSRF Token: ', error);
      throw error;
    }
  }, []);

  return useMemo(
    () => ({
      get: getCsrfToken,
    }),
    [getCsrfToken],
  );
};
