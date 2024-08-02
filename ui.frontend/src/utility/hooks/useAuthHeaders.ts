import { useCallback, useMemo } from 'react';
import { useLogger } from '@/providers';
import { useCsrfToken } from './useCsrfToken';
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
    const { VITE_AUTH_METHOD, VITE_AUTH_TOKEN, VITE_BASIC_AUTH_USER, VITE_BASIC_AUTH_PASS } = import.meta.env;

    if (VITE_AUTH_METHOD === 'basic') {
      return [VITE_BASIC_AUTH_USER, VITE_BASIC_AUTH_PASS];
    } else if (VITE_AUTH_METHOD === 'auth-token') {
      return VITE_AUTH_TOKEN as string;
    } else {
      // no authentication set
      // use existing auth session in browser
      // requires user to log into AEM.
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
