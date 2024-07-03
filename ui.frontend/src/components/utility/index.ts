import {getCsrfToken} from "./csrf";
import {CreateFetcherOptions} from "@graphiql/toolkit/src/create-fetcher/types";
import {Query} from "../QueryWizard/types/QueryTypes";

export {
  createCustomFetcher,
  createMultiLanguageFetcher
} from "./createFetcher";

export { getCsrfToken } from "./csrf";

export type CSRFToken = Awaited<ReturnType<typeof getCsrfToken>>;

export { debounce } from "./debounce";

export {
  DYNAMIC_HEADERS,
  getParams,
  queryToParams
} from "./http";


export type CustomCreateFetcherOptions = CreateFetcherOptions & {
  onResults: (data: any) => void;
  query?: Query
}

export {
  isSubscriptionWithName,
  createSimpleGetFetcher,
  createSimplePostFetcher,
  createWebsocketsFetcherFromUrl,
  createWebsocketsFetcherFromClient,
  createLegacyWebsocketsFetcher,
  createMultipartFetcher,
  getWsFetcher,
  getFileName
} from "./libs";

export {
  endpoints,
  buildGraphQLURL,
  buildQueryString
} from "./query";

export { a11yProps } from "./ui";