import { useState, createContext, useContext, PropsWithChildren, Dispatch, useCallback, useRef } from 'react';
import { Result } from 'src/components/Results';
import { useAlertDispatcher } from './WizardAlertProvider';
import { useLogger } from './LoggingProvider';

export type ResultsDispatchProps = {
  results: Result[];
  caller: Function;
};

const ResultsContext = createContext<Result[]>(null!);
const ResultsDispatchContext = createContext<Dispatch<ResultsDispatchProps>>(null!);

export function ResultsProvider({ children }: PropsWithChildren) {
  const logger = useLogger();
  const renderCount = useRef(0);
  logger.debug({ message: `ResultsProvider[${++renderCount.current}] render()` });
  const [results, setResults] = useState([] as Result[]);
  const alertDispatcher = useAlertDispatcher();

  const updateResults = useCallback(
    ({ results, caller }: ResultsDispatchProps) => {
      logger.debug({ message: `ResultsProvider[${renderCount.current}] results dispatcher called by `, caller });
      if (!results || results.length < 1) {
        alertDispatcher({
          message: 'No results were found.',
          severity: 'warning',
          caller: ResultsProvider,
        });
      } else {
        setResults(results);
      }
    },
    [alertDispatcher, logger],
  );

  return (
    <ResultsContext.Provider value={results}>
      <ResultsDispatchContext.Provider value={updateResults}>{children}</ResultsDispatchContext.Provider>
    </ResultsContext.Provider>
  );
}

export function useResults() {
  return useContext(ResultsContext);
}

export function useResultsDispatch() {
  return useContext(ResultsDispatchContext);
}
