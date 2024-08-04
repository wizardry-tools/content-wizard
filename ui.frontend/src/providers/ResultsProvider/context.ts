/**
 * This is an extension of the OOTB export-from-json types,
 * but excludes 'txt' and 'css' as those are just JSON exports
 * with different file extensions.
 */
import { createContext, useContext } from 'react';
import type { Dispatch } from 'react';
import type { AllowedExportType, Order, Result, ResultProp, ResultsContextProps, ResultsDispatchProps } from '@/types';

export const allowedExportTypes: { [T in AllowedExportType]: T } = {
  html: 'html',
  json: 'json',
  csv: 'csv',
  xls: 'xls',
  xml: 'xml',
};

export const emptyContext: ResultsContextProps = {
  results: [],
  keys: [],
  filter: '',
  setFilter: () => ({}),
  tableResults: [],
  order: 'asc',
  setOrder: () => ({}),
  orderBy: '',
  setOrderBy: () => ({}),
  exportResults: () => ({}),
};
export const ResultsContext = createContext<ResultsContextProps>(emptyContext);
export const ResultsDispatchContext = createContext<Dispatch<ResultsDispatchProps>>(() => ({}));

/**
 * This function takes a Result array, along with a filter string,
 * and removes values from the array that don't contain the filter string.
 * @param results Result[]
 * @param filter string
 * @return Result[]
 */
export const filterResults = (results: Result[], filter: string): Result[] => {
  if (!filter) {
    return results;
  }
  const lowerCaseFilter = filter.toLocaleLowerCase();

  return results.filter((result) => {
    return Object.values(result).some((value) => value.toString().toLocaleLowerCase().includes(lowerCaseFilter));
  });
};

/**
 * This method is a basic object Comparator
 * @param a T
 * @param b T
 * @param orderBy keyof T
 * @return number
 */
export const descendingComparator = <T>(a: T, b: T, orderBy: keyof T): number => {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
};

/**
 * This method builds and returns a callback containing a descending Comparator based on the Order
 * @param order
 * @param orderBy
 * @return (a: T, b: T) => number
 */
export const getComparator = <Key extends keyof Result>(
  order: Order,
  orderBy: Key,
): ((a: { [key in Key]: ResultProp }, b: { [key in Key]: ResultProp }) => number) => {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
};

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
export const stableSort = <T>(array: T[], comparator: (a: T, b: T) => number): T[] => {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
};

export const useResults = () => {
  return useContext(ResultsContext);
};

export const useResultsDispatcher = () => {
  return useContext(ResultsDispatchContext);
};
