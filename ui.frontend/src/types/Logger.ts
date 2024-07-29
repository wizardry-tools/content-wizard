import { PropsWithChildren } from 'react';

export type LoggingProps = Record<string, unknown> & {
  message: string;
};
export type Logger = {
  log: (props: LoggingProps) => void;
  warn: (props: LoggingProps) => void;
  debug: (props: LoggingProps) => void;
  error: (props: LoggingProps) => void;
};

export type LoggingProviderProps = PropsWithChildren & {
  showLog?: boolean;
  showDebug?: boolean;
  showWarn?: boolean;
  showError?: boolean;
};
