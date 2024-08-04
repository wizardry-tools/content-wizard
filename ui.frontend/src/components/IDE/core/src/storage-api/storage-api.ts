import type { WizardAlertProps, WizardStorage, WizardStorageAPI, WizardStorageAPIProps } from '@/types';
import { createInMemoryStorage } from './in-memory-storage';

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

export const useWizardStorageAPI = (props: WizardStorageAPIProps): WizardStorageAPI => {
  const alertDispatcher =
    props.alertDispatcher ??
    ((obj: WizardAlertProps) => {
      console.error(obj);
    });
  const storage: WizardStorage = buildStorage(props.storage);

  const get = (name: string): string | null => {
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
    return value ?? null;
  };

  const set = (name: string, value: string): { isQuotaError: boolean; error: Error | null } => {
    let quotaError = false;
    let error: Error | null = null;

    if (storage) {
      const key = `${STORAGE_NAMESPACE}:${name}`;
      if (value) {
        try {
          storage.setItem(key, value);
        } catch (e) {
          error = e instanceof Error ? e : new Error(`${e as string}`);
          quotaError = isQuotaError(storage, e);
          const errMessage = quotaError ? 'Local Storage is out of Space. 5MB max: ' : 'An error occurred: ';
          alertDispatcher({
            message: errMessage + error.message,
            severity: 'error',
          });
        }
      } else {
        // Clean up by removing the item if there's no value to set
        storage.removeItem(key);
      }
    }

    return { isQuotaError: quotaError, error };
  };

  const clear = () => {
    if (storage) {
      storage.clear();
    }
  };

  return {
    storage,
    get,
    set,
    clear,
  };
};

const STORAGE_NAMESPACE = 'content-wizard';
