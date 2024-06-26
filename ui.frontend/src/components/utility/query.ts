import {AEM_GRAPHQL_ACTIONS} from "../QueryWizard/services/ClientService";
import {Query, QueryLanguage, QueryLanguageLookup} from "../QueryWizard/types/QueryTypes";
import {getParams} from "./http";


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