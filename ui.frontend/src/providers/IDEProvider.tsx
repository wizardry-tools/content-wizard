import {
  EditorContextProvider,
  ExecutionContextProvider,
  ExplorerContextProvider,
  HistoryContextProvider,
  PluginContextProvider,
  SchemaContextProvider,
} from '@/components/IDE/core/src';
import { APIContextProvider } from '@/components/IDE/core/src';
import { PropsWithChildren } from 'react';
import { useLogger } from './LoggingProvider';
import { useRenderCount } from '@/utility';

export type IDEProviderProps = PropsWithChildren;

export function IDEProvider({ children }: IDEProviderProps) {
  const logger = useLogger();
  const renderCount = useRenderCount();
  logger.debug({ message: `IDEProvider[${renderCount}] render()` });

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
