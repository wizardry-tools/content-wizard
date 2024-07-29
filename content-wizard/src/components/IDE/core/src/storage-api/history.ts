import { useState } from 'react';
import { parse } from 'graphql';
import {
  QueryLanguage,
  Statement,
  WizardStore,
  WizardStoreItem,
  WHistoryStoreProps,
  WizardHistoryStore,
} from '@/types';
import { useWizardStore } from './store';
const MAX_QUERY_SIZE = 100000;

export const useWizardHistoryStore = (props: WHistoryStoreProps): WizardHistoryStore => {
  const { storage, maxSize } = props;
  const history: WizardStore = useWizardStore({ key: 'queries', storage, maxSize });
  const favorite: WizardStore = useWizardStore({ key: 'favorites', storage, maxSize: null });
  const [queries, setQueries] = useState([...history.fetchAll(), ...favorite.fetchAll()]);

  function shouldSaveQuery(
    query?: Statement,
    language?: QueryLanguage,
    variables?: string,
    headers?: string,
    lastQuerySaved?: WizardStoreItem,
  ) {
    if (!query) {
      return false;
    }

    if (language === 'GraphQL') {
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
    setQueries(historyQueries.concat(favoriteQueries));
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
    setQueries([...history.getItems(), ...favorite.getItems()]);
  }

  function editLabel(
    { query, language, variables, headers, operationName, label, ...other }: WizardStoreItem,
    index?: number,
  ) {
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
    setQueries([...history.getItems(), ...favorite.getItems()]);
  }

  const deleteHistory = (
    { query, language, variables, headers, operationName, ...other }: WizardStoreItem,
    clearFavorites = false,
  ) => {
    // TODO: Remove this method, not sure why this was added this if the regular store already performs the same checks....
    function deleteFromStore(store: WizardStore) {
      const found = store
        .getItems()
        .find(
          (x: WizardStoreItem) =>
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

    if (other.favorite ?? clearFavorites) {
      deleteFromStore(favorite);
    }
    if (!other.favorite || clearFavorites) {
      deleteFromStore(history);
    }

    setQueries([...history.getItems(), ...favorite.getItems()]);
  };

  return {
    shouldSaveQuery,
    updateHistory,
    toggleFavorite,
    editLabel,
    deleteHistory,
    queries,
  };
};
