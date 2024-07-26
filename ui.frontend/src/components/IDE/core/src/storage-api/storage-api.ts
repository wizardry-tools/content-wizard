import { WizardAlertProps } from '@/providers';
import { Dispatch } from 'react';
import { createInMemoryStorage } from './in-memory-storage';

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

function isQuotaError(storage: WizardStorage, e: unknown) {
  return (
    e instanceof DOMException &&
    // everything except Firefox
    (e.code === 22 ||
      // Firefox
      e.code === 1014 ||
      // test name field too, because code might not be present
      // everything except Firefox
      e.name === 'QuotaExceededError' ||
      // Firefox
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
    // acknowledge QuotaExceededError only if there's something already stored
    storage.length !== 0
  );
}

export function buildStorage(storage: WizardStorage | null | undefined) {
  if (storage) {
    return storage;
  } else if (typeof window !== 'undefined') {
    return {
      getItem: window.localStorage.getItem.bind(window.localStorage),
      setItem: window.localStorage.setItem.bind(window.localStorage),
      removeItem: window.localStorage.removeItem.bind(window.localStorage),

      get length() {
        let keys = 0;
        for (const key in window.localStorage) {
          if (key.startsWith(`${STORAGE_NAMESPACE}:`)) {
            keys += 1;
          }
        }
        return keys;
      },

      clear() {
        // We only want to clear the namespaced items
        for (const key in window.localStorage) {
          if (key.startsWith(`${STORAGE_NAMESPACE}:`)) {
            window.localStorage.removeItem(key);
          }
        }
      },
    };
  } else {
    return createInMemoryStorage();
  }
}

export type WizardStorageAPIProps = {
  storage?: WizardStorage | null;
  alertDispatcher?: Dispatch<WizardAlertProps> | Function;
};
export const useWizardStorageAPI = (props: WizardStorageAPIProps) => {
  const alertDispatcher =
    props.alertDispatcher ||
    ((obj: any) => {
      console.error(obj);
    });
  const storage: WizardStorage = buildStorage(props.storage);

  function get(name: string): string | null {
    if (!storage) {
      return null;
    }

    const key = `${STORAGE_NAMESPACE}:${name}`;
    const value = storage.getItem(key);
    // Clean up any inadvertently saved null/undefined values.
    if (value === 'null' || value === 'undefined') {
      storage.removeItem(key);
      return null;
    }
    return value || null;
  }

  function set(name: string, value: string): { isQuotaError: boolean; error: Error | null } {
    let quotaError = false;
    let error: Error | null = null;

    if (storage) {
      const key = `${STORAGE_NAMESPACE}:${name}`;
      if (value) {
        try {
          storage.setItem(key, value);
        } catch (e) {
          error = e instanceof Error ? e : new Error(`${e}`);
          quotaError = isQuotaError(storage, e);
          const errMessage = quotaError ? 'Local Storage is out of Space. 5MB max: ' : 'An error occurred: ';
          alertDispatcher({
            message: errMessage + error.message,
            severity: 'error',
            caller: useWizardStorageAPI,
          });
        }
      } else {
        // Clean up by removing the item if there's no value to set
        storage.removeItem(key);
      }
    }

    return { isQuotaError: quotaError, error };
  }

  function clear() {
    if (storage) {
      storage.clear();
    }
  }

  return {
    storage,
    get,
    set,
    clear,
  };
};

export type WizardStorageAPI = ReturnType<typeof useWizardStorageAPI>;

const STORAGE_NAMESPACE = 'content-wizard';
