import { useState, MouseEvent, ChangeEvent, useCallback, memo } from 'react';
import { Table, TableContainer, Paper, PaperProps } from '@mui/material';
import { useLogger } from '@/providers';
import { ResultExplorerDialog } from '../ResultExplorer';
import { ResultTableBody } from './ResultTableBody';
import { ResultTableFooter } from './ResultTableFooter';
import { ResultTableHead } from './ResultTableHead';
import { useRenderCount } from '@/utility';

/**
 * This is the root of the Data Table that displays the Results Data
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
