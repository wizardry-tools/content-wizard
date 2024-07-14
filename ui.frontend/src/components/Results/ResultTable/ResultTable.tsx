import { useState, useMemo, MouseEvent, ChangeEvent, useCallback, useRef } from 'react';
import { Table, TableContainer, Paper } from '@mui/material';
import exportFromJSON from 'export-from-json';
import { useAlertDispatcher, useLogger, useResults } from 'src/providers';
import { ResultExplorerModal } from '../ResultExplorer';
import { ResultTableBody } from './ResultTableBody';
import { ResultTableFooter } from './ResultTableFooter';
import { ResultTableHead } from './ResultTableHead';

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
      {rows && typeof rows !== 'string' && (
        <TableContainer component={Paper} elevation={5}>
          <Table sx={{ minWidth: 650 }} size="small" aria-label="query results table">
            <ResultTableHead keys={keys} />
            <ResultTableBody rows={rows} keys={keys} rowsPerPage={rowsPerPage} page={page} onClick={handleLinkClick} />
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
