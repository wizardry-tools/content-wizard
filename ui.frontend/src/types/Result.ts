export type ResultProp = string | number | boolean;
export type Result = Record<string, ResultProp>;
export type QueryResults = {
  hits?: Result[];
  results?: Result[];
  data?: Record<string, ResultProp>;
};
