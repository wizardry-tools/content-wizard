import { useContext } from 'react';
import { LoggingContext } from './LoggingContext';

export function useLogger() {
  return useContext(LoggingContext);
}
