import { createContextHook, createNullableContext } from '../utility';
import type { EditorContextType } from '@/types';

export const EditorContext = createNullableContext<EditorContextType>('EditorContext');

export const useEditorContext = createContextHook(EditorContext);
