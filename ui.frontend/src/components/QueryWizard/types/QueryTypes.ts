import {buildGraphQLURL} from "../../utility/query";
import {createReverseMapping} from "../../utility/libs";
import {Results} from "./ResultType";


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
  isAdvanced: boolean;
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