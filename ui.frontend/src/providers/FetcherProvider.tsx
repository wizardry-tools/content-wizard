import { createContext, PropsWithChildren, useCallback, useContext, useMemo } from 'react';
import { Fetcher } from '@graphiql/toolkit/src/create-fetcher/types';
import { buildQueryString, Query, QueryLanguage } from '../components/Query';
import { createGraphQLFetcher, createMultiLanguageFetcher, CustomCreateFetcherOptions } from '../utility';
import { Result } from 'src/components/Results';
import { useResultsDispatcher } from './ResultsProvider';
import { useQuery } from './QueryProvider';
import { useLogger } from './LoggingProvider';
import { useRenderCount } from 'src/utility';

const FetcherContext = createContext<Fetcher>(null!);

export type FetcherProviderProps = PropsWithChildren;
export function FetcherProvider({ children }: FetcherProviderProps) {
  const logger = useLogger();
  const renderCount = useRenderCount();
  logger.debug({ message: `FetcherProvider[${renderCount}] render()` });

  const resultsDispatch = useResultsDispatcher();
  const query = useQuery();

  const onResults = useCallback(
    (data: any) => {
      logger.debug({ message: `FetcherProvider onResults()` });
      const results: Result[] = data.hits || data.results || JSON.stringify(data);
      resultsDispatch({
        results,
        caller: FetcherProvider,
      });
    },
    [logger, resultsDispatch],
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
  const fetcher: Fetcher = useMemo(() => createQueryFetcher(query, onResults), [query, onResults]);

  return <FetcherContext.Provider value={fetcher}>{children}</FetcherContext.Provider>;
}

export function useFetcher() {
  return useContext(FetcherContext);
}

// TODO: This seems inefficient, rebuilding the fetcher anytime the query changes...
function createQueryFetcher(query: Query, onResults: (data: any) => void): Fetcher {
  // only append queryString if it's not GraphQL
  let options: CustomCreateFetcherOptions = {
    url: query.url + (query.language !== QueryLanguage.GraphQL ? buildQueryString(query) : ''),
    onResults: onResults,
  };
  switch (query.language) {
    case QueryLanguage.GraphQL: {
      return createGraphQLFetcher(options);
    }
    default: {
      return createMultiLanguageFetcher(options);
    }
  }
}
