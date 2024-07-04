
import { ReactNode, useEffect, useRef, useState } from 'react';

import { createContextHook, createNullableContext } from './utility/context';
import {WizardStorageAPI, WizardStorage } from "./storage-api";
import {useAlertDispatcher} from "../../../Providers";

export type StorageContextType = WizardStorageAPI;

export const StorageContext =
  createNullableContext<StorageContextType>('StorageContext');

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
  const isInitialRender = useRef(true);
  const [storage, setStorage] = useState(new WizardStorageAPI(props.storage));
  const alertDispatcher = useAlertDispatcher();

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
    } else {
      setStorage(new WizardStorageAPI(props.storage, alertDispatcher));
    }
  }, [alertDispatcher, props.storage]);

  return (
    <StorageContext.Provider value={storage}>
      {props.children}
    </StorageContext.Provider>
  );
}

export const useStorageContext = createContextHook(StorageContext);
