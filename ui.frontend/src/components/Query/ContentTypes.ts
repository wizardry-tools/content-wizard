import type { ContentType, ContentTypeProperty } from '@/types';

// pull the correct jcr:contentType from this map when you want to use it based on the user's selected Content Type
export const contentTypeMap: Record<ContentType, ContentTypeProperty> = {
  page: 'cq:Page',
  xf: 'cq:Page',
  asset: 'dam:Asset',
  cf: 'dam:Asset',
  child: 'nt:unstructured',
};
