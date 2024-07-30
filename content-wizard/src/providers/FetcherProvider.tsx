import { createContext, useCallback, useContext, useMemo } from 'react';
import { Fetcher, SyncExecutionResult } from '@graphiql/toolkit/src/create-fetcher/types';
import { buildQueryString } from '@/components/Query';
import { useRenderCount, useCreateFetcher } from '@/utility';
import { CustomCreateFetcherOptions, FetcherProviderProps, FetcherResult, OnFetcherResults, Query } from '@/types';
import { useResultsDispatcher } from './ResultsProvider';
import { useQuery } from './QueryProvider';
import { useLogger } from './LoggingProvider/LoggingProvider.tsx';

const FetcherContext = createContext<Fetcher>(null!);

export function FetcherProvider({ children }: FetcherProviderProps) {
  const logger = useLogger();
  const renderCount = useRenderCount();
  logger.debug({ message: `FetcherProvider[${renderCount}] render()` });
  const { createGraphQLFetcher, createMultiLanguageFetcher } = useCreateFetcher();
  const resultsDispatch = useResultsDispatcher();
  const query = useQuery();

  const onResults = useCallback(
    (data: SyncExecutionResult | FetcherResult) => {
      logger.debug({ message: `FetcherProvider onResults()` });
      let results = null;
      if ('hits' in data) {
        results = data.hits ?? [];
      } else if ('results' in data) {
        results = data.hits ?? [];
      } else if (typeof data === 'object') {
        const json = JSON.stringify(data);
        if (json) {
          // build a Result[] with 1 Result
          results = [{ json }];
        }
      }
      if (results) {
        resultsDispatch({
          results,
        });
      }
    },
    [logger, resultsDispatch],
  );

  // TODO: This seems inefficient, rebuilding the fetcher anytime the query changes...
  const createQueryFetcher = useCallback(
    (query: Query, onResults: OnFetcherResults): Fetcher => {
      // only append queryString if it's not GraphQL
      logger.debug({ message: `FetcherProvider createQueryFetcher()` });
      const options: CustomCreateFetcherOptions = {
        url: query.url + (query.language !== 'GraphQL' ? buildQueryString(query) : ''),
        onResults: onResults,
      };
      switch (query.language) {
        case 'GraphQL': {
          return createGraphQLFetcher(options);
        }
        default: {
          return createMultiLanguageFetcher(options);
        }
      }
    },
    [createGraphQLFetcher, createMultiLanguageFetcher, logger],
  );

  /**
   * A function which accepts GraphQL HTTP parameters and returns a `Promise`,
   * `Observable` or `AsyncIterable` that returns the GraphQL response in
   * parsed JSON format.
   *
   * We suggest using the `createGraphiQLFetcher` utility from `@graphiql/toolkit`
   * to create these fetcher functions.
   *
   * @see {@link https://graphiql-test.netlify.app/typedoc/modules/graphiql_toolkit.html#creategraphiqlfetcher-2|`createGraphiQLFetcher`}
   */
  const value: Fetcher = useMemo(() => createQueryFetcher(query, onResults), [createQueryFetcher, query, onResults]);

  return <FetcherContext.Provider value={value}>{children}</FetcherContext.Provider>;
}

export function useFetcher() {
  return useContext(FetcherContext);
}
