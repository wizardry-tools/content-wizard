import { QueryButton } from '@/components/QueryWizard/Components';
import type { QueryHandlerProps, DoQueryProps, QueryRunnerResponse, Result } from '@/types';
import { useQuery, useQueryDispatcher, useQueryRunner, useResultsDispatcher } from '@/providers';
import { useCallback } from 'react';

export function QueryHandler({ onResults }: QueryHandlerProps) {
  const query = useQuery();
  const queryDispatcher = useQueryDispatcher();
  const resultsDispatcher = useResultsDispatcher();
  const queryRunner = useQueryRunner();

  const isDisabled = () => {
    return !query?.statement || !query.language || (query.language === 'GraphQL' && !query.api);
  };

  const handleClick = useCallback(() => {
    doQuery({ query, queryDispatcher, queryRunner, resultsDispatcher, onResults });
  }, [query, queryDispatcher, queryRunner, resultsDispatcher, onResults]);

  const isRunning = () => {
    return query.status === 'running';
  };

  return <QueryButton disabled={isDisabled()} isRunning={isRunning()} onClick={handleClick} />;
}

/**
 * This callback is responsible for making the calls between
 * the queryDispatcher
 */
const doQuery = (props: DoQueryProps) => {
  const { query, queryDispatcher, queryRunner, resultsDispatcher, onResults } = props;
  queryDispatcher({
    type: 'statusChange',
    status: 'running',
  });
  queryRunner({ query })
    .then((queryResponse: QueryRunnerResponse) => {
      if (queryResponse.results) {
        const resultArr = queryResponse.results as Result[];
        if (resultArr)
          resultsDispatcher({
            results: resultArr,
          });
        if ((queryResponse.results.length as number) > 0) {
          // switch to results tab
          onResults(2);
        }
      } else {
        resultsDispatcher({
          results: [] as Result[],
        });
      }
      queryDispatcher({
        type: 'statusChange',
        status: 'complete',
      });
    })
    .catch((error) => {
      console.error('Error occurred while running QueryBuilder Statement: ', { error, query });
    });
};
