import type { Dispatch } from 'react';
import type { API } from './IDE';
import type { OnResultsCallback, Result, ResultProp, ResultsDispatchProps } from './Result';

export type QueryLanguage = 'SQL' | 'JCR_SQL2' | 'XPATH' | 'QueryBuilder' | 'GraphQL';
export type QueryLanguageLabel = 'SQL' | 'JCR SQL2' | 'XPATH' | 'QueryBuilder' | 'GraphQL';
export type QueryLanguageMap = Record<QueryLanguage, QueryLanguageLabel>;

/** Query Support */
export type Statement = string;

export type Query = {
  language: QueryLanguage;
  statement: Statement;
  url: string;
  api?: API;
  status?: string;
  isAdvanced: boolean; // this is mainly for QueryBuilder language, as it's used in two different UIs and this differentiates the UIs.
  label?: string; // this gets populated when a History Query has an edited label.
};
export type QueryAction = Partial<Query> & {
  type: string;
};
export type QueryResults = Result[] | Record<string, ResultProp>;
export type QueryRunnerProps = {
  query: Query;
};
export type QueryRunnerResponse = {
  results: QueryResults;
  status: string | number;
  query: Query;
};

export type QueryMap = Record<QueryLanguage, Query>;

export type QueryHandlerProps = {
  onResults: OnResultsCallback;
};

export type DoQueryProps = {
  query: Query;
  queryDispatcher: Dispatch<QueryAction>;
  queryRunner: ({ query }: QueryRunnerProps) => Promise<QueryRunnerResponse>;
  resultsDispatcher: Dispatch<ResultsDispatchProps>;
  onResults: OnResultsCallback;
};

export type GetParamsProps = {
  language: string;
  statement: string;
};
