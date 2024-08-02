import { Fetcher, FetcherOpts, FetcherParams, SyncExecutionResult } from '@graphiql/toolkit/src/create-fetcher/types';
import { useCallback, useMemo } from 'react';
import { useAuthHeaders } from './useAuthHeaders';
import { CustomCreateFetcherOptions, SimpleFetcher } from '@/types';

export const useCreateFetcher = () => {
  const authHeaders = useAuthHeaders();

  const getRequestInit = useCallback(
    async (options: CustomCreateFetcherOptions, fetcherOpts?: FetcherOpts): Promise<RequestInit> => {
      const method = 'GET';
      const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers,
        ...fetcherOpts?.headers,
      };
      const authedHeaders = await authHeaders.get({ method, headers });
      return {
        method,
        headers: authedHeaders,
      };
    },
    [authHeaders],
  );

  /**
   * This GET fetcher isn't used by GraphQL, because GraphQL needs POST.
   * This is used for the other Query Languages, because the endpoints for those
   * only require a GET request.
   *
   * TODO: ensure that _fetcherParams is truly never useful since it isn't used.
   * @param options
   * @param httpFetch
   */
  const createGetFetcher = useCallback(
    (options: CustomCreateFetcherOptions, httpFetch: typeof fetch): Fetcher =>
      async (_fetcherParams: FetcherParams, fetcherOpts?: FetcherOpts) => {
        const init: RequestInit = await getRequestInit(options, fetcherOpts);
        const data = await httpFetch(options.url, init);
        const json: SyncExecutionResult = await data.json();
        if (options.onResults && typeof options.onResults === 'function') {
          options.onResults(json);
        }
        return json;
      },
    [getRequestInit],
  );

  const createSimpleGetFetcher = useCallback(
    (options: CustomCreateFetcherOptions, httpFetch: typeof fetch): SimpleFetcher =>
      async (fetcherOpts?: FetcherOpts): Promise<SyncExecutionResult> => {
        const init: RequestInit = await getRequestInit(options, fetcherOpts);
        const data = await httpFetch(options.url, init);
        const json: SyncExecutionResult = await data.json();
        if (options.onResults && typeof options.onResults === 'function') {
          options.onResults(json);
        }
        return json;
      },
    [getRequestInit],
  );

  /**
   * create a simple HTTP/S fetcher using a fetch implementation where
   * multipart is not needed.
   * Intended for GraphQL
   *
   * @param options {CustomCreateFetcherOptions}
   * @param httpFetch {typeof fetch}
   * @returns {Fetcher}
   */
  const createSimplePostFetcher = useCallback(
    (options: CustomCreateFetcherOptions, httpFetch: typeof fetch): Fetcher =>
      async (fetcherParams: FetcherParams, fetcherOpts?: FetcherOpts): Promise<SyncExecutionResult> => {
        const method = 'POST';
        // populate static headers
        const headers = {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...options.headers,
          ...fetcherOpts?.headers,
        };
        // fetch auth headers
        const authedHeaders = await authHeaders.get({ headers: headers, method });
        const init: RequestInit = {
          method,
          body: JSON.stringify(fetcherParams),
          headers: authedHeaders,
        };
        const data = await httpFetch(options.url, init);
        const json: SyncExecutionResult = await data.json();
        if (
          options.onResults &&
          typeof options.onResults === 'function' &&
          fetcherParams.operationName !== 'IntrospectionQuery'
        ) {
          options.onResults(json);
        }
        return json;
      },
    [authHeaders],
  );

  const createGraphQLFetcher = useCallback(
    (options: CustomCreateFetcherOptions): Fetcher => {
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
      const simpleFetcher = createSimplePostFetcher(options, httpFetch);

      return (graphQLParams: FetcherParams, fetcherOpts: FetcherOpts | undefined) => {
        if (graphQLParams.operationName === 'IntrospectionQuery') {
          return (options.schemaFetcher ?? simpleFetcher)(graphQLParams, fetcherOpts);
        }
        return simpleFetcher(graphQLParams, fetcherOpts);
      };
    },
    [createSimplePostFetcher],
  );

  const createMultiLanguageFetcher = useCallback(
    (options: CustomCreateFetcherOptions): Fetcher => {
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
    },
    [createGetFetcher],
  );

  const createAPIFetcher = useCallback(
    (options: CustomCreateFetcherOptions): SimpleFetcher => {
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
    },
    [createSimpleGetFetcher],
  );

  return useMemo(
    () => ({
      createGraphQLFetcher,
      createMultiLanguageFetcher,
      createAPIFetcher,
    }),
    [createGraphQLFetcher, createMultiLanguageFetcher, createAPIFetcher],
  );
};
