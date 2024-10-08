import type { Query } from '@/types';
import { graphQLEndpoint } from '@/constants';
import { getParams } from './http';

export const isQueryValid = (query: unknown) => {
  return !!query && typeof query === 'object' && 'language' in query && 'statement' in query && 'url' in query;
};

export function buildGraphQLURL(endpoint: string): string {
  return graphQLEndpoint.replace('global', endpoint);
}

export function buildQueryString(query: Query): string {
  const { api, language, url } = query;
  if (language === 'GraphQL') {
    if (url) {
      return url;
    }
    // never called for IDE based requests
    if (api?.endpoint) {
      return buildGraphQLURL(api.endpoint);
    }
    return graphQLEndpoint;
  }

  const params: Record<string, string> = getParams(query);
  return '?' + new URLSearchParams(params).toString();
}
