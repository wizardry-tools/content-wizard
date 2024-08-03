import type { HistoryContextType } from '@/types';
import { createContextHook, createNullableContext } from '../utility/context';

export const HistoryContext = createNullableContext<HistoryContextType>('HistoryContext');

export const useHistoryContext = createContextHook<HistoryContextType>(HistoryContext);
