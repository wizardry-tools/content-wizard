import { createContext, useContext } from 'react';
import type { Fetcher } from '@graphiql/toolkit/src/create-fetcher/types';

export const FetcherContext = createContext<Fetcher>(null!);

export function useFetcher() {
  return useContext(FetcherContext);
}
