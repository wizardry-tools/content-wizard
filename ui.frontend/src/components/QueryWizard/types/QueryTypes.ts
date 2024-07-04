import {Results} from "../../Results";
import {buildGraphQLURL} from "../../utility";
import {createReverseMapping} from "../../utility/libs";


/** Language Support */
export const QueryLanguage = {
  SQL: 'SQL',
  JCR_SQL2: 'JCR SQL2',
  XPATH: 'XPATH',
  QueryBuilder: 'QueryBuilder',
  GraphQL: 'GraphQL'
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type QueryLanguage = {
  SQL: 'SQL';
  JCR_SQL2: 'JCR SQL2';
  XPATH: 'XPATH';
  QueryBuilder: 'QueryBuilder';
  GraphQL: 'GraphQL';
}
export type QueryLanguageKey = keyof typeof QueryLanguage;
export type QueryLanguageType = typeof QueryLanguage[QueryLanguageKey];

export const QueryLanguageLookup:Record<QueryLanguageType, QueryLanguageKey> = createReverseMapping(QueryLanguage);


/** Query Support */
export type Statement = string;
export type API = GraphQLAPI;
export type Query = {
  language: QueryLanguageKey;
  statement: Statement;
  url: string;
  api?: API;
  status?: string;
  isAdvanced: boolean; // this is mainly for QueryBuilder language, as it's used in two different UIs and this differentiates the UIs.
  label?: string; // this gets populated when a History Query has an edited label.
}
export type QueryAction = Partial<Query> & {
  type: string;
}

export type QueryResponse = {
  results: Results
  status: string | number;
  query: Query;
}

export type QueryMap = Record<QueryLanguageKey,Query>;



/** GraphQL Support */
export type PersistedQueryData = {
  query: Statement;
}
export type PersistedQueryPath = {
  longForm: string;
  shortForm: string;
}

export type PersistedQuery = {
  path: PersistedQueryPath;
  data: PersistedQueryData;
}

// /graphql/list.json => GraphQLListResponseConfig[]
export type GraphQLEndpointConfig = {
  configurationName: string;
  queries: PersistedQuery[];
}

export const mapAPIs = (response: GraphQLEndpointConfig[]):GraphQLAPI[] => {
  return response.map((endpointConfig)=>{
    return {
      endpoint: endpointConfig.configurationName,
      persistedQueries: endpointConfig.queries,
      url: buildGraphQLURL(endpointConfig.configurationName)
    };
  })
}

// Custom Type
export type GraphQLAPI = {
  endpoint: string;
  persistedQueries: PersistedQuery[];
};