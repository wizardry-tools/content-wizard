import { MutableRefObject, useCallback } from 'react';
import { DYNAMIC_HEADERS } from '@/utility';
import { ResultData } from './ResultExplorer';
import { useAlertDispatcher } from '@/providers';

export type FetcherProps = {
  fetching: MutableRefObject<boolean>;
};
export type LoadDataProps = {
  path: string;
  resultHandler: (result: any) => void;
  defaultResult?: any;
  stringify?: boolean;
  depth?: number;
};
/**
 * This is a simple fetcher that is being used to pull data straight from the JCR.
 * Uses a fetcher reference to track if fetching is occurring, to prevent multiple requests.
 * @param fetching
 */
export const useFetcher = ({ fetching }: FetcherProps) => {
  const alertDispatcher = useAlertDispatcher();

  const loadData = useCallback(
    (props: LoadDataProps) => {
      const { path, resultHandler, defaultResult = '', stringify = true, depth = -1 } = props;
      if (fetching.current) {
        // refuse to fetch if it's already fetching.
        return;
      }
      async function fetchData(): Promise<ResultData> {
        if (path) {
          const url = `${path}.${depth}.json`;
          try {
            fetching.current = true;
            const response = await fetch(url, DYNAMIC_HEADERS);
            if (response.ok) {
              return await response.json();
            } else {
              return defaultResult;
            }
          } catch (e) {
            console.error(e);
            alertDispatcher({
              message: `Error: could not load data for the result ${path}`,
              severity: 'error',
              caller: useFetcher,
            });
          }
        }
        return defaultResult;
      }

      fetchData()
        .then((responseData) => {
          if (responseData) {
            if (stringify) {
              const json = JSON.stringify(responseData, null, ' ');
              resultHandler(json);
            } else {
              resultHandler(responseData);
            }
          } else {
            resultHandler(defaultResult); // revert to default
          }
        })
        .catch((error) => {
          console.error(error);
          alertDispatcher({
            message: `Error: exception occurred while fetching data for ${path}`,
            severity: 'error',
            caller: useFetcher,
          });
          resultHandler(defaultResult);
        })
        .finally(() => {
          fetching.current = false;
        });
    },
    [alertDispatcher, fetching],
  );

  return {
    loadData,
  };
};
