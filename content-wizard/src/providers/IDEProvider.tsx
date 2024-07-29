import {
  EditorContextProvider,
  ExecutionContextProvider,
  ExplorerContextProvider,
  HistoryContextProvider,
  PluginContextProvider,
  SchemaContextProvider,
} from '@/components/IDE/core/src';
import { APIContextProvider } from '@/components/IDE/core/src';
import { useLogger } from './LoggingProvider';
import { useRenderCount } from '@/utility';
import { IDEProviderProps } from '@/types';

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
