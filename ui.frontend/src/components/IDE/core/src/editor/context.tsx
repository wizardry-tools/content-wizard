import { FragmentDefinitionNode, parse, visit } from 'graphql';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CodeMirrorEditor,
  CodeMirrorEditorWithOperationFacts,
  EditorContextProviderProps,
  EditorContextType,
  Query,
  TabsState,
} from '@/types';
import { useRenderCount } from '@/utility';
import { useLogger, useQuery, useQueryDispatcher } from '@/providers';
import { defaultAdvancedQueries } from '@/components/Query';
import { useStorageContext } from '../storage';
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
    return props.shouldPersistHeaders !== false && isStored
      ? storage.get(PERSIST_HEADERS_STORAGE_KEY) === 'true'
      : Boolean(props.shouldPersistHeaders);
  });

  useSynchronizeValue(headerEditor, props.headers);
  useSynchronizeValue(queryEditor, queryObj);
  useSynchronizeValue(responseEditor, props.response);
  useSynchronizeValue(variableEditor, props.variables);
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
    const variables = props.variables ?? storage.get(STORAGE_KEY_VARIABLES) ?? null;
    const headers = props.headers ?? storage.get(STORAGE_KEY_HEADERS) ?? null;
    const response = props.response ?? '';
    const wizardStatement = props.wizardStatement ?? '';

    const tabState = getDefaultTabState({
      query,
      variables,
      headers,
      defaultTabs: props.defaultTabs,
      defaultHeaders: props.defaultHeaders,
      storage,
      shouldPersistHeaders,
    });
    storeTabs(tabState);

    return {
      query: query ?? (tabState.activeTabIndex === 0 ? tabState.tabs[0].query : null) ?? null,
      variables: variables ?? '',
      headers: headers ?? props.defaultHeaders ?? '',
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
    const propValue = Boolean(props.shouldPersistHeaders);
    if (lastShouldPersistHeadersProp.current !== propValue) {
      setShouldPersistHeaders(propValue);
      lastShouldPersistHeadersProp.current = propValue;
    }
  }, [props.shouldPersistHeaders, setShouldPersistHeaders]);

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
  const { onTabChange, defaultHeaders, children } = props;

  const addTab = useCallback<EditorContextType['addTab']>(() => {
    setTabState((current) => {
      // Make sure the current tab stores the latest values
      const updatedValues = synchronizeActiveTabValues(current);
      const newQuery = defaultAdvancedQueries[queryObj.language];
      const updated = {
        tabs: [...updatedValues.tabs, createTab({ query: newQuery, headers: defaultHeaders })],
        activeTabIndex: updatedValues.tabs.length,
      };
      storeTabs(updated);
      setEditorValues(updated.tabs[updated.activeTabIndex]);
      onTabChange?.(updated);
      return updated;
    });
  }, [queryObj.language, defaultHeaders, onTabChange, setEditorValues, storeTabs, synchronizeActiveTabValues]);

  const changeTab = useCallback<EditorContextType['changeTab']>(
    (index) => {
      setTabState((current) => {
        const updated = {
          ...current,
          activeTabIndex: index,
        };
        storeTabs(updated);
        setEditorValues(updated.tabs[updated.activeTabIndex]);
        onTabChange?.(updated);
        return updated;
      });
    },
    [onTabChange, setEditorValues, storeTabs],
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
        onTabChange?.(updated);
        return updated;
      });
    },
    [onTabChange, setEditorValues, storeTabs],
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
        onTabChange?.(updated);
        return updated;
      });
    },
    [onTabChange, setEditorValues, storeTabs],
  );

  const updateActiveTabValues = useCallback<EditorContextType['updateActiveTabValues']>(
    (partialTab) => {
      setTabState((current) => {
        const updated = setPropertiesInActiveTab(current, partialTab);
        storeTabs(updated);
        onTabChange?.(updated);
        return updated;
      });
    },
    [onTabChange, storeTabs],
  );

  const { onEditOperationName } = props;
  const setOperationName = useCallback<EditorContextType['setOperationName']>(
    (operationName) => {
      if (!queryEditor) {
        return;
      }

      queryEditor.operationName = operationName;
      updateActiveTabValues({ operationName });
      onEditOperationName?.(operationName);
    },
    [onEditOperationName, queryEditor, updateActiveTabValues],
  );

  const externalFragments = useMemo(() => {
    const map = new Map<string, FragmentDefinitionNode>();
    if (Array.isArray(props.externalFragments)) {
      for (const fragment of props.externalFragments) {
        map.set(fragment.name.value, fragment);
      }
    } else if (typeof props.externalFragments === 'string') {
      visit(parse(props.externalFragments, {}), {
        FragmentDefinition(fragment) {
          map.set(fragment.name.value, fragment);
        },
      });
    } else if (props.externalFragments) {
      throw new Error(
        'The `externalFragments` prop must either be a string that contains the fragment definitions in SDL or a list of FragmentDefinitionNode objects.',
      );
    }
    return map;
  }, [props.externalFragments]);

  const validationRules = useMemo(() => props.validationRules ?? [], [props.validationRules]);

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
      externalFragments,
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
      externalFragments,
      validationRules,
      shouldPersistHeaders,
      setShouldPersistHeaders,
    ],
  );

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

export const useEditorContext = createContextHook(EditorContext);

const PERSIST_HEADERS_STORAGE_KEY = 'shouldPersistHeaders';
