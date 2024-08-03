import type { PluginContextType } from '@/types';
import { createContextHook, createNullableContext } from '@/components/IDE/core/src/utility/context';

export const PluginContext = createNullableContext<PluginContextType>('PluginContext');

export const usePluginContext = createContextHook(PluginContext);
