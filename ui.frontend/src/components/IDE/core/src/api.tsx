import { createContextHook, createNullableContext } from './utility/context';
import { fetcherReturnToPromise, formatError, formatResult, isPromise } from '@graphiql/toolkit';
import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';
import { buildGraphQLURL, endpoints, Statement } from 'src/components/Query';
import { createAPIFetcher } from 'src/utility';

export type API = {
  endpoint: string;
  persistedQueries: PersistedQuery[];
};

/** GraphQL Support */
export type PersistedQueryData = {
  query: Statement;
};
export type PersistedQueryPath = {
  longForm: string;
  shortForm: string;
};

export type PersistedQuery = {
  path: PersistedQueryPath;
  data: PersistedQueryData;
};

// /graphql/list.json => GraphQLListResponseConfig[]
export type GraphQLEndpointConfig = {
  configurationName: string;
  queries: PersistedQuery[];
};

export const mapAPIs = (response: GraphQLEndpointConfig[]): API[] => {
  return response.map((endpointConfig) => {
    return {
      endpoint: endpointConfig.configurationName,
      persistedQueries: endpointConfig.queries,
      url: buildGraphQLURL(endpointConfig.configurationName),
    };
  });
};

export type APIContextType = {
  /**
   * Stores an error raised during API Fetch requests
   */
  fetchError: string | null;
  /**
   * If there currently is an API request in-flight.
   */
  isFetching: boolean;
  /**
   * When the APIContextProvider is rendered, it fetches all available APIs that
   * are configured in AEM for GraphQL.
   */
  APIs: API[];
  /**
   * This will check all APIs to find the Persisted Queries based on a supplied API.
   * Matches the API endpoint with the stored APIs' endpoint. If a match is found,
   * then it returns the Persisted Queries from the stored APIS. If no match is found,
   * then it returns any pre-existing Persisted Queries found in the API object already,
   * or it returns an empty array.
   * @param api
   */
  getPersistedQueries: (api: API) => PersistedQuery[];
};

export const APIContext = createNullableContext<APIContextType>('APIContext');

export type APIContextProviderProps = PropsWithChildren;

export function APIContextProvider(props: APIContextProviderProps) {
  const { children } = props;
  const apiFetcher = useMemo(
    () =>
      createAPIFetcher({
        url: endpoints.graphQlListPath,
      }),
    [],
  );
  const [APIs, setAPIs] = useState([] as API[]);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadAPIs = useCallback(() => {
    async function fetchAPIs(): Promise<GraphQLEndpointConfig[]> {
      const fetch = fetcherReturnToPromise(apiFetcher({}));
      if (!isPromise(fetch)) {
        setFetchError('Fetcher did not return a Promise for API request');
      }
      setIsFetching(true);
      setFetchError(null);
      let result = await fetch;

      if (result === null || typeof result === 'undefined') {
        throw new Error(
          'Fetcher did not return results for API Request. ' +
            'Please ensure your AEM GraphQL Endpoints are ' +
            'properly configured and published.',
        );
      }

      setIsFetching(false);

      if (typeof result !== 'string') {
        return result as GraphQLEndpointConfig[];
      }

      const responseString = formatResult(result);
      setFetchError(responseString);
      return [];
    }

    fetchAPIs()
      .then((data: GraphQLEndpointConfig[]) => {
        const apis = data?.map(
          (config: GraphQLEndpointConfig): API => ({
            endpoint: config.configurationName,
            persistedQueries: config.queries,
          }),
        );
        setAPIs(apis);
      })
      .catch((error) => {
        setFetchError(formatError(error));
        setIsFetching(false);
      });
  }, [apiFetcher]);

  const getPersistedQueries = useCallback(
    (passedAPI: API) => {
      let foundAPI = APIs.find((api) => {
        return passedAPI.endpoint === api.endpoint;
      });
      return foundAPI?.persistedQueries || passedAPI.persistedQueries || [];
    },
    [APIs],
  );

  useEffect(() => {
    loadAPIs();
  }, [loadAPIs]);

  const value = useMemo(
    () => ({
      fetchError,
      isFetching,
      APIs,
      getPersistedQueries,
    }),
    [fetchError, isFetching, APIs, getPersistedQueries],
  );

  return <APIContext.Provider value={value}>{children}</APIContext.Provider>;
}

export const useAPIContext = createContextHook(APIContext);
