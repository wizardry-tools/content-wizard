import type { PropsWithChildren } from 'react';
import type {
  CreateFetcherOptions,
  FetcherOpts,
  FetcherReturnType,
  SyncExecutionResult,
} from '@graphiql/toolkit/src/create-fetcher/types';
import type { Result, ResultProp } from './Result';

export type FetcherProviderProps = PropsWithChildren;

export type FetcherResult = {
  hits?: Result[];
  results?: Result[];
  data?: Record<string, ResultProp>;
};
export type OnFetcherResults = (data: SyncExecutionResult) => void;
export type SimpleFetcher = (opts?: FetcherOpts) => FetcherReturnType;
export type CustomCreateFetcherOptions = CreateFetcherOptions & {
  onResults?: OnFetcherResults;
};
