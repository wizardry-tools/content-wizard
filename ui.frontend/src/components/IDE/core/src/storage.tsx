import type { StorageContextProviderProps, StorageContextType, WizardStorageAPI } from '@/types';
import { useRenderCount } from '@/utility';
import { useAlertDispatcher, useLogger } from '@/providers';
import { createNonNullableContext, createNonNullableContextHook } from './utility/context';
import { useWizardStorageAPI } from './storage-api';

export const StorageContext = createNonNullableContext<StorageContextType>('StorageContext');

export function StorageContextProvider(props: StorageContextProviderProps) {
  const renderCount = useRenderCount();
  const logger = useLogger();
  logger.debug({ message: `StorageContextProvider[${renderCount}] render()` });
  const alertDispatcher = useAlertDispatcher();
  const storage: WizardStorageAPI = useWizardStorageAPI({ ...props, alertDispatcher });

  return <StorageContext.Provider value={storage}>{props.children}</StorageContext.Provider>;
}

export const useStorageContext = createNonNullableContextHook(StorageContext);
