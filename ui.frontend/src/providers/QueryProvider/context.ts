import { createContext, useContext } from 'react';
import type { Dispatch } from 'react';
import type { Query, QueryAction, QueryRunnerProps, QueryRunnerResponse } from '@/types';
import { queryBuilderPath } from '@/constants';
import { buildGraphQLURL } from '@/utility';
import { defaultFields } from '@/components/QueryWizard/Components';
import { generateQuery } from '../FieldsProvider/context';

export const QueryContext = createContext<Query>(null!);
export const QueryDispatchContext = createContext<Dispatch<QueryAction>>(null!);
export const QueryRunnerContext = createContext<(props: QueryRunnerProps) => Promise<QueryRunnerResponse>>(null!);
export const IsGraphQLContext = createContext<boolean>(false);

export const defaultSimpleQuery: Query = {
  statement: generateQuery(defaultFields), // build inside provider init
  language: 'QueryBuilder',
  url: queryBuilderPath,
  status: '',
  isAdvanced: false,
};

/**
 * Query Actions???
 * 1. Update Statement
 * 2. Update Language (which replaces Query with defaultQuery based on language)
 * 3. Update Status
 * 4. Update API
 * @param query
 * @param action
 */
export function queryReducer(query: Query, action: QueryAction): Query {
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
