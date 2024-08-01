import { Dispatch, useCallback, useMemo } from 'react';
import {
  CodeMirrorEditor,
  CodeMirrorEditorWithOperationFacts,
  Query,
  QueryAction,
  TabDefinition,
  TabsState,
  TabState,
  WizardStorageAPI,
} from '@/types';
import { useRenderCount } from '@/utility';
import { useLogger } from '@/providers';
import { defaultAdvancedQueries, isQueryValid, QUERY_LANGUAGES } from '@/components/Query';
import debounce from '../utility/debounce';

export function getDefaultTabState({
  defaultHeaders,
  headers,
  defaultTabs,
  query,
  variables,
  storage,
  shouldPersistHeaders,
}: {
  defaultHeaders?: string;
  headers: string | null;
  defaultTabs?: TabDefinition[];
  query: Query;
  variables: string | null;
  storage: WizardStorageAPI | null;
  shouldPersistHeaders?: boolean;
}) {
  const storedState = storage?.get(STORAGE_KEY);
  try {
    if (!storedState) {
      throw new Error('Storage for tabs is empty');
    }
    const parsed: Record<string, unknown> = JSON.parse(storedState);
    // if headers are not persisted, do not derive the hash using default headers state
    // or else you will get new tabs on every refresh
    const headersForHash = shouldPersistHeaders ? headers : undefined;
    if (isTabsState(parsed)) {
      const expectedHash = hashFromTabContents({
        query,
        variables,
        headers: headersForHash,
      });
      let matchingTabIndex = -1;

      for (let index = 0; index < parsed.tabs.length; index++) {
        const tab = parsed.tabs[index];
        tab.hash = hashFromTabContents({
          query: tab.query,
          variables: tab.variables,
          headers: tab.headers,
        });
        if (tab.hash === expectedHash) {
          matchingTabIndex = index;
        }
      }

      if (matchingTabIndex >= 0) {
        parsed.activeTabIndex = matchingTabIndex;
      } else {
        const operationName = query ? fuzzyExtractOperationName(query.statement) : null;
        parsed.tabs.push({
          id: guid(),
          hash: expectedHash,
          title: query.label ?? operationName ?? QUERY_LANGUAGES[query.language] ?? DEFAULT_TITLE,
          query,
          variables,
          headers,
          operationName,
          response: null,
        });
        parsed.activeTabIndex = parsed.tabs.length - 1;
      }
      return parsed;
    }
    throw new Error('Storage for tabs is invalid');
  } catch {
    return {
      activeTabIndex: 0,
      tabs: (
        defaultTabs ?? [
          {
            query: query ?? defaultAdvancedQueries.GraphQL,
            variables,
            headers: headers ?? defaultHeaders,
          },
        ]
      ).map(createTab),
    };
  }
}

function isTabsState(obj: Record<string, unknown>): obj is TabsState {
  return (
    obj &&
    typeof obj === 'object' &&
    !Array.isArray(obj) &&
    hasNumberKey(obj, 'activeTabIndex') &&
    'tabs' in obj &&
    Array.isArray(obj.tabs) &&
    obj.tabs.every(isTabState)
  );
}

function isTabState(obj: Record<string, unknown>): obj is TabState {
  // We don't persist the hash, so we skip the check here
  return (
    obj &&
    typeof obj === 'object' &&
    !Array.isArray(obj) &&
    hasStringKey(obj, 'id') &&
    hasStringKey(obj, 'title') &&
    hasQueryOrNullKey(obj, 'query') &&
    hasStringOrNullKey(obj, 'variables') &&
    hasStringOrNullKey(obj, 'headers') &&
    hasStringOrNullKey(obj, 'operationName') &&
    hasStringOrNullKey(obj, 'response')
  );
}

function hasNumberKey(obj: Record<string, unknown>, key: string) {
  return key in obj && typeof obj[key] === 'number';
}

function hasStringKey(obj: Record<string, unknown>, key: string) {
  return key in obj && typeof obj[key] === 'string';
}

function hasStringOrNullKey(obj: Record<string, unknown>, key: string) {
  return key in obj && (typeof obj[key] === 'string' || obj[key] === null);
}

function hasQueryOrNullKey(obj: Record<string, unknown>, key: string) {
  return key in obj && typeof obj[key] === 'object' && obj[key] !== null && isQueryValid(obj[key] as Query);
}

export function useSynchronizeActiveTabValues({
  queryEditor,
  variableEditor,
  headerEditor,
  responseEditor,
  query = defaultAdvancedQueries.GraphQL,
}: {
  queryEditor: CodeMirrorEditorWithOperationFacts | null;
  variableEditor: CodeMirrorEditor | null;
  headerEditor: CodeMirrorEditor | null;
  responseEditor: CodeMirrorEditor | null;
  query: Query;
}) {
  const logger = useLogger();
  const renderCount = useRenderCount();
  logger.debug({ message: `useSynchronizeActiveTabValues[${renderCount}] render()` });
  return useCallback<(state: TabsState) => TabsState>(
    (state) => {
      logger.debug({ message: `useSynchronizeActiveTabValues callback()` });
      const variables = variableEditor?.getValue() ?? null;
      const headers = headerEditor?.getValue() ?? null;
      const operationName = queryEditor?.operationName ?? null;
      const response = responseEditor?.getValue() ?? null;
      return setPropertiesInActiveTab(state, {
        query,
        variables,
        headers,
        response,
        operationName,
      });
    },
    [logger, queryEditor, variableEditor, headerEditor, responseEditor, query],
  );
}

