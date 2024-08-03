import type { SchemaContextType } from '@/types';
import { createContextHook, createNullableContext } from '@/components/IDE/core/src/utility/context';

export const SchemaContext = createNullableContext<SchemaContextType>('SchemaContext');

export const useSchemaContext = createContextHook(SchemaContext);
