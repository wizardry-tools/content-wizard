import {
  useState,
  createContext,
  useContext,
  PropsWithChildren,
  Dispatch,
  useCallback,
  useRef,
  useMemo,
  useEffect,
} from 'react';
import { Result } from 'src/components/Results';
import { useAlertDispatcher } from './WizardAlertProvider';
import { useLogger } from './LoggingProvider';
import exportFromJSON from 'export-from-json';
import { ExportType } from 'export-from-json/src/types';

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
  exportResults: (fileName?: string, exportType?: ExportType) => void;
};
const ResultsContext = createContext<ResultsContextProps>(null!);
const ResultsDispatchContext = createContext<Dispatch<ResultsDispatchProps>>(null!);

export function ResultsProvider({ children }: PropsWithChildren) {
  const logger = useLogger();
  const renderCount = useRef(0);
  logger.debug({ message: `ResultsProvider[${++renderCount.current}] render()` });
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
      logger.debug({ message: `ResultsProvider[${renderCount.current}] results dispatcher called by `, caller });
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
      logger.debug({ message: `ResultsProvider[${renderCount.current}] useEffect.filter()` });
      arr = filterResults(arr, filter);
    }
    if (orderBy) {
      logger.debug({ message: `ResultsProvider[${renderCount.current}] useEffect.sort()` });
      arr = stableSort(arr, getComparator(order, orderBy));
    }
    setTableResults(arr);
  }, [filter, orderBy, order, logger, results]);

  const exportResults = useCallback(
    (fileName = 'Content-Wizard-Results', exportType = exportFromJSON.types.csv as ExportType) => {
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

export function filterResults(results: Result[], filter: string) {
  if (!filter) {
    return results;
  }
  const lowerCaseFilter = filter.toLocaleLowerCase();

  return results.filter((result) => {
    return Object.values(result).some((value) => value.toString().toLocaleLowerCase().includes(lowerCaseFilter));
  });
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

export type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// Since 2020 all major browsers ensure sort stability with Array.prototype.sort().
// stableSort() brings sort stability to non-modern browsers (notably IE11). If you
// only support modern browsers you can replace stableSort(exampleArray, exampleComparator)
// with exampleArray.slice().sort(exampleComparator)
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
