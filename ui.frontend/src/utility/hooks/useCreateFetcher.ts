import type {
  CreateFetcherOptions,
  ExecutionResultPayload,
  Fetcher,
  FetcherOpts,
  FetcherParams,
  FetcherReturnType,
} from '@graphiql/toolkit/src/create-fetcher/types';
import { useCallback, useMemo } from 'react';
import { Client, ClientOptions, ExecutionResult } from 'graphql-ws';
import { createClient as createClientType } from 'graphql-ws/lib/client';
import { isAsyncIterable, makeAsyncIterableIteratorFromSink } from '@n1ru4l/push-pull-async-iterable-iterator';
import { Observable } from '@graphiql/toolkit';
import { meros } from 'meros';
import { DocumentNode, visit } from 'graphql';
import { useAuthHeaders } from './useAuthHeaders';
import { useLogger } from '../../providers';
import { useRenderCount } from './useRenderCount';

export type SimpleFetcher = (opts?: FetcherOpts) => FetcherReturnType;
export type CustomCreateFetcherOptions = CreateFetcherOptions & {
  onResults?: (data: any) => void;
};

export const useCreateFetcher = () => {
  const logger = useLogger();
  const renderCount = useRenderCount();
  logger.debug({ message: `useCreateFetcher[${renderCount}] render()` });
  const authHeaders = useAuthHeaders();

  const errorHasCode = useCallback((err: unknown): err is { code: string } => {
    return typeof err === 'object' && err !== null && 'code' in err;
  }, []);

  const getRequestInit = useCallback(
    async (options: CustomCreateFetcherOptions, fetcherOpts?: FetcherOpts): Promise<RequestInit> => {
      logger.debug({ message: `useCreateFetcher getRequestInit()` });
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
    [authHeaders, logger],
  );

  const isSubscriptionWithName = (document: DocumentNode, name: string | undefined): boolean => {
    let isSubscription = false;
    visit(document, {
      OperationDefinition(node) {
        if (name === node.name?.value && node.operation === 'subscription') {
          isSubscription = true;
        }
      },
    });
    return isSubscription;
  };

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
        const json = await data.json();
        if (options.onResults && typeof options.onResults === 'function') {
          options.onResults(json);
        }
        return json;
      },
    [getRequestInit],
  );

  const createSimpleGetFetcher = useCallback(
    (options: CustomCreateFetcherOptions, httpFetch: typeof fetch): SimpleFetcher =>
      async (fetcherOpts?: FetcherOpts) => {
        const init: RequestInit = await getRequestInit(options, fetcherOpts);
        const data = await httpFetch(options.url, init);
        const json = await data.json();
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
   * @param options {CreateFetcherOptions}
   * @param httpFetch {typeof fetch}
   * @returns {Fetcher}
   */
  const createSimplePostFetcher = useCallback(
    (options: CustomCreateFetcherOptions, httpFetch: typeof fetch): Fetcher =>
      async (fetcherParams: FetcherParams, fetcherOpts?: FetcherOpts) => {
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
        const json = await data.json();
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

  /**
   * Create ws/s fetcher using provided wsClient implementation
   *
   * @param wsClient {Client}
   * @returns {Fetcher}
   */
  const createWebsocketsFetcherFromClient = useCallback(
    (wsClient: Client): Fetcher =>
      (graphQLParams: FetcherParams) =>
        makeAsyncIterableIteratorFromSink<ExecutionResult>((sink) =>
          wsClient.subscribe(graphQLParams, {
            ...sink,
            error(err) {
              if (err instanceof CloseEvent) {
                sink.error(new Error(`Socket closed with event ${err.code} ${err.reason || ''}`.trim()));
              } else {
                sink.error(err);
              }
            },
          }),
        ),
    [],
  );

  const createWebsocketsFetcherFromUrl = useCallback(
    (url: string, connectionParams?: ClientOptions['connectionParams']) => {
      let wsClient;
      try {
        const { createClient } = require('graphql-ws') as {
          createClient: typeof createClientType;
        };

        // TODO: defaults?
        wsClient = createClient({
          url,
          connectionParams,
        });
        return createWebsocketsFetcherFromClient(wsClient);
      } catch (err) {
        if (errorHasCode(err) && err.code === 'MODULE_NOT_FOUND') {
          throw new Error(
            "You need to install the 'graphql-ws' package to use websockets when passing a 'subscriptionUrl'",
          );
        }
        // eslint-disable-next-line no-console
        console.error(`Error creating websocket client for ${url}`, err);
      }
    },
    [createWebsocketsFetcherFromClient, errorHasCode],
  );

  /**
   * Allow legacy websockets protocol client, but no definitions for it,
   * as the library is deprecated and has security issues
   *
   * @param legacyWsClient
   * @returns
   */
  const createLegacyWebsocketsFetcher = useCallback(
    (legacyWsClient: { request: (params: FetcherParams) => unknown }) => (graphQLParams: FetcherParams) => {
      const observable = legacyWsClient.request(graphQLParams);
      return makeAsyncIterableIteratorFromSink<ExecutionResult>(
        // @ts-ignore
        (sink) => observable.subscribe(sink).unsubscribe,
      );
    },
    [],
  );

  /**
   * create a fetcher with the `IncrementalDelivery` HTTP/S spec for
   * `@stream` and `@defer` support using `fetch-multipart-graphql`
   *
   * @param options {CreateFetcherOptions}
   * @param httpFetch {typeof fetch}
   * @returns {Fetcher}
   */
  const createMultipartFetcher = useCallback(
    (
      options: CreateFetcherOptions,
      httpFetch: typeof fetch,
    ): ((
      graphQLParams: FetcherParams,
      fetcherOpts?: FetcherOpts,
    ) => AsyncGenerator<
      | Promise<any>
      | (
          | string
          | { data?: any; errors?: Array<any>; hasNext: boolean }
          | { data?: any; errors?: any[]; path: (string | number)[]; hasNext: boolean }
        )[],
      any,
      Promise<
        | ExecutionResult<Record<string, unknown>, Record<string, unknown>>
        | Observable<ExecutionResult<Record<string, unknown>, Record<string, unknown>>>
        | AsyncIterable<ExecutionResult>
      > &
        ExecutionResult<Record<string, unknown>, Record<string, unknown>> &
        Observable<ExecutionResult<Record<string, unknown>, Record<string, unknown>>> &
        AsyncIterable<ExecutionResult>
    >) =>
      async function* (graphQLParams: FetcherParams, fetcherOpts?: FetcherOpts) {
        const headers = {
          'content-type': 'application/json',
          accept: 'application/json, multipart/mixed',
          ...options.headers,
          // allow user-defined headers to override
          // the static provided headers
          ...fetcherOpts?.headers,
        };
        const authedHeaders = await authHeaders.get({ method: 'POST', headers });
        const response = await httpFetch(options.url, {
          method: 'POST',
          body: JSON.stringify(graphQLParams),
          headers: authedHeaders,
        }).then((r) =>
          meros<Extract<ExecutionResultPayload, { hasNext: boolean }>>(r, {
            multiple: true,
          }),
        );

        // Follows the same as createSimpleFetcher above, in that we simply return it as json.
        if (!isAsyncIterable(response)) {
          return yield response.json();
        }

        for await (const chunk of response) {
          if (chunk.some((part) => !part.json)) {
            const message = chunk.map((part) => `Headers::\n${part.headers}\n\nBody::\n${part.body}`);
            throw new Error(`Expected multipart chunks to be of json type. got:\n${message}`);
          }
          yield chunk.map((part) => part.body);
        }
      },
    [authHeaders],
  );

  /**
   * If `wsClient` or `legacyClient` are provided, then `subscriptionUrl` is overridden.
   * @param options {CreateFetcherOptions}
   * @param fetcherOpts {FetcherOpts | undefined}
   * @returns
   */
  const getWsFetcher = useCallback(
    (options: CreateFetcherOptions, fetcherOpts: FetcherOpts | undefined) => {
      if (options.wsClient) {
        return createWebsocketsFetcherFromClient(options.wsClient);
      }
      if (options.subscriptionUrl) {
        return createWebsocketsFetcherFromUrl(options.subscriptionUrl, {
          ...options.wsConnectionParams,
          ...fetcherOpts?.headers,
        });
      }
      const legacyWebsocketsClient = options.legacyClient || options.legacyWsClient;
      if (legacyWebsocketsClient) {
        return createLegacyWebsocketsFetcher(legacyWebsocketsClient);
      }
    },
    [createLegacyWebsocketsFetcher, createWebsocketsFetcherFromClient, createWebsocketsFetcherFromUrl],
  );

  const createGraphQLFetcher = useCallback(
    (options: CustomCreateFetcherOptions): Fetcher => {
      logger.debug({ message: `useCreateFetcher createGraphQLFetcher()` });
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

      const httpFetcher = options.enableIncrementalDelivery
        ? createMultipartFetcher(options, httpFetch)
        : simpleFetcher;

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
    },
    [createMultipartFetcher, createSimplePostFetcher, getWsFetcher, logger],
  );

  const createMultiLanguageFetcher = useCallback(
    (options: CustomCreateFetcherOptions): Fetcher => {
      logger.debug({ message: `useCreateFetcher createMultiLanguageFetcher()` });
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
    [createGetFetcher, logger],
  );

  const createAPIFetcher = useCallback(
    (options: CustomCreateFetcherOptions): SimpleFetcher => {
      logger.debug({ message: `useCreateFetcher createAPIFetcher()` });
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
    [createSimpleGetFetcher, logger],
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
