import type { ExecutionContextType } from '@/types';
import { createContextHook, createNullableContext } from '../../utility';

export const ExecutionContext = createNullableContext<ExecutionContextType>('ExecutionContext');

export const useExecutionContext = createContextHook(ExecutionContext);
