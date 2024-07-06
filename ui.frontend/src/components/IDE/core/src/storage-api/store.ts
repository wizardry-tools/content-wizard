
import {
  WizardStorageAPI
} from "./storage-api";
import {QueryLanguageKey, Statement} from "src/components/Query";

export type WizardStoreItem = {
  query?: Statement;
  language?: QueryLanguageKey;
  // API might need to be tracked as well, but PersistedQueries should be refactored out of API before that happens.
  variables?: string;
  headers?: string;
  operationName?: string;
  label?: string;
  favorite?: boolean;
};

const compareStoreItem = (storeItem:WizardStoreItem, item:WizardStoreItem):boolean => {
  return storeItem.query === item.query &&
    storeItem.language === item.language &&
    storeItem.variables === item.variables &&
    storeItem.headers === item.headers &&
    storeItem.operationName === item.operationName;
}

export class WizardStore {
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
    return this.items.some(
      x => compareStoreItem(x, item),
    );
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

    const itemIndex = this.items.findIndex(
      x => compareStoreItem(x, item),
    );
    if (itemIndex !== -1) {
      this.items.splice(itemIndex, 1, item);
      this.save();
    }
  }

  delete(item: WizardStoreItem) {
    const itemIndex = this.items.findIndex(
      x => compareStoreItem(x, item),
    );
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
      const response = this.storage.set(
        this.key,
        JSON.stringify({ [this.key]: items }),
      );
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
