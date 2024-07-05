import { QueryButton } from "../QueryWizard/Components";
import {QueryLanguage, QueryLanguageLookup} from ".";
import {
  useQuery,
  useQueryDispatch,
  useQueryRunner,
  useResultsDispatch
} from "../Providers";

type QueryHandlerProps = {
  onResults: (index: number)=>void;
}

export default function QueryHandler({onResults}:QueryHandlerProps) {

  const query = useQuery();
  const queryDispatch = useQueryDispatch();
  const resultsDispatch = useResultsDispatch();
  const queryRunner = useQueryRunner();

  const isDisabled = () => {
    return (!query ||
      !query.statement ||
      !query.language ||
      (query.language === QueryLanguageLookup[QueryLanguage.GraphQL] && !query.api))
  }

  const doQuery = () => {
    queryDispatch({
      type: 'statusChange',
      status: 'running'
    })
    // do we need to wait????
    queryRunner(query)
      .then((queryResponse) => {
        if (queryResponse.results) {
          resultsDispatch(queryResponse.results);
          if (queryResponse.results.length > 0) {
            // switch to results tab
            onResults(2);
          }
        } else {
          resultsDispatch([]);
          console.debug(`No Results for query: ${queryResponse.status}`, query);
        }
        queryDispatch({
          type: 'statusChange',
          status: 'complete'
        })
      });

  }

  const isRunning = () => {
    return query.status === 'running';
  }

  return(
    <QueryButton disabled={isDisabled()} isRunning={isRunning()} onClick={doQuery} />
  );
}
