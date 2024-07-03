import {
  QueryLanguage,
  QueryLanguageKey,
  QueryLanguageLookup,
  QueryMap
} from "./types/QueryTypes";
import {buildGraphQLURL} from "../utility";


export const defaultQueryURL: string = '/crx/de/query.jsp';
export const queryBuilderURL: string = '/bin/querybuilder.json';


// Ugh, have to store the statements with bad indentation
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

