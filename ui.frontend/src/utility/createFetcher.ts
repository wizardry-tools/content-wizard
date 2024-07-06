import type {
  Fetcher,
  FetcherParams,
  FetcherOpts,
  FetcherReturnType,
} from '@graphiql/toolkit/src/create-fetcher/types';

import {
  createMultipartFetcher,
  createSimplePostFetcher,
  isSubscriptionWithName,
  getWsFetcher,
  createGetFetcher,
  createSimpleGetFetcher,
  SimpleFetcher,
} from './libs';
import { CreateFetcherOptions } from '@graphiql/toolkit/src/create-fetcher/types';

export type CustomCreateFetcherOptions = CreateFetcherOptions & {
  onResults?: (data: any) => void;
};

export function createGraphQLFetcher(options: CustomCreateFetcherOptions): Fetcher {
  let httpFetch;
  if (typeof window !== 'undefined' && window.fetch) {
    httpFetch = window.fetch;
  }
  if (options?.enableIncrementalDelivery === null || options.enableIncrementalDelivery !== false) {
    options.enableIncrementalDelivery = true;
  }
  if (options.fetch) {
    httpFetch = options.fetch;
  }
  if (!httpFetch) {
    throw new Error('No valid fetcher implementation available');
  }
  // simpler fetcher for schema requests
  const simpleFetcher = createSimplePostFetcher(options, httpFetch);

  const httpFetcher = options.enableIncrementalDelivery ? createMultipartFetcher(options, httpFetch) : simpleFetcher;

  return (graphQLParams: FetcherParams, fetcherOpts: FetcherOpts | undefined) => {
    if (graphQLParams.operationName === 'IntrospectionQuery') {
      return (options.schemaFetcher || simpleFetcher)(graphQLParams, fetcherOpts);
    }
    const isSubscription = fetcherOpts?.documentAST
      ? isSubscriptionWithName(fetcherOpts.documentAST, graphQLParams.operationName || undefined)
      : false;
    if (isSubscription) {
      const wsFetcher = getWsFetcher(options, fetcherOpts);

      if (!wsFetcher) {
        throw new Error(
          `Your GraphiQL createFetcher is not properly configured for websocket subscriptions yet. ${
            options.subscriptionUrl
              ? `Provided URL ${options.subscriptionUrl} failed`
              : 'Please provide subscriptionUrl, wsClient or legacyClient option first.'
          }`,
        );
      }
      return wsFetcher(graphQLParams);
    }
    return httpFetcher(graphQLParams, fetcherOpts) as FetcherReturnType;
  };
}

export function createMultiLanguageFetcher(options: CustomCreateFetcherOptions): Fetcher {
  let httpFetch;
  if (typeof window !== 'undefined' && window.fetch) {
    httpFetch = window.fetch;
  }
  if (options.fetch) {
    httpFetch = options.fetch;
  }
  if (!httpFetch) {
    throw new Error('No valid fetcher implementation available');
  }
  // simpler fetcher for schema requests
  return createGetFetcher(options, httpFetch);
}

export function createAPIFetcher(options: CustomCreateFetcherOptions): SimpleFetcher {
  let httpFetch;
  if (typeof window !== 'undefined' && window.fetch) {
    httpFetch = window.fetch;
  }
  if (options.fetch) {
    httpFetch = options.fetch;
  }
  if (!httpFetch) {
    throw new Error('No valid fetcher implementation available');
  }
  return createSimpleGetFetcher(options, httpFetch);
}
