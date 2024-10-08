import { formatError, formatResult, isAsyncIterable, isObservable } from '@graphiql/toolkit';
import type { Unsubscribable } from '@graphiql/toolkit';
import type { ExecutionResult, GraphQLError } from 'graphql';
import { useCallback, useMemo, useRef, useState } from 'react';
import setValue from 'set-value';
import type { ExecutionContextProviderProps, ExecutionContextType, IncrementalResult } from '@/types';
import { useRenderCount } from '@/utility';
import { useFetcher, useLogger, useQuery } from '@/providers';
import { useAutoCompleteLeafs, useEditorContext } from '../../editor';
import { useHistoryContext } from '../../history';
import { ExecutionContext } from './ExecutionContext';

export const ExecutionContextProvider = ({
  getDefaultFieldNames,
  children,
  operationName,
}: ExecutionContextProviderProps) => {
  const renderCount = useRenderCount();
  const logger = useLogger();
  logger.debug({ message: `ExecutionContextProvider[${renderCount}] render()` });
  const fetcher = useFetcher();
  if (!fetcher) {
    throw new TypeError('The `ExecutionContextProvider` component requires a `fetcher` function to be passed as prop.');
  }

  const { headerEditor, queryEditor, responseEditor, variableEditor, updateActiveTabValues } = useEditorContext({
    nonNull: true,
    caller: ExecutionContextProvider,
  });
  const history = useHistoryContext();
  const autoCompleteLeafs = useAutoCompleteLeafs({
    getDefaultFieldNames,
    caller: ExecutionContextProvider,
  });
  const [isFetching, setIsFetching] = useState(false);
  const [subscription, setSubscription] = useState<Unsubscribable | null>(null);
  const queryIdRef = useRef(0);
  // capture these values from the current wizard Query,
  // don't capture statement, as it's already captured directly from the editor in the run callback
  const { language } = useQuery();

  const stop = useCallback(() => {
    subscription?.unsubscribe();
    setIsFetching(false);
    setSubscription(null);
  }, [subscription]);

  const run = useCallback<ExecutionContextType['run']>(async () => {
    if (!queryEditor || !responseEditor) {
      return;
    }

    // If there's an active subscription, unsubscribe it and return
    if (subscription) {
      stop();
      return;
    }

    const setResponse = (value: string) => {
      responseEditor.setValue(value);
      updateActiveTabValues({ response: value });
    };

    queryIdRef.current += 1;
    const queryId = queryIdRef.current;

    // Use the edited query after autoCompleteLeafs() runs or,
    // in case autoCompletion fails (the function returns undefined),
    // the current query from the editor.
    const query = autoCompleteLeafs() ?? queryEditor.getValue();

    const variablesString = variableEditor?.getValue();
    let variables: Record<string, unknown> | undefined;
    try {
      variables = tryParseJsonObject({
        json: variablesString,
        errorMessageParse: 'Variables are invalid JSON',
        errorMessageType: 'Variables are not a JSON object.',
      });
    } catch (error) {
      setResponse(error instanceof Error ? error.message : `${error as string}`);
      return;
    }

    const headersString = headerEditor?.getValue();
    let headers: Record<string, unknown> | undefined;
    try {
      headers = tryParseJsonObject({
        json: headersString,
        errorMessageParse: 'Headers are invalid JSON',
        errorMessageType: 'Headers are not a JSON object.',
      });
    } catch (error) {
      setResponse(error instanceof Error ? error.message : `${error as string}`);
      return;
    }

    setResponse('');
    setIsFetching(true);

    const opName = operationName ?? queryEditor.operationName ?? undefined;

    history?.addToHistory({
      query,
      language,
      variables: variablesString,
      headers: headersString,
      operationName: opName,
    });

    try {
      const fullResponse = {};
      const handleResponse = (result: unknown) => {
        // A different query was dispatched in the meantime, so don't
        // show the results of this one.
        if (queryId !== queryIdRef.current) {
          return;
        }

        let maybeMultipart = Array.isArray(result) ? result : false;
        if (!maybeMultipart && typeof result === 'object' && result !== null && 'hasNext' in result) {
          maybeMultipart = [result];
        }

        if (maybeMultipart) {
          for (const part of maybeMultipart) {
            mergeIncrementalResult(fullResponse, part as IncrementalResult);
          }

          setIsFetching(false);
          setResponse(formatResult(fullResponse));
        } else {
          const response = formatResult(result);
          setIsFetching(false);
          setResponse(response);
        }
      };

      const fetch = fetcher(
        {
          query,
          variables,
          operationName: opName,
        },
        {
          headers: headers ?? undefined,
          documentAST: queryEditor.documentAST ?? undefined,
        },
      );

      const value = await Promise.resolve(fetch);
      if (isObservable(value)) {
        // If the fetcher returned an Observable, then subscribe to it, calling
        // the callback on each next value, and handling both errors and the
        // completion of the Observable.
        setSubscription(
          value.subscribe({
            next(result) {
              handleResponse(result);
            },
            error(error: Error) {
              setIsFetching(false);
              if (error) {
                setResponse(formatError(error));
              }
              setSubscription(null);
            },
            complete() {
              setIsFetching(false);
              setSubscription(null);
            },
          }),
        );
      } else if (isAsyncIterable(value)) {
        setSubscription({
          unsubscribe: () => value[Symbol.asyncIterator]().return?.(),
        });
        for await (const result of value) {
          handleResponse(result);
        }
        setIsFetching(false);
        setSubscription(null);
      } else {
        handleResponse(value);
      }
    } catch (error) {
      setIsFetching(false);
      setResponse(formatError(error));
      setSubscription(null);
    }
  }, [
    language,
    autoCompleteLeafs,
    fetcher,
    headerEditor,
    history,
    operationName,
    queryEditor,
    responseEditor,
    stop,
    subscription,
    updateActiveTabValues,
    variableEditor,
  ]);

  const isSubscribed = Boolean(subscription);
  const value = useMemo<ExecutionContextType>(
    () => ({
      isFetching,
      isSubscribed,
      operationName: operationName ?? null,
      run,
      stop,
    }),
    [isFetching, isSubscribed, operationName, run, stop],
  );

  return <ExecutionContext.Provider value={value}>{children}</ExecutionContext.Provider>;
};

