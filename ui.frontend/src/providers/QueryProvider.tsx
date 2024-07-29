import { createContext, Dispatch, PropsWithChildren, useCallback, useContext, useMemo, useReducer } from 'react';
import {
  Query,
  QueryAction,
  QueryRunnerResponse,
  QueryRunnerProps,
  FetcherResult,
  Result,
  QueryLanguage,
} from '@/types';
import { DYNAMIC_HEADERS, getParams, useRenderCount } from '@/utility';
import { buildGraphQLURL, buildQueryString, endpoints } from '@/components/Query';
import { useStorageContext } from '@/components/IDE/core/src';
import { defaultFields } from '@/components/QueryWizard/Components';
import { useLogger } from './LoggingProvider';
import { generateQuery } from './FieldsProvider';

const QueryContext = createContext<Query>(null!);
const QueryDispatchContext = createContext<Dispatch<QueryAction>>(null!);
const QueryRunnerContext = createContext<(props: QueryRunnerProps) => Promise<QueryRunnerResponse>>(null!);
const IsGraphQLContext = createContext<boolean>(false);

const defaultSimpleQuery: Query = {
  statement: generateQuery(defaultFields), // build inside provider init
  language: 'QueryBuilder',
  url: endpoints.queryBuilderPath,
  status: '',
  isAdvanced: false,
};

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

export function useQuery() {
  return useContext(QueryContext);
}

export function useQueryDispatcher() {
  return useContext(QueryDispatchContext);
}

export function useQueryRunner() {
  return useContext(QueryRunnerContext);
}

export function useIsGraphQL() {
  return useContext(IsGraphQLContext);
}

/**
 * Query Actions???
 * 1. Update Statement
 * 2. Update Language (which replaces Query with defaultQuery based on language)
 * 3. Update Status
 * 4. Update API
 * @param query
 * @param action
 */
function queryReducer(query: Query, action: QueryAction): Query {
  switch (action.type) {
    case 'statementChange': {
      // 1
      return {
        ...query,
        statement: action.statement!,
      };
    }
    case 'replaceQuery': {
      // 2
      return {
        ...(action as Query),
      };
    }
    case 'statusChange': {
      // 3
      return {
        ...query,
        status: action.status!,
      };
    }
    case 'apiChange': {
      // 4
      const api = action.api!;
      return {
        ...query,
        api: api,
        url: buildGraphQLURL(api.endpoint),
      };
    }
    default: {
      throw Error(`Unknown Query Action ${action.type}`);
    }
  }
}
