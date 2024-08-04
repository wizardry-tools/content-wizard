import type { StorageContextProviderProps, WizardStorageAPI } from '@/types';
import { useRenderCount } from '@/utility';
import { useAlertDispatcher, useLogger } from '@/providers';
import { useWizardStorageAPI } from '../../storage-api';
import { StorageContext } from './StorageContext';

export const StorageContextProvider = (props: StorageContextProviderProps) => {
  const renderCount = useRenderCount();
  const logger = useLogger();
  logger.debug({ message: `StorageContextProvider[${renderCount}] render()` });
  const alertDispatcher = useAlertDispatcher();
  const storage: WizardStorageAPI = useWizardStorageAPI({ ...props, alertDispatcher });

  return <StorageContext.Provider value={storage}>{props.children}</StorageContext.Provider>;
};
