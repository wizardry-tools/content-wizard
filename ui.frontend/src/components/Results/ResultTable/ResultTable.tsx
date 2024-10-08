import { useState, useCallback, memo } from 'react';
import type { MouseEvent, ChangeEvent } from 'react';
import { Table, TableContainer, Paper } from '@mui/material';
import type { PaperProps } from '@mui/material';
import { useLogger } from '@/providers';
import { useRenderCount } from '@/utility';
import { ResultExplorerDialog } from '../ResultExplorer';
import { ResultTableBody } from './ResultTableBody';
import { ResultTableFooter } from './ResultTableFooter';
import { ResultTableHead } from './ResultTableHead';

/**
 * This is the root of the Data {@link Table} that displays the {@link Result}s Data.
 * Features: Sorting, Filtering, Pagination, Exporting, Exploring, and Packaging.
 * @constructor
 */
export const ResultTable = () => {
  const logger = useLogger();
  const renderCount = useRenderCount();
  logger.debug({ message: `ResultTable[${renderCount}] render()` });
  const [page, setPage] = useState(0);

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openExplorer, setOpenExplorer] = useState(false);
  const [explorerPath, setExplorerPath] = useState('');

  const handleChangePage = useCallback((_event: MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleCloseExplorer = useCallback(() => {
    setOpenExplorer(false);
  }, []);

  const handleLinkClick = useCallback((value: string) => {
    setExplorerPath(value);
    setOpenExplorer(true);
  }, []);

  const TablePaper = memo((props: PaperProps) => {
    return <Paper elevation={5}>{props.children}</Paper>;
  });

  return (
    <div className="result-table">
      <div className="result-table-container">
        <TableContainer component={TablePaper}>
          <Table size="small" aria-label="query results table">
            <ResultTableHead />
            <ResultTableBody rowsPerPage={rowsPerPage} page={page} onClick={handleLinkClick} />
            <ResultTableFooter
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Table>
        </TableContainer>
        {explorerPath && (
          <ResultExplorerDialog open={openExplorer} closeHandler={handleCloseExplorer} path={explorerPath} />
        )}
      </div>
    </div>
  );
};
