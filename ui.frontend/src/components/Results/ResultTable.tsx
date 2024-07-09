import { useState, useMemo, MouseEvent, ChangeEvent, ReactNode } from 'react';
import {
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableFooter,
  TableRow,
  TableCell,
  TablePagination,
  Paper,
  Link,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle, Button, Typography
} from '@mui/material';
import { styled } from '@mui/system';
import { TablePaginationActions } from './TablePaginationActions';
import { useResults } from 'src/providers';
import {ResultExplorer} from "./ResultExplorer/ResultExplorer";

const TableHeadCell = styled(TableCell)(() => ({
  fontWeight: 'bold',
}));

export const ResultTable = () => {
  const rows = useResults();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openExplorer, setOpenExplorer] = useState(false);
  const [explorerPath, setExplorerPath] = useState('');
  const keys = useMemo(() => Object.keys((rows && rows[0]) || {}), [rows]);

  const handleChangePage = (_event: MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenExplorer = () => setOpenExplorer(true);
  const handleCloseExplorer = () => setOpenExplorer(false);

  const buildLink = ({ value }: { value: string }): ReactNode => {
    return (
      <Link
        color="secondary"
        onClick={()=>{
          setExplorerPath(value);
          handleOpenExplorer();
        }}
        sx={{
          textDecoration: 'none',
          cursor: 'pointer',
          '&:hover': {
            textDecoration: 'underline'
          }
        }}
      >
        {value}
      </Link>
    );
  };

  const ResultTableHead = () => {
    if (!rows || typeof rows === 'string') {
      return null;
    }
    const cells: React.ReactNode[] = [];
    keys.forEach((key, index) => {
      cells.push(
        index === 0 ? (
          <TableHeadCell key={key}>{key}</TableHeadCell>
        ) : (
          <TableHeadCell key={key} align="right">
            {key}
          </TableHeadCell>
        ),
      );
    });
    return (
      <TableHead>
        <TableRow>{cells}</TableRow>
      </TableHead>
    );
  };

  const ResultTableBody = () => {
    if (!rows || typeof rows === 'string') {
      return null;
    }
    const tableRows = (rowsPerPage > 0 ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : rows).map(
      (row) => {
        const cells: React.ReactNode[] = [];
        keys.forEach((key, index) => {
          let value = row[key];
          if (key === 'path') {
            value = buildLink({ value });
          }
          // align first column to the left
          cells.push(
            index === 0 ? (
              <TableCell key={key} component="td" scope="row">
                {value}
              </TableCell>
            ) : (
              <TableCell key={key} align="right">
                {value}
              </TableCell>
            ),
          );
        });

        return (
          <TableRow key={row.path} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
            {cells}
          </TableRow>
        );
      },
    );
    return <TableBody>{tableRows}</TableBody>;
  };

  const ResultTableFooter = () => {
    if (!rows || typeof rows === 'string') {
      return null;
    }

    return (
      <TableFooter>
        <TableRow>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
            colSpan={3}
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            sx={{ borderBottom: 'none' }}
            slotProps={{
              select: {
                inputProps: {
                  'aria-label': 'rows per page',
                },
                native: true,
              },
            }}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            ActionsComponent={TablePaginationActions}
          />
        </TableRow>
      </TableFooter>
    );
  };

  const ResultExplorerModal = () => {
    return (
      <Dialog
        id="result-explorer-modal"
        open={openExplorer}
        onClose={handleCloseExplorer}
        aria-labelledby="result-explorer-modal-title"
      >
        <DialogTitle id="result-explorer-modal-title">
          Result Explorer [{explorerPath}]
        </DialogTitle>
        <DialogContent>
          <ResultExplorer
            path={explorerPath}
          />
        </DialogContent>
        <DialogActions>
          <Button autoFocus color={"primary"} onClick={handleCloseExplorer}>
            <Typography>Close</Typography>
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <div className="result-table">
      {rows && typeof rows !== 'string' && (
        <TableContainer component={Paper} elevation={5}>
          <Table sx={{ minWidth: 650 }} size="small" aria-label="query results table">
            <ResultTableHead/>
            <ResultTableBody/>
            <ResultTableFooter/>
          </Table>
        </TableContainer>
      )}
      <ResultExplorerModal/>
    </div>
  );
};
