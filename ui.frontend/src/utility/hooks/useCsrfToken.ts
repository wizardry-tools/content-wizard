import { useCallback, useMemo } from 'react';
import { useLogger } from '@/providers';
import { DYNAMIC_HEADERS } from '../http';

export const useCsrfToken = () => {
  const logger = useLogger();
  const getCsrfToken = useCallback(async (): Promise<string> => {
    try {
      const response: Response = await fetch('/libs/granite/csrf/token.json', DYNAMIC_HEADERS);
      logger.debug({ message: 'useCsrfToken.getCsrfToken() response', response });
      if (response.ok) {
        const json = await response.json();
        logger.debug({ message: 'useCsrfToken.getCsrfToken() json', json });
        if ('token' in json) {
          const { token } = json;
          logger.debug({ message: 'useCsrfToken.getCsrfToken() token', token });
          if (typeof token === 'string') {
            return token;
          }
        }
      } else {
        logger.debug({ message: 'useCsrfToken.getCsrfToken() response not ok' });
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
