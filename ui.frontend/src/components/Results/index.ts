/**
 * This module contains components and types related to the results of the Content Wizard.
 */

import './Results.scss';
export { ResultHandler } from './ResultHandler';

export type Result = {
  [name: string]: any;
  path: string;
};

export type Results = Result[] | string | null;
