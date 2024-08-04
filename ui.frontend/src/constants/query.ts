import type {
  ContentType,
  ContentTypeProperty,
  QueryLanguageMap,
  QueryMap,
  TargetType,
  TargetTypeLabel,
} from '@/types';
import { crxQueryPath, queryBuilderPath } from './endpoints';
import { graphQLEndpoint } from './graphql';

export const QUERY_LANGUAGES: QueryLanguageMap = {
  SQL: 'SQL',
  JCR_SQL2: 'JCR SQL2',
  XPATH: 'XPATH',
  QueryBuilder: 'QueryBuilder',
  GraphQL: 'GraphQL',
};

export const targetTypes: Record<TargetType, TargetTypeLabel> = {
  none: 'None',
  resource: 'Resource Type',
  template: 'Template Type',
  text: 'Full Text Search',
};

// pull the correct jcr:contentType from this map when you want to use it based on the user's selected Content Type
export const contentTypes: Record<ContentType, ContentTypeProperty> = {
  page: 'cq:Page',
  xf: 'cq:Page',
  asset: 'dam:Asset',
  cf: 'dam:Asset',
  child: 'nt:unstructured',
};

export const defaultAdvancedQueries: QueryMap = {
  GraphQL: {
    language: 'GraphQL',
    url: graphQLEndpoint.replace('global', 'we-retail'),
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
    language: 'SQL',
    statement: `select * from nt:unstructured as node
where node.[sling:resourceType] like 'weretail/components/content/teaser'`,
    url: crxQueryPath,
    isAdvanced: true,
  },
  JCR_SQL2: {
    language: 'JCR_SQL2',
    statement: `SELECT * FROM [nt:unstructured] AS node
WHERE ISDESCENDANTNODE(node, "/content/we-retail")
AND PROPERTY(node.[sling:resourceType], "String") LIKE "weretail/components/content/teaser"`,
    url: crxQueryPath,
    isAdvanced: true,
  },
  XPATH: {
    language: 'XPATH',
    statement: `/jcr:root/content/we-retail//element(*, nt:unstructured)
[
  (jcr:like(@sling:resourceType, 'weretail/components/content/teaser'))
]`,
    url: crxQueryPath,
    isAdvanced: true,
  },
  QueryBuilder: {
    language: 'QueryBuilder',
    statement: `path=/content/we-retail
type=nt:unstructured
1_property=sling:resourceType
1_property.value=weretail/components/content/teaser
1_property.operation=like
p.limit=100
orderby=path`,
    url: queryBuilderPath,
    isAdvanced: true,
  },
};
