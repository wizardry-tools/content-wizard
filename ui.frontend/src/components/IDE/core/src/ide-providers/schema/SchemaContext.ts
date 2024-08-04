import type { SchemaContextType } from '@/types';
import { createContextHook, createNullableContext } from '../../utility';

export const SchemaContext = createNullableContext<SchemaContextType>('SchemaContext');

export const useSchemaContext = createContextHook(SchemaContext);
