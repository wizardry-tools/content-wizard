import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  CodeMirrorEditor,
  CodeMirrorEditorWithOperationFacts,
  EditorContextProviderProps,
  EditorContextType,
  Query,
  TabsState,
} from '@/types';
import { useRenderCount } from '@/utility';
import { useLogger, useQuery, useQueryDispatcher } from '@/providers';
import { defaultAdvancedQueries } from '@/constants';
import { useStorageContext } from '../ide-providers';
import { createContextHook, createNullableContext } from '../utility/context';
import { STORAGE_KEY as STORAGE_KEY_HEADERS } from './header-editor';
import { useSynchronizeValue } from './hooks';
import { STORAGE_KEY_QUERY } from './query-editor';
import {
  createTab,
  getDefaultTabState,
  setPropertiesInActiveTab,
  useSetEditorValues,
  useStoreTabs,
  useSynchronizeActiveTabValues,
  clearHeadersFromTabs,
  serializeTabState,
  STORAGE_KEY as STORAGE_KEY_TABS,
} from './tabs';
import { STORAGE_KEY as STORAGE_KEY_VARIABLES } from './variable-editor';

export const EditorContext = createNullableContext<EditorContextType>('EditorContext');

export function EditorContextProvider(props: EditorContextProviderProps) {
  const renderCount = useRenderCount();
  const logger = useLogger();
  logger.debug({ message: `EditorContextProvider[${renderCount}] render()` });
  const storage = useStorageContext();
  const queryObj = useQuery();
  const queryDispatcher = useQueryDispatcher();
  const [headerEditor, setHeaderEditor] = useState<CodeMirrorEditor | null>(null);
  const [queryEditor, setQueryEditor] = useState<CodeMirrorEditorWithOperationFacts | null>(null);
  const [responseEditor, setResponseEditor] = useState<CodeMirrorEditor | null>(null);
  const [wizardStatementEditor, setWizardStatementEditor] = useState<CodeMirrorEditor | null>(null);
  const [resultExplorerEditor, setResultExplorerEditor] = useState<CodeMirrorEditor | null>(null);
  const [variableEditor, setVariableEditor] = useState<CodeMirrorEditor | null>(null);

  const [shouldPersistHeaders, setShouldPersistHeadersInternal] = useState(() => {
    const isStored = storage.get(PERSIST_HEADERS_STORAGE_KEY) !== null;
    return isStored ?? storage.get(PERSIST_HEADERS_STORAGE_KEY) === 'true';
  });

  useSynchronizeValue(queryEditor, queryObj);
  useSynchronizeValue(wizardStatementEditor, queryObj);

  const storeTabs = useStoreTabs({
    storage,
    shouldPersistHeaders,
  });

  // We store this in state but never update it. By passing a function we only
  // need to compute it lazily during the initial render.
  const [initialState] = useState(() => {
    const storedQuery = JSON.parse(storage.get(STORAGE_KEY_QUERY) ?? '{}') as Query;

    // TODO: Add move IDE providers into @/providers and add support for QueryWizard fieldsConfig storage.
    const query = queryObj ?? storedQuery ?? null;
    const variables = storage.get(STORAGE_KEY_VARIABLES) ?? null;
    const headers = storage.get(STORAGE_KEY_HEADERS) ?? null;
    const response = '';
    const wizardStatement = '';

    const tabState = getDefaultTabState({
      query,
      variables,
      headers,
      storage,
      shouldPersistHeaders,
    });
    storeTabs(tabState);

    return {
      query: query ?? (tabState.activeTabIndex === 0 ? tabState.tabs[0].query : null) ?? null,
      variables: variables ?? '',
      headers: headers ?? '',
      response,
      wizardStatement,
      tabState,
    };
  });

  const [tabState, setTabState] = useState<TabsState>(initialState.tabState);

  const setShouldPersistHeaders = useCallback(
    (persist: boolean) => {
      if (persist) {
        storage.set(STORAGE_KEY_HEADERS, headerEditor?.getValue() ?? '');
        const serializedTabs = serializeTabState(tabState, true);
        storage.set(STORAGE_KEY_TABS, serializedTabs);
      } else {
        storage.set(STORAGE_KEY_HEADERS, '');
        clearHeadersFromTabs(storage);
      }
      setShouldPersistHeadersInternal(persist);
      storage.set(PERSIST_HEADERS_STORAGE_KEY, persist.toString());
    },
    [storage, tabState, headerEditor],
  );

  const lastShouldPersistHeadersProp = useRef<boolean | undefined>();
  useEffect(() => {
    const propValue = false;
    if (lastShouldPersistHeadersProp.current !== propValue) {
      setShouldPersistHeaders(propValue);
      lastShouldPersistHeadersProp.current = propValue;
    }
  }, [setShouldPersistHeaders]);

  const synchronizeActiveTabValues = useSynchronizeActiveTabValues({
    queryEditor,
    variableEditor,
    headerEditor,
    responseEditor,
    query: queryObj,
  });
  const setEditorValues = useSetEditorValues({
    queryDispatcher,
    variableEditor,
    headerEditor,
    responseEditor,
  });
  const { children } = props;

  const addTab = useCallback<EditorContextType['addTab']>(() => {
    setTabState((current) => {
      // Make sure the current tab stores the latest values
      const updatedValues = synchronizeActiveTabValues(current);
      const newQuery = defaultAdvancedQueries[queryObj.language];
      const updated = {
        tabs: [...updatedValues.tabs, createTab({ query: newQuery })],
        activeTabIndex: updatedValues.tabs.length,
      };
      storeTabs(updated);
      setEditorValues(updated.tabs[updated.activeTabIndex]);
      return updated;
    });
  }, [queryObj.language, setEditorValues, storeTabs, synchronizeActiveTabValues]);

  const changeTab = useCallback<EditorContextType['changeTab']>(
    (index) => {
      setTabState((current) => {
        const updated = {
          ...current,
          activeTabIndex: index,
        };
        storeTabs(updated);
        setEditorValues(updated.tabs[updated.activeTabIndex]);
        return updated;
      });
    },
    [setEditorValues, storeTabs],
  );

  const moveTab = useCallback<EditorContextType['moveTab']>(
    (newOrder) => {
      setTabState((current) => {
        const activeTab = current.tabs[current.activeTabIndex];
        const updated = {
          tabs: newOrder,
          activeTabIndex: newOrder.indexOf(activeTab),
        };
        storeTabs(updated);
        setEditorValues(updated.tabs[updated.activeTabIndex]);
        return updated;
      });
    },
    [setEditorValues, storeTabs],
  );

  const closeTab = useCallback<EditorContextType['closeTab']>(
    (index) => {
      setTabState((current) => {
        const updated = {
          tabs: current.tabs.filter((_tab, i) => index !== i),
          activeTabIndex: Math.max(current.activeTabIndex - 1, 0),
        };
        storeTabs(updated);
        setEditorValues(updated.tabs[updated.activeTabIndex]);
        return updated;
      });
    },
    [setEditorValues, storeTabs],
  );

  const updateActiveTabValues = useCallback<EditorContextType['updateActiveTabValues']>(
    (partialTab) => {
      setTabState((current) => {
        const updated = setPropertiesInActiveTab(current, partialTab);
        storeTabs(updated);
        return updated;
      });
    },
    [storeTabs],
  );

  const setOperationName = useCallback<EditorContextType['setOperationName']>(
    (operationName) => {
      if (!queryEditor) {
        return;
      }

      queryEditor.operationName = operationName;
      updateActiveTabValues({ operationName });
    },
    [queryEditor, updateActiveTabValues],
  );

  const validationRules = useMemo(() => [], []);

  const value = useMemo<EditorContextType>(
    () => ({
      ...tabState,
      addTab,
      changeTab,
      moveTab,
      closeTab,
      updateActiveTabValues,
      headerEditor,
      queryEditor,
      responseEditor,
      wizardStatementEditor,
      resultExplorerEditor,
      variableEditor,
      setHeaderEditor,
      setQueryEditor,
      setResponseEditor,
      setVariableEditor,
      setWizardStatementEditor,
      setResultExplorerEditor,
      setOperationName,
      initialQuery: initialState.query,
      initialVariables: initialState.variables,
      initialHeaders: initialState.headers,
      initialResponse: initialState.response,
      initialWizardStatement: initialState.wizardStatement,
      validationRules,
      shouldPersistHeaders,
      setShouldPersistHeaders,
    }),
    [
      tabState,
      addTab,
      changeTab,
      moveTab,
      closeTab,
      updateActiveTabValues,
      headerEditor,
      queryEditor,
      responseEditor,
      wizardStatementEditor,
      resultExplorerEditor,
      variableEditor,
      setOperationName,
      initialState,
      validationRules,
      shouldPersistHeaders,
      setShouldPersistHeaders,
    ],
  );

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

export const useEditorContext = createContextHook(EditorContext);

const PERSIST_HEADERS_STORAGE_KEY = 'shouldPersistHeaders';
