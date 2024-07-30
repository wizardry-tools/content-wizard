import { useCsrfToken } from './useCsrfToken';
import { useCallback, useMemo } from 'react';
import { useLogger } from '@/providers/LoggingProvider';
import { useRenderCount } from './useRenderCount';

/**
 * Returns authorization headers for making authenticated requests.
 * This function uses the useCsrfToken hook to retrieve the CSRF token and includes it in the headers.
 * @returns {Object} - An object with a single method 'get', which returns a promise with the authorization headers.
 */
export const useAuthHeaders = (): { get: (props: Partial<RequestInit>) => Promise<HeadersInit> } => {
  const logger = useLogger();
  const renderCount = useRenderCount();
  logger.debug({ message: `useAuthHeaders[${renderCount}] render()` });
  const csrfToken = useCsrfToken();

  const authorization: [string | undefined, string | undefined] | string | undefined = useMemo(() => {
    const { VITE_AUTH_METHOD, VITE_DEV_TOKEN, VITE_BASIC_AUTH_USER, VITE_BASIC_AUTH_PASS } = import.meta.env;

    if (VITE_AUTH_METHOD === 'basic') {
      return [VITE_BASIC_AUTH_USER, VITE_BASIC_AUTH_PASS];
    } else if (VITE_AUTH_METHOD === 'dev-token') {
      return VITE_DEV_TOKEN;
    } else {
      // no authentication set
      return;
    }
  }, []);

  const getAuthorizationHeaders = useCallback(
    async (props: Partial<RequestInit>): Promise<HeadersInit> => {
      logger.debug({ message: `useAuthHeaders getAuthorizationHeaders()` });
      const { method = 'GET', headers } = props;
      const authHeaders = {
        ...(headers ?? {}),
        credentials: 'same-origin',
        Authorization: (authorization ?? '') as string,
      };
      if (method === 'GET') {
        return authHeaders;
      }
      try {
        const token = await csrfToken.get();
        return {
          ...authHeaders,
          'CSRF-Token': token,
        };
      } catch (error) {
        console.error('Failed to create authorization headers: ', error);
        throw error;
      }
    },
    [authorization, csrfToken, logger],
  );

  return useMemo(
    () => ({
      get: getAuthorizationHeaders,
    }),
    [getAuthorizationHeaders],
  );
};
