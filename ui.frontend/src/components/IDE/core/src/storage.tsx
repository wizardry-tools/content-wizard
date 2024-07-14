import { ReactNode, useRef } from 'react';

import { createContextHook, createNullableContext } from './utility/context';
import { WizardStorageAPI, WizardStorage, useWizardStorageAPI } from './storage-api';
import { useAlertDispatcher, useLogger } from 'src/providers';

export type StorageContextType = WizardStorageAPI;

export const StorageContext = createNullableContext<StorageContextType>('StorageContext');

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
  const renderCount = useRef(0);
  const logger = useLogger();
  logger.debug({ message: `StorageContextProvider[${++renderCount.current}] render()` });
  const alertDispatcher = useAlertDispatcher();
  const storage = useWizardStorageAPI({ ...props, alertDispatcher });

  return <StorageContext.Provider value={storage}>{props.children}</StorageContext.Provider>;
}

export const useStorageContext = createContextHook(StorageContext);
