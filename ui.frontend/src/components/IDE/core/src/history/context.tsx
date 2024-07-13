import {useWizardHistoryStore, WizardStoreItem, useWizardStorageAPI} from '../storage-api';
import { ReactNode, useCallback, useMemo, useState } from 'react';

import { useStorageContext } from '../storage';
import { createContextHook, createNullableContext } from '../utility/context';
import { QueryLanguageKey, Statement } from 'src/components/Query';
import {useAlertDispatcher} from "src/providers";

export type HistoryContextType = {
  /**
   * Add an operation to the history.
   * @param operation The operation that was executed, consisting of the query,
   * variables, headers, and operation name.
   */
  addToHistory(operation: {
    query?: Statement;
    language?: QueryLanguageKey;
    variables?: string;
    headers?: string;
    operationName?: string;
  }): void;
  /**
   * Change the custom label of an item from the history.
   * @param args An object containing the label (`undefined` if it should be
   * unset) and properties that identify the history item that the label should
   * be applied to. (This can result in the label being applied to multiple
   * history items.)
   * @param index Index to edit. Without it, will look for the first index matching the
   * operation, which may lead to misleading results if multiple items have the same label
   */
  editLabel(
    args: {
      query?: Statement;
      language?: QueryLanguageKey;
      variables?: string;
      headers?: string;
      operationName?: string;
      label?: string;
      favorite?: boolean;
    },
    index?: number,
  ): void;
  /**
   * The list of history items.
   */
  items: readonly WizardStoreItem[];
  /**
   * Toggle the favorite state of an item from the history.
   * @param args An object containing the favorite state (`undefined` if it
   * should be unset) and properties that identify the history item that the
   * label should be applied to. (This can result in the label being applied
   * to multiple history items.)
   */
  toggleFavorite(args: {
    query?: Statement;
    language?: QueryLanguageKey;
    variables?: string;
    headers?: string;
    operationName?: string;
    label?: string;
    favorite?: boolean;
  }): void;
  /**
   * Delete an operation from the history.
   * @param args The operation that was executed, consisting of the query,
   * variables, headers, and operation name.
   * @param clearFavorites This is only if you press the 'clear' button
   */
  deleteFromHistory(args: WizardStoreItem, clearFavorites?: boolean): void;
  /**
   * If you need to know when an item in history is set as active to customize
   * your application.
   */
  setActive(args: WizardStoreItem): void;
};

export const HistoryContext = createNullableContext<HistoryContextType>('HistoryContext');

export type HistoryContextProviderProps = {
  children: ReactNode;
  /**
   * The maximum number of executed operations to store.
   * @default 20
   */
  maxHistoryLength?: number;
};

/**
 * The functions send the entire operation so users can customize their own application with
 * <HistoryContext.Provider value={customizedFunctions} /> and get access to the operation plus
 * any additional props they added for their needs (i.e., build their own functions that may save
 * to a backend instead of localStorage and might need an id property added to the QueryStoreItem)
 */
export function HistoryContextProvider(props: HistoryContextProviderProps) {
  const storage = useStorageContext();
  const alertDispatcher = useAlertDispatcher();
  const storageAPI = useWizardStorageAPI({alertDispatcher});
  const historyStore = useWizardHistoryStore({
    // Fall back to a noop storage when the StorageContext is empty
    storage: storage || storageAPI,
    maxSize: props.maxHistoryLength || DEFAULT_HISTORY_LENGTH,
  });
  const [items, setItems] = useState(historyStore?.queries || []);

  const addToHistory: HistoryContextType['addToHistory'] = useCallback((operation: WizardStoreItem) => {
    historyStore?.updateHistory(operation);
    setItems(historyStore.queries);
  }, [historyStore]);

  const editLabel: HistoryContextType['editLabel'] = useCallback((operation: WizardStoreItem, index?: number) => {
    historyStore.editLabel(operation, index);
    setItems(historyStore.queries);
  }, [historyStore]);

  const toggleFavorite: HistoryContextType['toggleFavorite'] = useCallback((operation: WizardStoreItem) => {
    historyStore.toggleFavorite(operation);
    setItems(historyStore.queries);
  }, [historyStore]);

  const setActive: HistoryContextType['setActive'] = useCallback((item: WizardStoreItem) => {
    return item;
  }, []);

  const deleteFromHistory: HistoryContextType['deleteFromHistory'] = useCallback(
    (item: WizardStoreItem, clearFavorites = false) => {
      historyStore.deleteHistory(item, clearFavorites);
      setItems(historyStore.queries);
    },
    [historyStore],
  );

  const value = useMemo<HistoryContextType>(
    () => ({
      addToHistory,
      editLabel,
      items,
      toggleFavorite,
      setActive,
      deleteFromHistory,
    }),
    [addToHistory, editLabel, items, toggleFavorite, setActive, deleteFromHistory],
  );

  return <HistoryContext.Provider value={value}>{props.children}</HistoryContext.Provider>;
}

export const useHistoryContext = createContextHook<HistoryContextType>(HistoryContext);

const DEFAULT_HISTORY_LENGTH = 20;
