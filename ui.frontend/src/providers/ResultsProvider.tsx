import {
  useState,
  createContext,
  useContext,
  PropsWithChildren,
  Dispatch,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import { Result } from 'src/components/Results';
import { useAlertDispatcher } from './WizardAlertProvider';
import { useLogger } from './LoggingProvider';
import exportFromJSON from 'export-from-json';
import { ExportType } from 'export-from-json/src/types';
import { useRenderCount } from 'src/utility';
import { PackagingProvider } from './PackagingProvider';

/**
 * This is an extension of the OOTB export-from-json types,
 * but excludes 'txt' and 'css' as those are just JSON exports
 * with different file extensions.
 */
export type AllowedExportType = Exclude<ExportType, 'txt' | 'css'>;
export const allowedExportTypes: { [T in AllowedExportType]: T } = {
  html: 'html',
  json: 'json',
  csv: 'csv',
  xls: 'xls',
  xml: 'xml',
};
export type Order = 'asc' | 'desc';

export type ResultsDispatchProps = {
  results: Result[];
  caller: Function;
};
export type ResultsContextProps = {
  results: Result[];
  keys: string[];
  filter: string;
  setFilter: (filter: string) => void;
  tableResults: Result[];
  order: Order;
  setOrder: (order: Order) => void;
  orderBy: keyof Result;
  setOrderBy: (orderBy: string) => void;
  exportResults: (fileName?: string, exportType?: AllowedExportType) => void;
};
const ResultsContext = createContext<ResultsContextProps>(null!);
const ResultsDispatchContext = createContext<Dispatch<ResultsDispatchProps>>(null!);

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
  const keys = useMemo(() => Object.keys((results && results[0]) || {}), [results]);
  // store modified results in a separate state
  const [tableResults, setTableResults] = useState([] as Result[]);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof Result>(keys[0]);
  const [filter, setFilter] = useState('');

  const updateResults = useCallback(
    ({ results, caller }: ResultsDispatchProps) => {
      logger.debug({ message: `ResultsProvider results dispatcher called by `, caller });
      if (!results || results.length < 1) {
        alertDispatcher({
          message: 'No results were found.',
          severity: 'warning',
          caller: ResultsProvider,
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
          caller: ResultsProvider,
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

export function useResults() {
  return useContext(ResultsContext);
}

export function useResultsDispatcher() {
  return useContext(ResultsDispatchContext);
}

/**
 * This function takes a Result array, along with a filter string,
 * and removes values from the array that don't contain the filter string.
 * @param results Result[]
 * @param filter string
 * @return Result[]
 */
function filterResults(results: Result[], filter: string): Result[] {
  if (!filter) {
    return results;
  }
  const lowerCaseFilter = filter.toLocaleLowerCase();

  return results.filter((result) => {
    return Object.values(result).some((value) => value.toString().toLocaleLowerCase().includes(lowerCaseFilter));
  });
}

/**
 * This method is a basic object Comparator
 * @param a T
 * @param b T
 * @param orderBy keyof T
 * @return number
 */
function descendingComparator<T>(a: T, b: T, orderBy: keyof T): number {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

/**
 * This method builds and returns a callback containing a descending Comparator based on the Order
 * @param order
 * @param orderBy
 * @return (a: T, b: T) => number
 */
function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

/**
 * This method is responsible for reading through an Array of Objects and sorting the Objects
 * with the provided Comparator.
 *
 * Since 2020 all major browsers ensure sort stability with Array.prototype.sort().
 * stableSort() brings sort stability to non-modern browsers (notably IE11). If you
 * only support modern browsers you can replace stableSort(exampleArray, exampleComparator)
 * with exampleArray.slice().sort(exampleComparator)
 * @param array readonly t[]
 * @param comparator (a: T, b: T) => number
 *
 */
function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number): T[] {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}
