import { parse } from 'graphql';

import {useWizardStore, WizardStore, WizardStoreItem} from './store';
import {WizardStorageAPI} from './storage-api';
import { QueryLanguage, QueryLanguageKey, Statement } from 'src/components/Query';

const MAX_QUERY_SIZE = 100000;

export type WHistoryStoreProps = {
  storage: WizardStorageAPI;
  maxSize: number;
}
export const useWizardHistoryStore = (props: WHistoryStoreProps) => {
  const {storage, maxSize} = props;
  let history: WizardStore = useWizardStore({key: 'queries', storage, maxSize});
  let favorite: WizardStore = useWizardStore({key: 'favorites', storage, maxSize: null});
  let queries: WizardStoreItem[] = [...(history.fetchAll()), ...(favorite.fetchAll())];

  function shouldSaveQuery(
    query?: Statement,
    language?: QueryLanguageKey,
    variables?: string,
    headers?: string,
    lastQuerySaved?: WizardStoreItem,
  ) {
    if (!query) {
      return false;
    }

    if (language === QueryLanguage.GraphQL) {
      try {
        parse(query);
      } catch {
        return false;
      }
    } else {
      try {
        JSON.stringify(query);
      } catch {
        return false;
      }
    }

    // Don't try to save giant queries
    if (query.length > MAX_QUERY_SIZE) {
      return false;
    }
    if (!lastQuerySaved) {
      return true;
    }
    if (JSON.stringify(query) === JSON.stringify(lastQuerySaved.query)) {
      if (JSON.stringify(variables) === JSON.stringify(lastQuerySaved.variables)) {
        if (JSON.stringify(headers) === JSON.stringify(lastQuerySaved.headers)) {
          return false;
        }
        if (headers && !lastQuerySaved.headers) {
          return false;
        }
      }
      if (variables && !lastQuerySaved.variables) {
        return false;
      }
    }
    return true;
  }

  const updateHistory = ({ query, language, variables, headers, operationName }: WizardStoreItem) => {
    if (!shouldSaveQuery(query, language, variables, headers, history.fetchRecent())) {
      return;
    }
    history.push({
      query,
      language,
      variables,
      headers,
      operationName,
    });
    const historyQueries = history.getItems();
    const favoriteQueries = favorite.getItems();
    queries = historyQueries.concat(favoriteQueries);
  };

  function toggleFavorite({ query, language, variables, headers, operationName, label, ...other }: WizardStoreItem) {
    const item: WizardStoreItem = {
      query,
      language,
      variables,
      headers,
      operationName,
      label,
    };
    if (other.favorite) {
      item.favorite = false;
      favorite.remove(item);
      history.push(item);
    } else {
      item.favorite = true;
      favorite.push(item);
      history.remove(item);
    }
    queries = [...(history.getItems()), ...(favorite.getItems())];
  }

  function editLabel({ query, language, variables, headers, operationName, label, ...other }: WizardStoreItem, index?: number) {
    const item = {
      query,
      language,
      variables,
      headers,
      operationName,
      label,
    };
    if (other.favorite) {
      favorite.edit({ ...item, favorite: other.favorite }, index);
    } else {
      history.edit(item, index);
    }
    queries = [...(history.getItems()), ...(favorite.getItems())];
  }

  const deleteHistory = (
    { query, language, variables, headers, operationName, ...other }: WizardStoreItem,
    clearFavorites = false,
  ) => {
    // TODO: Remove this method, not sure why this was added this if the regular store already performs the same checks....
    function deleteFromStore(store: WizardStore) {
      const found = store.getItems().find(
        (x: any) =>
          x.query === query &&
          x.language === language &&
          x.variables === variables &&
          x.headers === headers &&
          x.operationName === operationName,
      );
      if (found) {
        store.remove(found);
      }
    }

    if (other.favorite || clearFavorites) {
      deleteFromStore(favorite);
    }
    if (!other.favorite || clearFavorites) {
      deleteFromStore(history);
    }

    queries = [...(history.getItems()), ...(favorite.getItems())];
  };

  return {
    shouldSaveQuery,
    updateHistory,
    toggleFavorite,
    editLabel,
    deleteHistory,
    queries
  }
}

