import { useState, useCallback, useMemo, useEffect } from 'react';
import type { PropsWithChildren } from 'react';
import exportFromJSON from 'export-from-json';
import type { AllowedExportType, Order, Result, ResultsDispatchProps } from '@/types';
import { isPlainObject, useRenderCount } from '@/utility';
import { useAlertDispatcher } from '../WizardAlertProvider';
import { useLogger } from '../LoggingProvider';
import { PackagingProvider } from '../PackagingProvider';
import {
  allowedExportTypes,
  filterResults,
  getComparator,
  ResultsContext,
  ResultsDispatchContext,
  stableSort,
} from './context';

/**
 * This Provider is responsible for the Results returned by Queries.
 *
 * It allows the sorting and filtering of the Results for the various UIs
 * that display the Results.
 *
 * It also contains the logic for exporting the results as a Download.
 * @param children
 * @constructor
 */
export function ResultsProvider({ children }: PropsWithChildren) {
  const logger = useLogger();
  const renderCount = useRenderCount();
  logger.debug({ message: `ResultsProvider[${renderCount}] render()` });
  const alertDispatcher = useAlertDispatcher();
  // non-modified results is more or less used as a reference for rendering logic
  const [results, setResults] = useState([] as Result[]);
  const keys = useMemo(() => {
    return results.length > 0 && isPlainObject(results[0]) ? Object.keys(results[0]) : [];
  }, [results]);
  // store modified results in a separate state
  const [tableResults, setTableResults] = useState([] as Result[]);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof Result>(keys[0]);
  const [filter, setFilter] = useState('');

  const updateResults = useCallback(
    ({ results }: ResultsDispatchProps) => {
      logger.debug({ message: `ResultsProvider results dispatcher called` });
      if (!results || results.length < 1) {
        alertDispatcher({
          message: 'No results were found.',
          severity: 'warning',
        });
      } else {
        setResults(results);
        setTableResults(results);
        setOrderBy(Object.keys(results)[0]);
        setFilter('');
      }
    },
    [alertDispatcher, logger],
  );

  // useEffect that filters and sorts results
  // not using a timeout, do not want to slow down UI response
  // use timeouts in the Table if this causes performance issues.
  useEffect(() => {
    let arr = results;
    if (filter) {
      logger.debug({ message: `ResultsProvider useEffect.filter()` });
      arr = filterResults(arr, filter);
    }
    if (orderBy) {
      logger.debug({ message: `ResultsProvider useEffect.sort()` });
      arr = stableSort(arr, getComparator(order, orderBy));
    }
    setTableResults(arr);
  }, [filter, orderBy, order, logger, results]);

  const exportResults = useCallback(
    (fileName = 'Content-Wizard-Results', exportType = allowedExportTypes.csv as AllowedExportType) => {
      if (results) {
        exportFromJSON({
          data: results,
          exportType,
          fileName,
          withBOM: true,
        });
      } else {
        alertDispatcher({
          message: 'No Results to export. How did you even press this button?',
          severity: 'warning',
        });
      }
    },
    [alertDispatcher, results],
  );

  const value = useMemo(
    () => ({
      results,
      keys,
      filter,
      setFilter,
      tableResults,
      order,
      setOrder,
      orderBy,
      setOrderBy,
      exportResults,
    }),
    [results, keys, tableResults, filter, order, orderBy, exportResults],
  );

  return (
    <ResultsContext.Provider value={value}>
      <ResultsDispatchContext.Provider value={updateResults}>
        <PackagingProvider>{children}</PackagingProvider>
      </ResultsDispatchContext.Provider>
    </ResultsContext.Provider>
  );
}
