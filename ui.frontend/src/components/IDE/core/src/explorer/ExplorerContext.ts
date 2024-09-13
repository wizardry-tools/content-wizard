import type { ExplorerContextType } from '@/types';
import { createContextHook, createNullableContext } from '../utility';

export const ExplorerContext = createNullableContext<ExplorerContextType>('ExplorerContext');

export const useExplorerContext = createContextHook(ExplorerContext);