export type WizardHistoryStore = ReturnType<typeof useWizardHistoryStore>;

/*
export class WizardHistoryStore {
  queries: Array<WizardStoreItem>;
  history: WizardStore;
  favorite: WizardStore;

  constructor(
    private storage: WizardStorageAPI,
    private maxHistoryLength: number,
  ) {
    this.history = new WizardStore('queries', this.storage, this.maxHistoryLength);
    // favorites are not automatically deleted, so there's no need for a max length
    this.favorite = new WizardStore('favorites', this.storage, null);
    this.queries = [...this.history.fetchAll(), ...this.favorite.fetchAll()];
  }

  private static shouldSaveQuery(
    query?: Statement,
    language?: QueryLanguageKey,
    variables?: string,
    headers?: string,
    lastQuerySaved?: WizardStoreItem,
  ) {
    if (!query) {
      return false;
    }

    if (language === QueryLanguage.GraphQL) {
      try {
        parse(query);
      } catch {
        return false;
      }
    }

    // Don't try to save giant queries
    if (query.length > MAX_QUERY_SIZE) {
      return false;
    }
    if (!lastQuerySaved) {
      return true;
    }
    if (JSON.stringify(query) === JSON.stringify(lastQuerySaved.query)) {
      if (JSON.stringify(variables) === JSON.stringify(lastQuerySaved.variables)) {
        if (JSON.stringify(headers) === JSON.stringify(lastQuerySaved.headers)) {
          return false;
        }
        if (headers && !lastQuerySaved.headers) {
          return false;
        }
      }
      if (variables && !lastQuerySaved.variables) {
        return false;
      }
    }
    return true;
  }

  updateHistory = ({ query, language, variables, headers, operationName }: WizardStoreItem) => {
    if (!WizardHistoryStore.shouldSaveQuery(query, language, variables, headers, this.history.fetchRecent())) {
      return;
    }
    this.history.push({
      query,
      language,
      variables,
      headers,
      operationName,
    });
    const historyQueries = this.history.items;
    const favoriteQueries = this.favorite.items;
    this.queries = historyQueries.concat(favoriteQueries);
  };

  toggleFavorite({ query, language, variables, headers, operationName, label, favorite }: WizardStoreItem) {
    const item: WizardStoreItem = {
      query,
      language,
      variables,
      headers,
      operationName,
      label,
    };
    if (favorite) {
      item.favorite = false;
      this.favorite.delete(item);
      this.history.push(item);
    } else {
      item.favorite = true;
      this.favorite.push(item);
      this.history.delete(item);
    }
    this.queries = [...this.history.items, ...this.favorite.items];
  }

  editLabel({ query, language, variables, headers, operationName, label, favorite }: WizardStoreItem, index?: number) {
    const item = {
      query,
      language,
      variables,
      headers,
      operationName,
      label,
    };
    if (favorite) {
      this.favorite.edit({ ...item, favorite }, index);
    } else {
      this.history.edit(item, index);
    }
    this.queries = [...this.history.items, ...this.favorite.items];
  }

  deleteHistory = (
    { query, language, variables, headers, operationName, favorite }: WizardStoreItem,
    clearFavorites = false,
  ) => {
    // TODO: Remove this method, not sure why this was added this if the regular store already performs the same checks....
    function deleteFromStore(store: WizardStore) {
      const found = store.items.find(
        (x: any) =>
          x.query === query &&
          x.language === language &&
          x.variables === variables &&
          x.headers === headers &&
          x.operationName === operationName,
      );
      if (found) {
        store.delete(found);
      }
    }

    if (favorite || clearFavorites) {
      deleteFromStore(this.favorite);
    }
    if (!favorite || clearFavorites) {
      deleteFromStore(this.history);
    }

    this.queries = [...this.history.items, ...this.favorite.items];
  };
}
*/