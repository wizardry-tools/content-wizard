import { Statement } from '@/types';
import { PropsWithChildren } from 'react';

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

export type GraphQLEndpointConfig = {
  configurationName: string;
  queries: PersistedQuery[];
};

export type APIContextType = {
  /**
   * Stores an error raised during API Fetch requests
   */
  fetchError: string | null;
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

export type APIContextProviderProps = PropsWithChildren;
