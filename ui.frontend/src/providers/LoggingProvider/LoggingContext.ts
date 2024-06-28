import { createContext } from 'react';
import type { Logger } from '@/types';

export const LoggingContext = createContext<Logger>({
  log: () => ({}),
  debug: () => ({}),
  warn: () => ({}),
  error: () => ({}),
});