export function serializeTabState(tabState: TabsState, shouldPersistHeaders = false) {
  return JSON.stringify(tabState, (key, value) =>
    key === 'hash' || key === 'response' || (!shouldPersistHeaders && key === 'headers') ? null : (value as string),
  );
}

export function useStoreTabs({
  storage,
  shouldPersistHeaders,
}: {
  storage: WizardStorageAPI | null;
  shouldPersistHeaders?: boolean;
}) {
  const logger = useLogger();
  const store = useMemo(
    () =>
      debounce(500, (value: string) => {
        storage?.set(STORAGE_KEY, value);
      }),
    [storage],
  );
  return useCallback(
    (currentState: TabsState) => {
      logger.debug({ message: `useStoreTabs store()` });
      store(serializeTabState(currentState, shouldPersistHeaders));
    },
    [logger, shouldPersistHeaders, store],
  );
}

export function useSetEditorValues({
  queryDispatcher,
  variableEditor,
  headerEditor,
  responseEditor,
}: {
  queryDispatcher: Dispatch<QueryAction> | null;
  variableEditor: CodeMirrorEditor | null;
  headerEditor: CodeMirrorEditor | null;
  responseEditor: CodeMirrorEditor | null;
}) {
  const logger = useLogger();
  return useCallback(
    ({
      query,
      variables,
      headers,
      response,
    }: {
      query: Query;
      variables?: string | null;
      headers?: string | null;
      response: string | null;
    }) => {
      // use queryDispatcher instead to broadcast query changes and let the queryEditor read from useQuery
      logger.debug({ message: `tabs.useSetEditorValues queryDispatch()` });
      if (queryDispatcher) {
        queryDispatcher({
          ...query,
          type: 'replaceQuery',
        });
      }
      //queryEditor?.setValue(query.statement ?? '');
      variableEditor?.setValue(variables ?? '');
      headerEditor?.setValue(headers ?? '');
      responseEditor?.setValue(response ?? '');
    },
    [logger, queryDispatcher, headerEditor, responseEditor, variableEditor],
  );
}

export function createTab({ query, variables = null }: TabDefinition): TabState {
  return {
    id: guid(),
    hash: hashFromTabContents({ query, variables }),
    title:
      query.label ??
      (query?.statement && fuzzyExtractOperationName(query.statement)) ??
      QUERY_LANGUAGES[query.language] ??
      DEFAULT_TITLE,
    query,
    variables,
    headers: null,
    operationName: null,
    response: null,
  };
}

export function setPropertiesInActiveTab(
  state: TabsState,
  partialTab: Partial<Omit<TabState, 'id' | 'hash' | 'title'>>,
): TabsState {
  return {
    ...state,
    tabs: state.tabs.map((tab, index) => {
      if (index !== state.activeTabIndex) {
        return tab;
      }
      const newTab: TabState = { ...tab, ...partialTab };
      return {
        ...newTab,
        hash: hashFromTabContents(newTab),
        title:
          newTab.query?.label ??
          newTab.operationName ??
          (newTab.query?.statement ? fuzzyExtractOperationName(newTab.query.statement) : undefined) ??
          QUERY_LANGUAGES[newTab.query.language] ??
          DEFAULT_TITLE,
      };
    }),
  };
}

function guid(): string {
  const s4 = () => {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .slice(1);
  };
  // return id of format 'aaaaaaaa'-'aaaa'-'aaaa'-'aaaa'-'aaaaaaaaaaaa'
  return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
}

function hashFromTabContents(args: { query: Query; variables?: string | null; headers?: string | null }): string {
  return [args.query.language ?? '', args.query.statement ?? '', args.variables ?? '', args.headers ?? ''].join('|');
}

export function fuzzyExtractOperationName(str: string): string | null {
  const regex = /^(?!#).*(query|subscription|mutation)\s+([a-zA-Z0-9_]+)/m;

  const match = regex.exec(str);

  return match?.[2] ?? null;
}

export function clearHeadersFromTabs(storage: WizardStorageAPI | null) {
  const persistedTabs = storage?.get(STORAGE_KEY);
  if (persistedTabs) {
    const parsedTabs = JSON.parse(persistedTabs);
    storage?.set(
      STORAGE_KEY,
      JSON.stringify(parsedTabs, (key, value) => (key === 'headers' ? null : (value as string))),
    );
  }
}

const DEFAULT_TITLE = '<untitled>';

export const STORAGE_KEY = 'tabState';