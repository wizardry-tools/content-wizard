import type { ExecutionContextType } from '@/types';
import { createContextHook, createNullableContext } from '@/components/IDE/core/src/utility/context';

export const ExecutionContext = createNullableContext<ExecutionContextType>('ExecutionContext');

export const useExecutionContext = createContextHook(ExecutionContext);
