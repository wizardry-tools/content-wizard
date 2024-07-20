import { ReactNode } from 'react';

import { createNonNullableContext, createNonNullableContextHook } from './utility/context';
import { WizardStorageAPI, WizardStorage, useWizardStorageAPI } from './storage-api';
import { useAlertDispatcher, useLogger } from 'src/providers';
import { useRenderCount } from 'src/utility';

export type StorageContextType = WizardStorageAPI;

export const StorageContext = createNonNullableContext<StorageContextType>('StorageContext');

export type StorageContextProviderProps = {
  children: ReactNode;
  /**
   * Provide a custom storage API.
   * @default `localStorage``
   * @see {@link https://graphiql-test.netlify.app/typedoc/modules/graphiql_toolkit.html#storage-2|API docs}
   * for details on the required interface.
   */
  storage?: WizardStorage;
};

export function StorageContextProvider(props: StorageContextProviderProps) {
  const renderCount = useRenderCount();
  const logger = useLogger();
  logger.debug({ message: `StorageContextProvider[${renderCount}] render()` });
  const alertDispatcher = useAlertDispatcher();
  const storage: WizardStorageAPI = useWizardStorageAPI({ ...props, alertDispatcher });

  return <StorageContext.Provider value={storage}>{props.children}</StorageContext.Provider>;
}

export const useStorageContext = createNonNullableContextHook(StorageContext);
