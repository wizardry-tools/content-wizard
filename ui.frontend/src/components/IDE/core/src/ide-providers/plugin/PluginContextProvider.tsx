import { useCallback, useEffect, useMemo, useState } from 'react';
import type { GraphiQLPlugin, PluginContextProviderProps, PluginContextType } from '@/types';
import { useIsGraphQL } from '@/providers';
import { useExplorerContext } from '../../explorer';
import { useHistoryContext } from '../../history';
import { useStorageContext } from '../../ide-providers';
import { PluginContext } from './PluginContext';
import { DOC_EXPLORER_PLUGIN } from './DocExplorerPlugin';
import { LANGUAGE_SELECTOR_PLUGIN } from './LanguageSelectorPlugin';
import { HISTORY_PLUGIN } from './HistoryPlugin';

export function PluginContextProvider(props: PluginContextProviderProps) {
  const storage = useStorageContext();
  const explorerContext = useExplorerContext();
  const historyContext = useHistoryContext();
  const isGraphQL = useIsGraphQL();

  const hasExplorerContext = Boolean(explorerContext);
  const hasHistoryContext = Boolean(historyContext);
  const plugins = useMemo(() => {
    const pluginList: GraphiQLPlugin[] = [];
    const pluginTitles: Record<string, true> = {};

    pluginList.push(LANGUAGE_SELECTOR_PLUGIN);
    pluginTitles[LANGUAGE_SELECTOR_PLUGIN.title] = true;

    if (isGraphQL && hasExplorerContext) {
      pluginList.push(DOC_EXPLORER_PLUGIN);
      pluginTitles[DOC_EXPLORER_PLUGIN.title] = true;
    }
    if (hasHistoryContext) {
      pluginList.push(HISTORY_PLUGIN);
      pluginTitles[HISTORY_PLUGIN.title] = true;
    }

    for (const plugin of props.plugins ?? []) {
      if (!plugin.title) {
        throw new Error('All GraphiQL plugins must have a unique title');
      }
      if (pluginTitles[plugin.title]) {
        throw new Error(
          `All GraphiQL plugins must have a unique title, found two plugins with the title '${plugin.title}'`,
        );
      } else {
        pluginList.push(plugin);
        pluginTitles[plugin.title] = true;
      }
    }

    return pluginList;
  }, [hasExplorerContext, hasHistoryContext, isGraphQL, props.plugins]);

  const [visiblePlugin, internalSetVisiblePlugin] = useState<GraphiQLPlugin | null>(() => {
    const storedValue = storage.get(STORAGE_KEY);
    const pluginForStoredValue = plugins.find((plugin) => plugin.title === storedValue);
    if (pluginForStoredValue) {
      return pluginForStoredValue;
    }
    if (storedValue) {
      storage.set(STORAGE_KEY, '');
    }

    if (!props.visiblePlugin) {
      return null;
    }

    return (
      plugins.find(
        (plugin) => (typeof props.visiblePlugin === 'string' ? plugin.title : plugin) === props.visiblePlugin,
      ) ?? null
    );
  });

  const { onTogglePluginVisibility, children } = props;
  const setVisiblePlugin = useCallback<PluginContextType['setVisiblePlugin']>(
    (plugin) => {
      const newVisiblePlugin = plugin
        ? (plugins.find((p) => (typeof plugin === 'string' ? p.title : p) === plugin) ?? null)
        : null;
      internalSetVisiblePlugin((current) => {
        if (newVisiblePlugin === current) {
          return current;
        }
        onTogglePluginVisibility?.(newVisiblePlugin);
        return newVisiblePlugin;
      });
    },
    [onTogglePluginVisibility, plugins],
  );

  useEffect(() => {
    if (props.visiblePlugin) {
      setVisiblePlugin(props.visiblePlugin);
    }
  }, [plugins, props.visiblePlugin, setVisiblePlugin]);

  const value = useMemo<PluginContextType>(
    () => ({ plugins, setVisiblePlugin, visiblePlugin }),
    [plugins, setVisiblePlugin, visiblePlugin],
  );

  return <PluginContext.Provider value={value}>{children}</PluginContext.Provider>;
}

const STORAGE_KEY = 'visiblePlugin';
