import { useCallback, useMemo } from 'react';
import { HistoryContextType, HistoryContextProviderProps, WizardStorageAPI, WizardStoreItem } from '@/types';
import { useRenderCount } from '@/utility';
import { useLogger } from '@/providers';
import { createContextHook, createNullableContext } from '../utility/context';
import { useWizardHistoryStore } from '../storage-api';
import { useStorageContext } from '../storage';

export const HistoryContext = createNullableContext<HistoryContextType>('HistoryContext');

/**
 * The functions send the entire operation so users can customize their own application with
 * <HistoryContext.Provider value={customizedFunctions} /> and get access to the operation plus
 * any additional props they added for their needs (i.e., build their own functions that may save
 * to a backend instead of localStorage and might need an id property added to the QueryStoreItem)
 */
export function HistoryContextProvider(props: HistoryContextProviderProps) {
  const logger = useLogger();
  const renderCount = useRenderCount();
  logger.debug({ message: `HistoryContextProvider[${renderCount}] render()` });
  const storage: WizardStorageAPI = useStorageContext();
  const historyStore = useWizardHistoryStore({
    // Fall back to a noop storage when the StorageContext is empty
    storage: storage,
    maxSize: props.maxHistoryLength ?? DEFAULT_HISTORY_LENGTH,
  });

  const addToHistory: HistoryContextType['addToHistory'] = useCallback(
    (operation: WizardStoreItem) => {
      historyStore.updateHistory(operation);
    },
    [historyStore],
  );

  /**
   * This method handles the store operation when editing a History Item label.
   *
   * TODO: The History plugin logic was never paired with the Editor Tabs logic. So, when a History Item's label is
   *  modified, the change isn't propagated to the Tabs. The only time you see a changed label appear in an
   *  Editor Tab is when you click on the History Item after changing the label, thus creating a new Editor Tab
   *  that contains the History Item's current label. Creating new Tabs from a History Item, and then changing
   *  that Item's label, doesn't have any effect on already rendered tabs, even the currently active tab.
   */
  const editLabel: HistoryContextType['editLabel'] = useCallback(
    (operation: WizardStoreItem, index?: number) => {
      historyStore.editLabel(operation, index);
    },
    [historyStore],
  );

  const toggleFavorite: HistoryContextType['toggleFavorite'] = useCallback(
    (operation: WizardStoreItem) => {
      historyStore.toggleFavorite(operation);
    },
    [historyStore],
  );

  const setActive: HistoryContextType['setActive'] = useCallback((item: WizardStoreItem) => {
    return item;
  }, []);

  const deleteFromHistory: HistoryContextType['deleteFromHistory'] = useCallback(
    (item: WizardStoreItem, clearFavorites = false) => {
      historyStore.deleteHistory(item, clearFavorites);
    },
    [historyStore],
  );

  const value = useMemo<HistoryContextType>(
    () => ({
      addToHistory,
      editLabel,
      items: historyStore.queries,
      toggleFavorite,
      setActive,
      deleteFromHistory,
    }),
    [addToHistory, editLabel, historyStore.queries, toggleFavorite, setActive, deleteFromHistory],
  );

  return <HistoryContext.Provider value={value}>{props.children}</HistoryContext.Provider>;
}

export const useHistoryContext = createContextHook<HistoryContextType>(HistoryContext);

const DEFAULT_HISTORY_LENGTH = 20;
