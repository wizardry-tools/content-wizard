import { createContext, PropsWithChildren, useCallback, useContext, useMemo } from 'react';

export type LoggingProps = Record<string, any> & {
  message: string;
};
export type Logger = {
  log: (props: LoggingProps) => void;
  warn: (props: LoggingProps) => void;
  debug: (props: LoggingProps) => void;
  error: (props: LoggingProps) => void;
};
const LoggingContext = createContext<Logger>(null!);

export type LoggingProviderProps = PropsWithChildren & {
  showLog?: boolean;
  showDebug?: boolean;
  showWarn?: boolean;
  showError?: boolean;
};

/**
 * This is a Logging Provider that allows us to configure how logs
 * are processed throughout the app. Enables us to toggle logging
 * statements, so that we don't have to remove them from our code.
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
  return !obj || Object.keys(obj).length === 0;
}
