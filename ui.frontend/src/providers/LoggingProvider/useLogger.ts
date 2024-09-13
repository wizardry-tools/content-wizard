import { useContext } from 'react';
import { LoggingContext } from './LoggingContext';

export const useLogger = () => {
  return useContext(LoggingContext);
};
