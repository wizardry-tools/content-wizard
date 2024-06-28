import type { PluginContextType } from '@/types';
import { createContextHook, createNullableContext } from '../../utility';

export const PluginContext = createNullableContext<PluginContextType>('PluginContext');

export const usePluginContext = createContextHook(PluginContext);
