import {createReverseMapping} from "../../utility/libs";


export type ContentType = "page" | "xf" | "asset" | "cf" | "child";
export const ContentTypes: Record<ContentType, string> = {
  page: 'Page',
  xf: 'XF (Experience Fragment)',
  asset: 'Asset',
  cf: 'CF (Content Fragment)',
  child: 'Child (Component)'
}

export const ContentTypeLookup = createReverseMapping(ContentTypes);

// pull the correct jcr:contentType from this map when you want to use it based on the user's selected Content Type
export const ContentTypeMap: Record<ContentType, string> = {
  page: 'cq:Page',
  xf: 'cq:Page',
  asset: 'dam:Asset',
  cf: 'dam:Asset',
  child: 'nt:unstructured'
};


