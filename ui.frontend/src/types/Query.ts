import { API } from './API';
import { Result } from './Result';
import { QueryLanguageKey } from '@/components';

/** Query Support */
export type Statement = string;

export type Query = {
  language: QueryLanguageKey;
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

export type QueryResponse = {
  results: Result[];
  status: string | number;
  query: Query;
};

export type QueryMap = Record<QueryLanguageKey, Query>;
