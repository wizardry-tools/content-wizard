import { createContext, useCallback, useContext, useMemo } from 'react';
import { Logger, LoggingProps, LoggingProviderProps } from '@/types';

const LoggingContext = createContext<Logger>({
  log: () => ({}),
  debug: () => ({}),
  warn: () => ({}),
  error: () => ({}),
});

/**
 * This is a Logging Provider that allows us to configure how logs
 * are processed throughout the app. Enables us to toggle logging
 * statements, so that we don't have to remove them from our code.
 *
 * Only works for Functional Components.
 * @param children
 * @param showLog
 * @param showDebug
 * @param showWarn
 * @param showError
 * @constructor
 */
export function LoggingProvider({
  children,
  showLog = false,
  showDebug = false,
  showWarn = false,
  showError = false,
}: LoggingProviderProps) {
  const log = useCallback(
    ({ message, ...args }: LoggingProps) => {
      if (showLog) {
        if (isEmpty(args)) {
          console.log(message);
        } else {
          console.log(message, args);
        }
      }
    },
    [showLog],
  );

  const warn = useCallback(
    ({ message, ...args }: LoggingProps) => {
      if (showWarn) {
        if (isEmpty(args)) {
          console.warn(message);
        } else {
          console.warn(message, args);
        }
      }
    },
    [showWarn],
  );

  const debug = useCallback(
    ({ message, ...args }: LoggingProps) => {
      if (showDebug) {
        if (isEmpty(args)) {
          console.debug(message);
        } else {
          console.debug(message, args);
        }
      }
    },
    [showDebug],
  );

  const error = useCallback(
    ({ message, ...args }: LoggingProps) => {
      if (showError) {
        if (isEmpty(args)) {
          console.error(message);
        } else {
          console.error(message, args);
        }
      }
    },
    [showError],
  );

  const value = useMemo(
    () => ({
      log,
      warn,
      debug,
      error,
    }),
    [log, warn, debug, error],
  );

  return <LoggingContext.Provider value={value}>{children}</LoggingContext.Provider>;
}

export function useLogger() {
  return useContext(LoggingContext);
}

function isEmpty(obj: object): boolean {
  return Object.keys(obj).length === 0;
}
