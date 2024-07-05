import {Results} from "../Results";
import {createReverseMapping, getParams} from "../utility";
import {AEM_GRAPHQL_ACTIONS} from "../utility/ClientService";


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

export const defaultQueryURL: string = '/crx/de/query.jsp';
export const queryBuilderURL: string = '/bin/querybuilder.json';

export const endpoints: {[name: string]: string} = {
  queryBuilderPath: '/bin/querybuilder.json',
  nodeTypesPath: '/crx/de/nodetypes.jsp',
  fileSearchPath: '/crx/de/filesearch.jsp',
  predicatesPath: '/bin/acs-tools/qe/predicates.json'
};

export function buildGraphQLURL(endpoint: string): string {
  return AEM_GRAPHQL_ACTIONS.serviceURL + (AEM_GRAPHQL_ACTIONS.endpoint.replace('global',endpoint));
}

export function buildQueryString(query: Query): string {
  if (query.language === QueryLanguageLookup[QueryLanguage.GraphQL]) {
    // never called for IDE based requests
    if (query.api?.endpoint ) {
      buildGraphQLURL(query.api.endpoint);
    }
    return AEM_GRAPHQL_ACTIONS.endpoint;
  }

  const params: {[name:string]: string} = getParams(query);
  return '?' + new URLSearchParams(params);
}



export const defaultAdvancedQueries: QueryMap = {
  GraphQL: {
    language: QueryLanguageLookup[QueryLanguage.GraphQL] as QueryLanguageKey,
    url: buildGraphQLURL("we-retail"),
    statement:
      `{
  weRetailStoreInfoList {
    items {
      _path
      _variations
      storelocation
      contactnumber
      description
      gift_cards
      dateopened
    }
  }
}`,
    api: {
      endpoint: "we-retail",
      persistedQueries: []
    },
    isAdvanced: true
  },
  SQL: {
    language: QueryLanguageLookup[QueryLanguage.SQL] as QueryLanguageKey,
    statement:
      `select * from nt:unstructured as node
where node.[sling:resourceType] like 'weretail/components/content/teaser'`,
    url: defaultQueryURL,
    isAdvanced: true
  },
  JCR_SQL2: {
    language: QueryLanguageLookup[QueryLanguage.JCR_SQL2],
    statement:
      `SELECT * FROM [nt:unstructured] AS node
WHERE ISDESCENDANTNODE(node, "/content/we-retail")
AND PROPERTY(node.[sling:resourceType], "String") LIKE "weretail/components/content/teaser"`,
    url: defaultQueryURL,
    isAdvanced: true
  },
  XPATH: {
    language: QueryLanguageLookup[QueryLanguage.XPATH] as QueryLanguageKey,
    statement:
      `/jcr:root/content/we-retail//element(*, nt:unstructured)
[
  (jcr:like(@sling:resourceType, 'weretail/components/content/teaser'))
]`,
    url: defaultQueryURL,
    isAdvanced: true
  },
  QueryBuilder: {
    language: QueryLanguageLookup[QueryLanguage.QueryBuilder] as QueryLanguageKey,
    statement:
      `path=/content/we-retail
type=nt:unstructured
1_property=sling:resourceType
1_property.value=weretail/components/content/teaser
1_property.operation=like
p.limit=100
orderby=path`,
    url: '/bin/querybuilder.json',
    isAdvanced: true
  }
};
