import {getParams} from "src/utility";
import {API} from "src/components/IDE/core/src";
import {Results} from "src/components/Results";

export const endpoints: {[name: string]: string} = {
  queryBuilderPath: '/bin/querybuilder.json',
  crxQueryPath: '/crx/de/query.jsp',
  graphQlListPath: '/graphql/list.json',
  nodeTypesPath: '/crx/de/nodetypes.jsp',
  fileSearchPath: '/crx/de/filesearch.jsp',
  predicatesPath: '/bin/acs-tools/qe/predicates.json'
};

export const AEM_GRAPHQL_ACTIONS = {
  persist: 'graphql/persist.json',
  execute: 'graphql/execute.json',
  list: 'graphql/list.json',
  endpoint: 'content/cq:graphql/global/endpoint.json',
  serviceURL: '/',

}

/** Language Support */
export const QueryLanguage = {
  SQL: 'SQL',
  JCR_SQL2: 'JCR_SQL2',
  XPATH: 'XPATH',
  QueryBuilder: 'QueryBuilder',
  GraphQL: 'GraphQL'
} as const;
export type QueryLanguageKey = keyof typeof QueryLanguage;
export const QueryLanguageLabels: Record<QueryLanguageKey, string> = {
  SQL: 'SQL',
  JCR_SQL2: 'JCR SQL2',
  XPATH: 'XPATH',
  QueryBuilder: 'QueryBuilder',
  GraphQL: 'GraphQL'
}


/** Query Support */
export type Statement = string;

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

export function buildGraphQLURL(endpoint: string): string {
  return AEM_GRAPHQL_ACTIONS.serviceURL + (AEM_GRAPHQL_ACTIONS.endpoint.replace('global',endpoint));
}

export function buildQueryString(query: Query): string {
  if (query.language === QueryLanguage.GraphQL) {
    if (query.url) {
      return query.url;
    }
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
    language: QueryLanguage.GraphQL,
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
    language: QueryLanguage.SQL,
    statement:
      `select * from nt:unstructured as node
where node.[sling:resourceType] like 'weretail/components/content/teaser'`,
    url: endpoints.crxQueryPath,
    isAdvanced: true
  },
  JCR_SQL2: {
    language: QueryLanguage.JCR_SQL2,
    statement:
      `SELECT * FROM [nt:unstructured] AS node
WHERE ISDESCENDANTNODE(node, "/content/we-retail")
AND PROPERTY(node.[sling:resourceType], "String") LIKE "weretail/components/content/teaser"`,
    url: endpoints.crxQueryPath,
    isAdvanced: true
  },
  XPATH: {
    language: QueryLanguage.XPATH,
    statement:
      `/jcr:root/content/we-retail//element(*, nt:unstructured)
[
  (jcr:like(@sling:resourceType, 'weretail/components/content/teaser'))
]`,
    url: endpoints.crxQueryPath,
    isAdvanced: true
  },
  QueryBuilder: {
    language: QueryLanguage.QueryBuilder,
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