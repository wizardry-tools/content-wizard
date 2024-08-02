import type { WizardStore, WizardStoreItem, WizardStoreItemAction, WizardStoreProps } from '@/types';

const compareStoreItem = (storeItem: WizardStoreItem, item: WizardStoreItem): boolean => {
  return (
    storeItem.query === item.query &&
    storeItem.language === item.language &&
    storeItem.variables === item.variables &&
    storeItem.headers === item.headers &&
    storeItem.operationName === item.operationName
  );
};

/**
 * This is refactored from a HistoryStore class
 * @param key string
 * @param storage WizardStorageAPI
 * @param maxSize number
 * @constructor
 */
export const useWizardStore = ({ key, storage, maxSize = null }: WizardStoreProps): WizardStore => {
  let items: WizardStoreItem[] = fetchAll();

  // define fetchAll first, so that it can be used for initial items.
  function fetchAll() {
    const raw = storage.get(key);
    if (raw) {
      const store: Record<string, WizardStoreItem[]> = JSON.parse(raw);
      if (store) {
        return store[key];
      }
    }
    return [];
  }

  function length() {
    return items.length;
  }

  function contains(item: WizardStoreItem) {
    return items.some((x: WizardStoreItem) => compareStoreItem(x, item));
  }

  function fetchRecent() {
    return items.at(-1);
  }

  function save() {
    storage.set(key, JSON.stringify({ [key]: items }));
  }

  function itemsReduce(
    items: WizardStoreItem[],
    action: WizardStoreItemAction,
    index?: number | undefined,
  ): WizardStoreItem[] | null {
    const { type, ...item } = action;
    const itemIndex = items.findIndex((x) => compareStoreItem(x, item));
    switch (type) {
      case 'edit': {
        if (typeof index === 'number' && items[index]) {
          const found = items[index];
          if (compareStoreItem(found, item)) {
            items.splice(index, 1, item);
            return items;
          }
        }

        const itemIndex = items.findIndex((x) => compareStoreItem(x, item));
        if (itemIndex !== -1) {
          items.splice(itemIndex, 1, item);
        }
        return items;
      }
      case 'remove': {
        if (itemIndex !== -1) {
          items.splice(itemIndex, 1);
        }
        return items;
      }
      case 'push': {
        const newItems = [...items, item];

        if (maxSize && newItems.length > maxSize) {
          newItems.shift();
        }

        for (let attempts = 0; attempts < 5; attempts++) {
          const response = storage.set(key, JSON.stringify({ [key]: items }));
          if (!response.error) {
            return newItems;
          } else if (response.isQuotaError && maxSize) {
            // Only try to delete last items on LRU stores
            newItems.shift();
          } else {
            break; // We don't know what happened in this case, so just bailing out
          }
        }
        return null; // return null to avoid save
      }
      default: {
        throw Error(`Unknown Query Action ${action.type}`);
      }
    }
  }

  function edit(item: WizardStoreItem, index?: number) {
    const updatedItems = itemsReduce(items, { ...item, type: 'edit' }, index);
    if (updatedItems) {
      items = updatedItems;
      save();
    }
  }
  function remove(item: WizardStoreItem) {
    const updatedItems = itemsReduce(items, {
      ...item,
      type: 'remove',
    });
    if (updatedItems) {
      items = updatedItems;
      save();
    }
  }
  function push(item: WizardStoreItem) {
    const updatedItems = itemsReduce(items, {
      ...item,
      type: 'push',
    });
    if (updatedItems) {
      items = updatedItems;
      save();
    }
  }

  function getItems() {
    return items;
  }

  return {
    length,
    contains,
    edit,
    remove,
    push,
    fetchRecent,
    fetchAll,
    save,
    getItems,
  };
};

/*
export class WizStore {
  items: Array<WizardStoreItem>;

  constructor(
    private key: string,
    private storage: WizardStorageAPI,
    private maxSize: number | null = null,
  ) {
    this.items = this.fetchAll();
  }

  get length() {
    return this.items.length;
  }

  contains(item: WizardStoreItem) {
    return this.items.some((x) => compareStoreItem(x, item));
  }

  edit(item: WizardStoreItem, index?: number) {
    if (typeof index === 'number' && this.items[index]) {
      const found = this.items[index];
      if (compareStoreItem(found, item)) {
        this.items.splice(index, 1, item);
        this.save();
        return;
      }
    }

    const itemIndex = this.items.findIndex((x) => compareStoreItem(x, item));
    if (itemIndex !== -1) {
      this.items.splice(itemIndex, 1, item);
      this.save();
    }
  }

  delete(item: WizardStoreItem) {
    const itemIndex = this.items.findIndex((x) => compareStoreItem(x, item));
    if (itemIndex !== -1) {
      this.items.splice(itemIndex, 1);
      this.save();
    }
  }

  fetchRecent() {
    return this.items.at(-1);
  }

  fetchAll() {
    const raw = this.storage.get(this.key);
    if (raw) {
      return JSON.parse(raw)[this.key] as Array<WizardStoreItem>;
    }
    return [];
  }

  push(item: WizardStoreItem) {
    const items = [...this.items, item];

    if (this.maxSize && items.length > this.maxSize) {
      items.shift();
    }

    for (let attempts = 0; attempts < 5; attempts++) {
      const response = this.storage.set(this.key, JSON.stringify({ [this.key]: items }));
      if (!response?.error) {
        this.items = items;
      } else if (response.isQuotaError && this.maxSize) {
        // Only try to delete last items on LRU stores
        items.shift();
      } else {
        return; // We don't know what happened in this case, so just bailing out
      }
    }
  }

  save() {
    this.storage.set(this.key, JSON.stringify({ [this.key]: this.items }));
  }
}
*/
