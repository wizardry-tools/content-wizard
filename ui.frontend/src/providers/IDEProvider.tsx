import {
  EditorContextProvider,
  ExecutionContextProvider,
  ExplorerContextProvider,
  HistoryContextProvider,
  PluginContextProvider,
  SchemaContextProvider,
} from 'src/components/IDE/core/src';
import { APIContextProvider } from 'src/components/IDE/core/src';
import { PropsWithChildren, useRef } from 'react';
import { useLogger } from './LoggingProvider';

export type IDEProviderProps = PropsWithChildren;

export function IDEProvider({ children }: IDEProviderProps) {
  const logger = useLogger();
  const renderCount = useRef(0);
  logger.debug({ message: `IDEProvider[${++renderCount.current}] render()` });

  return (
    <HistoryContextProvider>
      <EditorContextProvider>
        <APIContextProvider>
          <SchemaContextProvider>
            <ExecutionContextProvider>
              <ExplorerContextProvider>
                <PluginContextProvider>{children}</PluginContextProvider>
              </ExplorerContextProvider>
            </ExecutionContextProvider>
          </SchemaContextProvider>
        </APIContextProvider>
      </EditorContextProvider>
    </HistoryContextProvider>
  );
}
