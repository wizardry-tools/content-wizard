import { ChangeEvent, MouseEvent, MutableRefObject } from 'react';
import { ExportType } from 'export-from-json/src/types';
import { TablePaginationActionsProps } from '@mui/material/TablePagination/TablePaginationActions';

export type ResultProp = string | number | boolean;
export type Result = Record<string, ResultProp>;
export type ResultData = Result | string;

export type AllowedExportType = Exclude<ExportType, 'txt' | 'css'>;

export type Order = 'asc' | 'desc';

export type ResultsDispatchProps = {
  results: Result[];
};
export type ResultsContextProps = {
  results: Result[];
  keys: string[];
  filter: string;
  setFilter: (filter: string) => void;
  tableResults: Result[];
  order: Order;
  setOrder: (order: Order) => void;
  orderBy: keyof Result;
  setOrderBy: (orderBy: string) => void;
  exportResults: (fileName?: string, exportType?: AllowedExportType) => void;
};

export type OnResultsCallback = (index: number) => void;

export type WizardPaginationActionsProps = TablePaginationActionsProps;

export type ResultTableHeadProps = {
  elevation?: number;
};
export type ResultTableBodyProps = {
  rowsPerPage: number;
  page: number;
  onClick: (value: string) => void;
};
export type ResultTableFooterProps = {
  rowsPerPage: number;
  page: number;
  onPageChange: (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowsPerPageChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  elevation?: number;
};
export type ResultsExporterDialogProps = {
  closeHandler: () => void;
  open: boolean;
};

export type ResultExplorerDialogProps = {
  open: boolean;
  path: string;
  closeHandler: () => void;
};

export type FetcherProps = {
  fetching: MutableRefObject<boolean>;
};
export type LoadDataProps = {
  path: string;
  resultHandler: (result: ResultData) => void;
  defaultResult?: string;
  stringify?: boolean;
  depth?: number;
};
export type LoadDataCallback = (props: LoadDataProps) => void;
export type ResultExplorerProps = {
  path: string;
};
