import {CreateFetcherOptions} from "@graphiql/toolkit/src/create-fetcher/types";
import {Query} from "../Query";



export type CustomCreateFetcherOptions = CreateFetcherOptions & {
  onResults: (data: any) => void;
  query?: Query
}
export * from "./mapping";
export * from "./createFetcher";
export type { CSRFToken } from "./csrf";
export * from "./csrf";
export * from "./debounce";
export * from "./http";

export * from "./libs";
export * from "./ui";
