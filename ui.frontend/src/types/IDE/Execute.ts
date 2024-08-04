import type { ReactNode } from 'react';
import type { GraphQLError } from 'graphql/index';
import type { UseAutoCompleteLeafsArgs } from './hooks';

export type ExecutionContextType = {
  /**
   * If there is currently a GraphQL request in-flight. For multi-part
   * requests like subscriptions, this will be `true` while fetching the
   * first partial response and `false` while fetching subsequent batches.
   */
  isFetching: boolean;
  /**
   * If there is currently a GraphQL request in-flight. For multi-part
   * requests like subscriptions, this will be `true` until the last batch
   * has been fetched or the connection is closed from the client.
   */
  isSubscribed: boolean;
  /**
   * The operation name that will be sent with all GraphQL requests.
   */
  operationName: string | null;
  /**
   * Start a GraphQL requests based of the current editor contents.
   */
  run: () => void;
  /**
   * Stop the GraphQL request that is currently in-flight.
   */
  stop: () => void;
};

export type ExecutionContextProviderProps = Pick<UseAutoCompleteLeafsArgs, 'getDefaultFieldNames'> & {
  children: ReactNode;
  /**
   * This prop sets the operation name that is passed with a GraphQL request.
   */
  operationName?: string;
};

export type IncrementalResult = {
  data?: Record<string, unknown> | null;
  errors?: readonly GraphQLError[];
  extensions?: Record<string, unknown>;
  hasNext?: boolean;
  path?: readonly (string | number)[];
  incremental?: readonly IncrementalResult[];
  label?: string;
  items?: readonly Record<string, unknown>[] | null;
};
