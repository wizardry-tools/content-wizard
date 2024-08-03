import type { StorageContextType } from '@/types';
import { createNonNullableContext, createNonNullableContextHook } from '@/components/IDE/core/src/utility/context';

export const StorageContext = createNonNullableContext<StorageContextType>('StorageContext');

export const useStorageContext = createNonNullableContextHook(StorageContext);
