import { createContext } from 'react';
import { Logger } from '@/types';

export const LoggingContext = createContext<Logger>({
  log: () => ({}),
  debug: () => ({}),
  warn: () => ({}),
  error: () => ({}),
});
