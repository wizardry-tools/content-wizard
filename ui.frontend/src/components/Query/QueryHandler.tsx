import { QueryButton } from 'src/components/QueryWizard/Components';
import { QueryLanguage } from './QueryType';
import { useLogger, useQuery, useQueryDispatcher, useQueryRunner, useResultsDispatch } from 'src/providers';

type QueryHandlerProps = {
  onResults: (index: number) => void;
};

export function QueryHandler({ onResults }: QueryHandlerProps) {
  const logger = useLogger();
  const query = useQuery();
  const queryDispatcher = useQueryDispatcher();
  const resultsDispatch = useResultsDispatch();
  const queryRunner = useQueryRunner();

  const isDisabled = () => {
    return !query || !query.statement || !query.language || (query.language === QueryLanguage.GraphQL && !query.api);
  };

  const doQuery = () => {
    queryDispatcher({
      type: 'statusChange',
      status: 'running',
      caller: QueryHandler,
    });
    // do we need to wait????
    queryRunner({ query, caller: QueryHandler }).then((queryResponse) => {
      if (queryResponse.results) {
        resultsDispatch({
          results: queryResponse.results,
          caller: QueryHandler,
        });
        if (queryResponse.results.length > 0) {
          // switch to results tab
          onResults(2);
        }
      } else {
        resultsDispatch({
          results: [],
          caller: QueryHandler,
        });
        logger.debug({ message: `No Results for query: ${queryResponse.status}`, query });
      }
      queryDispatcher({
        type: 'statusChange',
        status: 'complete',
        caller: QueryHandler,
      });
    });
  };

  const isRunning = () => {
    return query.status === 'running';
  };

  return <QueryButton disabled={isDisabled()} isRunning={isRunning()} onClick={doQuery} />;
}
