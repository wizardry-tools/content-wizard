export { ResultHandler } from './ResultHandler';

export type Result = {
  [name: string]: any;
  path: string;
};

export type Results = Result[] | string | null;
