import type {
  Fetcher,
  FetcherParams,
  FetcherOpts,
  FetcherReturnType
} from "@graphiql/toolkit/src/create-fetcher/types";

import {
  createMultipartFetcher,
  createSimplePostFetcher,
  isSubscriptionWithName,
  getWsFetcher, CustomCreateFetcherOptions, createSimpleGetFetcher,
} from './libs';
import {Query, QueryLanguage, QueryLanguageLookup} from "../QueryWizard/types/QueryTypes";

/**
 * build a GraphiQL fetcher that is:
 * - backwards compatible
 * - optionally supports graphql-ws or `
 *
 * @param options {CustomCreateFetcherOptions}
 * @returns {Fetcher}
 */
export function createCustomIDEPoster(options: CustomCreateFetcherOptions): Fetcher {
  console.log("Creating custom POSTER: ", options);
  let httpFetch;
  if (typeof window !== 'undefined' && window.fetch) {
    httpFetch = window.fetch;
  }
  if (
    options?.enableIncrementalDelivery === null ||
    options.enableIncrementalDelivery !== false
  ) {
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

  const httpFetcher = options.enableIncrementalDelivery
    ? createMultipartFetcher(options, httpFetch)
    : simpleFetcher;

  return (graphQLParams: FetcherParams, fetcherOpts: FetcherOpts | undefined) => {
    if (graphQLParams.operationName === 'IntrospectionQuery') {
      return (options.schemaFetcher || simpleFetcher)(
        graphQLParams,
        fetcherOpts,
      );
    }
    const isSubscription = fetcherOpts?.documentAST
      ? isSubscriptionWithName(
        fetcherOpts.documentAST,
        graphQLParams.operationName || undefined,
      )
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

export function createCustomFetcher(query: Query, onResults: (data: any)=>void): Fetcher {
  let options:CustomCreateFetcherOptions = {
    url: query.url,
    onResults: onResults
  }
  switch (query.language) {
    case QueryLanguageLookup[QueryLanguage.GraphQL]: {
      return createGraphQLFetcher(options);
    }
    default: {
      options.query = query;
      return createMultiLanguageFetcher(options);
    }
  }
}

function createGraphQLFetcher(options: CustomCreateFetcherOptions): Fetcher {
  let httpFetch;
  if (typeof window !== 'undefined' && window.fetch) {
    httpFetch = window.fetch;
  }
  if (
    options?.enableIncrementalDelivery === null ||
    options.enableIncrementalDelivery !== false
  ) {
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

  const httpFetcher = options.enableIncrementalDelivery
    ? createMultipartFetcher(options, httpFetch)
    : simpleFetcher;

  return (graphQLParams: FetcherParams, fetcherOpts: FetcherOpts | undefined) => {
    if (graphQLParams.operationName === 'IntrospectionQuery') {
      return (options.schemaFetcher || simpleFetcher)(
        graphQLParams,
        fetcherOpts,
      );
    }
    const isSubscription = fetcherOpts?.documentAST
      ? isSubscriptionWithName(
        fetcherOpts.documentAST,
        graphQLParams.operationName || undefined,
      )
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
  return createSimpleGetFetcher(options, httpFetch);
}
