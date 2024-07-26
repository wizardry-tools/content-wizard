import { Statement } from './Query';

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