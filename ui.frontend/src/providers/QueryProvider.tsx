import {
  createContext,
  Dispatch,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { DYNAMIC_HEADERS, getParams } from 'src/utility';
import {
  buildGraphQLURL,
  buildQueryString,
  endpoints,
  Query,
  QueryAction,
  QueryLanguage,
  QueryLanguageKey,
  QueryResponse,
  Statement,
} from 'src/components/Query';
import { API, useStorageContext } from 'src/components/IDE/core/src';
import { useLogger } from './LoggingProvider';
import { defaultFields } from '../components/QueryWizard/Components';
import { generateQuery } from './FieldsProvider';

export type QueryRunnerProps = {
  query: Query;
  caller: Function;
};

const QueryContext = createContext<Query>(null!);
const QueryDispatchContext = createContext<Dispatch<QueryAction>>(null!);
const QueryRunnerContext = createContext<(props: QueryRunnerProps) => Promise<QueryResponse>>(null!);
const IsGraphQLContext = createContext<boolean>(false);

const defaultSimpleQuery: Query = {
  statement: generateQuery(defaultFields), // build inside provider init
  language: QueryLanguage.QueryBuilder,
  url: endpoints.queryBuilderPath,
  status: '',
  isAdvanced: false,
};

export function QueryProvider({ children }: PropsWithChildren) {
  useStorageContext();
  const logger = useLogger();
  const renderCount = useRef(0);
  logger.debug({ message: `QueryProvider[${++renderCount.current}] render()` });
  const [query, queryDispatcher] = useReducer(queryReducer, defaultSimpleQuery);

  /**
   * This boolean will toggle features on/off for the IDE,
   * since the IDE was originally written for GraphQL.
   */
  const isGraphQL = useMemo(() => query.language === (QueryLanguage.GraphQL as QueryLanguageKey), [query.language]);

  const queryRunner = useCallback(
    async ({ query, caller }: QueryRunnerProps): Promise<QueryResponse> => {
      logger.debug({ message: `QueryProvider[${renderCount.current}] queryRunner()`, caller });
      const url = query.url + buildQueryString(query);
      // prechecks
      if (!url) {
        return {
          results: [],
          status: 'Refusing to query with empty URL',
          query,
        };
      }
      let params = isGraphQL ? getParams(query) : DYNAMIC_HEADERS;

      // flight
      try {
        let response = await fetch(url, params);
        if (response.ok) {
          let json = await response.json();
          return {
            results: json.hits || json.results || JSON.stringify(json.data),
            status: response.status,
            query,
          };
        }
      } catch (e) {
        console.error(e);
        return {
          results: null,
          status: `ERROR occurred while fetching results: ${e}`,
          query,
        };
      }
      // default
      return {
        results: null,
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
        statement: action.statement as Statement,
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
        status: action.status as string,
      };
    }
    case 'apiChange': {
      // 4
      const api = action.api as API;
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
