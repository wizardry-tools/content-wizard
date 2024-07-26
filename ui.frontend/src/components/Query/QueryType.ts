import { getParams } from '@/utility';
import { Query, QueryMap } from '@/types';

export const endpoints: Record<string, string> = {
  queryBuilderPath: '/bin/querybuilder.json',
  crxQueryPath: '/crx/de/query.jsp',
  graphQlListPath: '/graphql/list.json',
  nodeTypesPath: '/crx/de/nodetypes.jsp',
  fileSearchPath: '/crx/de/filesearch.jsp',
  predicatesPath: '/bin/acs-tools/qe/predicates.json',
};

export const AEM_GRAPHQL_ACTIONS = {
  persist: 'graphql/persist.json',
  execute: 'graphql/execute.json',
  list: 'graphql/list.json',
  endpoint: 'content/cq:graphql/global/endpoint.json',
  serviceURL: '/',
};

/** Language Support */
export const QueryLanguage = {
  SQL: 'SQL',
  JCR_SQL2: 'JCR_SQL2',
  XPATH: 'XPATH',
  QueryBuilder: 'QueryBuilder',
  GraphQL: 'GraphQL',
} as const;
export type QueryLanguageKey = keyof typeof QueryLanguage;
export const QueryLanguageLabels: Record<QueryLanguageKey, string> = {
  SQL: 'SQL',
  JCR_SQL2: 'JCR SQL2',
  XPATH: 'XPATH',
  QueryBuilder: 'QueryBuilder',
  GraphQL: 'GraphQL',
};

export function buildGraphQLURL(endpoint: string): string {
  return AEM_GRAPHQL_ACTIONS.serviceURL + AEM_GRAPHQL_ACTIONS.endpoint.replace('global', endpoint);
}

export function buildQueryString(query: Query): string {
  const { api, language, url } = query;
  if (language === QueryLanguage.GraphQL) {
    if (url) {
      return url;
    }
    // never called for IDE based requests
    if (api?.endpoint) {
      buildGraphQLURL(api.endpoint);
    }
    return AEM_GRAPHQL_ACTIONS.endpoint;
  }

  const params: Record<string, string> = getParams(query);
  return '?' + new URLSearchParams(params).toString();
}

export const defaultAdvancedQueries: QueryMap = {
  GraphQL: {
    language: QueryLanguage.GraphQL,
    url: buildGraphQLURL('we-retail'),
    statement: `{
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
      endpoint: 'we-retail',
      persistedQueries: [],
    },
    isAdvanced: true,
  },
  SQL: {
    language: QueryLanguage.SQL,
    statement: `select * from nt:unstructured as node
where node.[sling:resourceType] like 'weretail/components/content/teaser'`,
    url: endpoints.crxQueryPath,
    isAdvanced: true,
  },
  JCR_SQL2: {
    language: QueryLanguage.JCR_SQL2,
    statement: `SELECT * FROM [nt:unstructured] AS node
WHERE ISDESCENDANTNODE(node, "/content/we-retail")
AND PROPERTY(node.[sling:resourceType], "String") LIKE "weretail/components/content/teaser"`,
    url: endpoints.crxQueryPath,
    isAdvanced: true,
  },
  XPATH: {
    language: QueryLanguage.XPATH,
    statement: `/jcr:root/content/we-retail//element(*, nt:unstructured)
[
  (jcr:like(@sling:resourceType, 'weretail/components/content/teaser'))
]`,
    url: endpoints.crxQueryPath,
    isAdvanced: true,
  },
  QueryBuilder: {
    language: QueryLanguage.QueryBuilder,
    statement: `path=/content/we-retail
type=nt:unstructured
1_property=sling:resourceType
1_property.value=weretail/components/content/teaser
1_property.operation=like
p.limit=100
orderby=path`,
    url: '/bin/querybuilder.json',
    isAdvanced: true,
  },
};
