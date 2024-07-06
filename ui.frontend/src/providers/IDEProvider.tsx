import {
  EditorContextProvider,
  EditorContextProviderProps, ExecutionContextProvider,
  ExecutionContextProviderProps, ExplorerContextProvider,
  ExplorerContextProviderProps, HistoryContextProvider,
  HistoryContextProviderProps, PluginContextProvider,
  PluginContextProviderProps, SchemaContextProvider,
  SchemaContextProviderProps
} from "src/components/IDE/core/src";
import {useIsGraphQL} from "./QueryProvider";
import {APIContextProvider} from "src/components/IDE/core/src";

export type IDEProviderProps = EditorContextProviderProps &
  ExecutionContextProviderProps &
  ExplorerContextProviderProps &
  HistoryContextProviderProps &
  PluginContextProviderProps &
  SchemaContextProviderProps;

export function IDEProvider(
  {
    children,
    dangerouslyAssumeSchemaIsValid,
    defaultQuery,
    defaultHeaders,
    defaultTabs,
    externalFragments,
    fetcher,
    getDefaultFieldNames,
    headers,
    inputValueDeprecation,
    introspectionQueryName,
    maxHistoryLength,
    onEditOperationName,
    onSchemaChange,
    onTabChange,
    onTogglePluginVisibility,
    operationName,
    plugins,
    query, //TODO: Make this a Query object instead of a string
    response,
    schema,
    schemaDescription,
    shouldPersistHeaders,
    validationRules,
    variables,
    visiblePlugin
  }: IDEProviderProps) {

  const isGraphQL = useIsGraphQL();
  return (
      <HistoryContextProvider maxHistoryLength={maxHistoryLength}>
        <EditorContextProvider
          defaultQuery={defaultQuery}
          defaultHeaders={defaultHeaders}
          defaultTabs={defaultTabs}
          externalFragments={externalFragments}
          headers={headers}
          onEditOperationName={onEditOperationName}
          onTabChange={onTabChange}
          query={query}
          response={response}
          shouldPersistHeaders={shouldPersistHeaders}
          validationRules={validationRules}
          variables={variables}
        >
          <APIContextProvider>
            <SchemaContextProvider
              dangerouslyAssumeSchemaIsValid={dangerouslyAssumeSchemaIsValid}
              fetcher={fetcher}
              inputValueDeprecation={inputValueDeprecation}
              introspectionQueryName={introspectionQueryName}
              onSchemaChange={onSchemaChange}
              schema={isGraphQL ? schema : null}
              schemaDescription={schemaDescription}
            >
              <ExecutionContextProvider
                getDefaultFieldNames={getDefaultFieldNames}
                fetcher={fetcher}
                operationName={operationName}
              >
                <ExplorerContextProvider>
                  <PluginContextProvider
                    onTogglePluginVisibility={onTogglePluginVisibility}
                    plugins={plugins}
                    visiblePlugin={visiblePlugin}
                  >
                    {children}
                  </PluginContextProvider>
                </ExplorerContextProvider>
              </ExecutionContextProvider>
            </SchemaContextProvider>
          </APIContextProvider>
        </EditorContextProvider>
      </HistoryContextProvider>
  );
}