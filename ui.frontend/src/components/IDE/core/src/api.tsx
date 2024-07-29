import { fetcherReturnToPromise, formatError, formatResult, isPromise } from '@graphiql/toolkit';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { API, APIContextProviderProps, APIContextType, GraphQLEndpointConfig } from '@/types';
import { buildGraphQLURL, endpoints } from '@/components';
import { useCreateFetcher, useRenderCount } from '@/utility';
import { useLogger } from '@/providers';
import { createContextHook, createNullableContext } from './utility/context';

export const mapAPIs = (response: GraphQLEndpointConfig[]): API[] => {
  return response.map((endpointConfig) => {
    return {
      endpoint: endpointConfig.configurationName,
      persistedQueries: endpointConfig.queries,
      url: buildGraphQLURL(endpointConfig.configurationName),
    };
  });
};

export const APIContext = createNullableContext<APIContextType>('APIContext');

export function APIContextProvider(props: APIContextProviderProps) {
  const renderCount = useRenderCount();
  const logger = useLogger();
  logger.debug({ message: `APIContextProvider[${renderCount}] render()` });
  const { children } = props;
  const fetcher = useCreateFetcher();
  const apiFetcher = useMemo(() => {
    return fetcher.createAPIFetcher({
      url: endpoints?.graphQlListPath ?? '',
    });
  }, [fetcher]);
  const [APIs, setAPIs] = useState([] as API[]);
  const isFetching = useRef(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadAPIs = useCallback(() => {
    if (isFetching.current) {
      // avoid parallel request
      return;
    }
    async function fetchAPIs(): Promise<GraphQLEndpointConfig[]> {
      const fetch = fetcherReturnToPromise(apiFetcher({}));
      if (!isPromise(fetch)) {
        setFetchError('Fetcher did not return a Promise for API request');
      }
      isFetching.current = true;
      setFetchError(null);
      const result = await fetch;

      if (result === null || typeof result === 'undefined') {
        throw new Error(
          'Fetcher did not return results for API Request. ' +
            'Please ensure your AEM GraphQL Endpoints are ' +
            'properly configured and published.',
        );
      }

      isFetching.current = false;

      if (typeof result !== 'string') {
        return result as GraphQLEndpointConfig[];
      }

      const responseString = formatResult(result);
      setFetchError(responseString);
      return [];
    }

    fetchAPIs()
      .then((data: GraphQLEndpointConfig[]) => {
        const apis = data.map(
          (config: GraphQLEndpointConfig): API => ({
            endpoint: config.configurationName,
            persistedQueries: config.queries,
          }),
        );
        setAPIs(apis);
      })
      .catch((error) => {
        setFetchError(formatError(error));
        isFetching.current = false;
      });
  }, [apiFetcher]);

  const getPersistedQueries = useCallback(
    (passedAPI: API) => {
      const foundAPI = APIs.find((api) => {
        return passedAPI.endpoint === api.endpoint;
      });
      return foundAPI?.persistedQueries ?? passedAPI.persistedQueries ?? [];
    },
    [APIs],
  );

  useEffect(() => {
    loadAPIs();
  }, [loadAPIs]);

  const value = useMemo(
    () => ({
      fetchError,
      APIs,
      getPersistedQueries,
    }),
    [fetchError, APIs, getPersistedQueries],
  );

  return <APIContext.Provider value={value}>{children}</APIContext.Provider>;
}

export const useAPIContext = createContextHook(APIContext);