const tryParseJsonObject = ({
  json,
  errorMessageParse,
  errorMessageType,
}: {
  json: string | undefined;
  errorMessageParse: string;
  errorMessageType: string;
}) => {
  let parsed: Record<string, unknown> | undefined;
  try {
    parsed = json && json.trim() !== '' ? JSON.parse(json) : undefined;
  } catch (error) {
    throw new Error(`${errorMessageParse}: ${error instanceof Error ? error.message : (error as string)}.`);
  }
  const isObject = typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed);
  if (parsed !== undefined && !isObject) {
    throw new Error(errorMessageType);
  }
  return parsed;
};

/**
 * @param executionResult The complete execution result object which will be
 * mutated by merging the contents of the incremental result.
 * @param incrementalResult The incremental result that will be merged into the
 * complete execution result.
 */
const mergeIncrementalResult = (executionResult: ExecutionResult, incrementalResult: IncrementalResult): void => {
  const path = ['data', ...(incrementalResult.path ?? [])];

  if (incrementalResult.items) {
    for (const item of incrementalResult.items) {
      setValue(executionResult, path.join('.'), item);
      // Increment the last path segment (the array index) to merge the next item at the next index
      // // eslint-disable-next-line unicorn/prefer-at -- cannot mutate the array using Array.at()
      (path[path.length - 1] as number)++;
    }
  }

  if (incrementalResult.data) {
    setValue(executionResult, path.join('.'), incrementalResult.data, {
      merge: true,
    });
  }

  if (incrementalResult.errors) {
    executionResult.errors ||= [];
    (executionResult.errors as GraphQLError[]).push(...incrementalResult.errors);
  }

  if (incrementalResult.extensions) {
    setValue(executionResult, 'extensions', incrementalResult.extensions, {
      merge: true,
    });
  }

  if (incrementalResult.incremental) {
    for (const incrementalSubResult of incrementalResult.incremental) {
      mergeIncrementalResult(executionResult, incrementalSubResult);
    }
  }
};
