import { Dispatch, ReactNode } from 'react';
import { QueryLanguage, Statement } from '../Query';
import { WizardAlertProps } from '../WizardAlert';

export type WizardStorageAPI = {
  storage: WizardStorage;
  get: (name: string) => string | null;
  set: (name: string, value: string) => { isQuotaError: boolean; error: Error | null };
  clear: () => void;
};

export type StorageContextType = WizardStorageAPI;

/**
 * This describes the attributes and methods that a store has to support in
 * order to be used with GraphiQL. It closely resembles the `localStorage`
 * API as it is the default storage used in GraphiQL.
 */
export type WizardStorage = {
  /**
   * Retrieve an item from the store by its key.
   * @param key The key of the item to retrieve.
   * @returns {?string} The stored value for the given key if it exists, `null`
   * otherwise.
   */
  getItem(key: string): string | null;
  /**
   * Add a value to the store for a given key. If there already exists a value
   * for the given key, this method will override the value.
   * @param key The key to store the value for.
   * @param value The value to store.
   */
  setItem(key: string, value: string): void;
  /**
   * Remove the value for a given key from the store. If there is no value for
   * the given key this method does nothing.
   * @param key The key to remove the value from the store.
   */
  removeItem(key: string): void;
  /**
   * Remove all items from the store.
   */
  clear(): void;
  /**
   * The number of items that are currently stored.
   */
  length: number;
};

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

export type WizardStorageAPIProps = {
  storage?: WizardStorage | null;
  alertDispatcher?: Dispatch<WizardAlertProps> | ((ojb: WizardAlertProps) => void);
};

export type WizardStoreProps = {
  key: string;
  storage: WizardStorageAPI;
  maxSize?: number | null;
};

export type WizardStore = {
  length: () => number;
  contains: (item: WizardStoreItem) => boolean;
  edit: (item: WizardStoreItem, index?: number) => void;
  remove: (item: WizardStoreItem) => void;
  push: (item: WizardStoreItem) => void;
  fetchRecent: () => WizardStoreItem | undefined;
  fetchAll: () => WizardStoreItem[];
  save: () => void;
  getItems: () => WizardStoreItem[];
};

export type WizardStoreItem = {
  query?: Statement;
  language?: QueryLanguage;
  // API might need to be tracked as well, but PersistedQueries should be refactored out of API before that happens.
  variables?: string;
  headers?: string;
  operationName?: string;
  label?: string;
  favorite?: boolean;
};
export type WizardStoreItemAction = WizardStoreItem & {
  type: string;
};
export type WHistoryStoreProps = {
  storage: WizardStorageAPI;
  maxSize: number;
};

type ShouldSaveQuery = (
  query?: Statement,
  language?: QueryLanguage,
  variables?: string,
  headers?: string,
  lastQuerySaved?: WizardStoreItem,
) => boolean;
type UpdateHistory = (item: WizardStoreItem) => void;
type ToggleFavorite = (item: WizardStoreItem) => void;
type EditLabel = (item: WizardStoreItem, index?: number) => void;
type DeleteHistory = (item: WizardStoreItem, clearFavorites?: boolean) => void;
export type WizardHistoryStore = {
  shouldSaveQuery: ShouldSaveQuery;
  updateHistory: UpdateHistory;
  toggleFavorite: ToggleFavorite;
  editLabel: EditLabel;
  deleteHistory: DeleteHistory;
  queries: WizardStoreItem[];
};
