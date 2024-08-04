import type { StorageContextType } from '@/types';
import { createNonNullableContext, createNonNullableContextHook } from '../../utility';

export const StorageContext = createNonNullableContext<StorageContextType>('StorageContext');

export const useStorageContext = createNonNullableContextHook(StorageContext);
