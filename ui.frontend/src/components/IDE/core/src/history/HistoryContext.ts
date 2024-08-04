import type { HistoryContextType } from '@/types';
import { createContextHook, createNullableContext } from '../utility/context';

export const HistoryContext = createNullableContext<HistoryContextType>('HistoryContext');

export const useHistoryContext = createContextHook<HistoryContextType>(HistoryContext);

export const formatQuery = (query?: string) => {
  return query
    ?.split('\n')
    .map((line) => line.replace(/#(.*)/, ''))
    .join(' ')
    .replaceAll('{', ' { ')
    .replaceAll('}', ' } ')
    .replaceAll(/[\s]{2,}/g, ' ');
};
