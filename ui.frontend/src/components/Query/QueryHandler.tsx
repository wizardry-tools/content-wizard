import { QueryButton } from '@/components/QueryWizard/Components';
import { Query, QueryLanguage } from './QueryType';
import { useQuery, useQueryDispatcher, useQueryRunner, useResultsDispatcher } from '@/providers';
import { useCallback } from 'react';

type QueryHandlerProps = {
  onResults: (index: number) => void;
};

export function QueryHandler({ onResults }: QueryHandlerProps) {
  const query = useQuery();
  const queryDispatcher = useQueryDispatcher();
  const resultsDispatcher = useResultsDispatcher();
  const queryRunner = useQueryRunner();

  const isDisabled = () => {
    return !query?.statement || !query.language || (query.language === QueryLanguage.GraphQL && !query.api);
  };

  const handleClick = useCallback(() => {
    doQuery({ query, queryDispatcher, queryRunner, resultsDispatcher, onResults });
  }, [query, queryDispatcher, queryRunner, resultsDispatcher, onResults]);

  const isRunning = () => {
    return query.status === 'running';
  };

  return <QueryButton disabled={isDisabled()} isRunning={isRunning()} onClick={handleClick} />;
}

type DoQueryProps = {
  query: Query;
  queryDispatcher: Function;
  queryRunner: Function;
  resultsDispatcher: Function;
  onResults: Function;
};

/**
 * This callback is responsible for making the calls between
 * the queryDispatcher
 */
const doQuery = (props: DoQueryProps) => {
  const { query, queryDispatcher, queryRunner, resultsDispatcher, onResults } = props;
  queryDispatcher({
    type: 'statusChange',
    status: 'running',
    caller: QueryHandler,
  });
  queryRunner({ query, caller: QueryHandler }).then((queryResponse: { results: string | any[] }) => {
    if (queryResponse.results) {
      resultsDispatcher({
        results: queryResponse.results,
        caller: QueryHandler,
      });
      if (queryResponse.results.length > 0) {
        // switch to results tab
        onResults(2);
      }
    } else {
      resultsDispatcher({
        results: [],
        caller: QueryHandler,
      });
    }
    queryDispatcher({
      type: 'statusChange',
      status: 'complete',
      caller: QueryHandler,
    });
  });
};
