import { createContext, useContext } from 'react';
import type { Fetcher } from '@graphiql/toolkit/src/create-fetcher/types';

export const FetcherContext = createContext<Fetcher>(null!);

export const useFetcher = () => {
  return useContext(FetcherContext);
};
