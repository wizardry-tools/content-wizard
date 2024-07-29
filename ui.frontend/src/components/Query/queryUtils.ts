import { Query } from '@/types';

export const isQueryValid = (query: Query) => {
  return !!query && !!query.language && !!query.statement && !!query.url;
};
