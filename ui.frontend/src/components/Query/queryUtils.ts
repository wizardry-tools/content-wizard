import { Query } from './QueryType';

export const isQueryValid = (query: Query) => {
  return !!query && !!query.language && !!query.statement && !!query.url;
};
