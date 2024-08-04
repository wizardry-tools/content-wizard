import type { GraphiQLPlugin } from '@/types';
import { DocsFilledIcon, DocsIcon } from '@/icons';
import { DocExplorer } from '../../explorer';
import { usePluginContext } from './PluginContext';

export const DOC_EXPLORER_PLUGIN: GraphiQLPlugin = {
  title: 'Documentation Explorer',
  icon: () => {
    const pluginContext = usePluginContext();
    return pluginContext?.visiblePlugin === DOC_EXPLORER_PLUGIN ? <DocsFilledIcon /> : <DocsIcon />;
  },
  content: DocExplorer,
};
