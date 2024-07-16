import { useState, useMemo, MouseEvent, ChangeEvent, useCallback, useRef } from 'react';
import { Table, TableContainer, Paper } from '@mui/material';
import exportFromJSON from 'export-from-json';
import { useAlertDispatcher, useLogger, useResults } from 'src/providers';
import { ResultExplorerModal } from '../ResultExplorer';
import { ResultTableBody } from './ResultTableBody';
import { ResultTableFooter } from './ResultTableFooter';
import { ResultTableHead } from './ResultTableHead';
import { Result } from '../index';

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

export type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// Since 2020 all major browsers ensure sort stability with Array.prototype.sort().
// stableSort() brings sort stability to non-modern browsers (notably IE11). If you
// only support modern browsers you can replace stableSort(exampleArray, exampleComparator)
// with exampleArray.slice().sort(exampleComparator)
function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number): T[] {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

/**
 * This is the root of the Data Table that displays the Results Data
 * @constructor
 */
export const ResultTable = () => {
  const logger = useLogger();
  const renderCount = useRef(0);
  logger.debug({ message: `ResultTable[${++renderCount.current}] render()` });
  const rows = useResults();
  const alertDispatcher = useAlertDispatcher();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openExplorer, setOpenExplorer] = useState(false);
  const [explorerPath, setExplorerPath] = useState('');
  const keys = useMemo(() => Object.keys((rows && rows[0]) || {}), [rows]);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof Result>(keys[0]);

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - (rows?.length ?? 0)) : 0;

  const sortedRows = useMemo(() => stableSort(rows, getComparator(order, orderBy)), [rows, order, orderBy]);

  const handleRequestSort = (_event: MouseEvent<unknown>, key: string) => {
    const isAsc = orderBy === key && order === 'asc';
    console.log('handleRequestSort: ', isAsc, key);
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(key);
  };

  const handleChangePage = useCallback((_event: MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleCloseExplorer = useCallback(() => setOpenExplorer(false), []);

  const handleExport = useCallback(() => {
    const fileName = 'Content-Wizard-Results';
    const exportType = exportFromJSON.types.csv;
    if (rows) {
      exportFromJSON({
        data: rows,
        exportType,
        fileName,
        withBOM: true,
      });
    } else {
      alertDispatcher({
        message: 'No Results to export. How did you even press this button?',
        severity: 'warning',
        caller: ResultTable,
      });
    }
  }, [rows, alertDispatcher]);

  const handleLinkClick = useCallback((value: string) => {
    setExplorerPath(value);
    setOpenExplorer(true);
  }, []);

  return (
    <div className="result-table">
      {sortedRows && (
        <TableContainer component={Paper} elevation={5}>
          <Table sx={{ minWidth: 650 }} size="small" aria-label="query results table">
            <ResultTableHead keys={keys} onRequestSort={handleRequestSort} order={order} orderBy={orderBy} />
            <ResultTableBody
              rows={sortedRows}
              emptyRows={emptyRows}
              keys={keys}
              rowsPerPage={rowsPerPage}
              page={page}
              onClick={handleLinkClick}
            />
            <ResultTableFooter
              rowsLength={rows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              onExport={handleExport}
            />
          </Table>
        </TableContainer>
      )}
      {explorerPath && (
        <ResultExplorerModal open={openExplorer} closeHandler={handleCloseExplorer} path={explorerPath} />
      )}
    </div>
  );
};
