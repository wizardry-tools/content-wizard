import { useCallback, useMemo, useReducer } from 'react';
import type { PropsWithChildren } from 'react';
import type { QueryRunnerResponse, QueryRunnerProps, FetcherResult, Result, QueryLanguage } from '@/types';
import { DYNAMIC_HEADERS, getParams, useRenderCount } from '@/utility';
import { buildQueryString } from '@/components/Query';
import { useStorageContext } from '@/components/IDE/core/src';
import { useLogger } from '../LoggingProvider';
import {
  defaultSimpleQuery,
  IsGraphQLContext,
  QueryContext,
  QueryDispatchContext,
  queryReducer,
  QueryRunnerContext,
} from './context';

export function QueryProvider({ children }: PropsWithChildren) {
  useStorageContext();
  const logger = useLogger();
  const renderCount = useRenderCount();
  logger.debug({ message: `QueryProvider[${renderCount}] render()` });
  const [query, queryDispatcher] = useReducer(queryReducer, defaultSimpleQuery);

  /**
   * This boolean will toggle features on/off for the IDE,
   * since the IDE was originally written for GraphQL.
   */
  const isGraphQL = useMemo(() => query.language === ('GraphQL' as QueryLanguage), [query.language]);

  const queryRunner = useCallback(
    async ({ query }: QueryRunnerProps): Promise<QueryRunnerResponse> => {
      logger.debug({ message: `QueryProvider queryRunner()` });
      const url = query.url + buildQueryString(query);
      // prechecks
      if (!url) {
        return {
          results: [],
          status: 'Refusing to query with empty URL',
          query,
        };
      }
      const params = isGraphQL ? getParams(query) : DYNAMIC_HEADERS;

      // flight
      try {
        const response = await fetch(url, params);
        if (response.ok) {
          const json: FetcherResult = await response.json();
          let results: Result[] = [];
          if ('hits' in json) {
            results = json.hits ?? [];
          } else if ('results' in json) {
            results = json.results ?? [];
          } else if ('data' in json) {
            const jsonString = JSON.stringify(json.data);
            if (jsonString) {
              // build a Result[] with 1 Result
              results = [{ json: jsonString }];
            }
          }
          return {
            results,
            status: response.status,
            query,
          };
        }
      } catch (e) {
        console.error(e);
        if (e instanceof Error) {
          const message = e.toString();
          return {
            results: [],
            status: `ERROR occurred while fetching results: ${message}`,
            query,
          };
        }
      }
      // default
      return {
        results: [],
        status: `Failed to fetch results`,
        query,
      };
    },
    [isGraphQL, logger],
  );

  return (
    <QueryContext.Provider value={query}>
      <IsGraphQLContext.Provider value={isGraphQL}>
        <QueryDispatchContext.Provider value={queryDispatcher}>
          <QueryRunnerContext.Provider value={queryRunner}>{children}</QueryRunnerContext.Provider>
        </QueryDispatchContext.Provider>
      </IsGraphQLContext.Provider>
    </QueryContext.Provider>
  );
}
