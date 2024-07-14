import { ChangeEvent, memo, MouseEvent } from 'react';
import { TableFooter, TablePagination, TableRow } from '@mui/material';
import { TablePaginationActions } from './TablePaginationActions';
import { useLogger } from 'src/providers';

export type ResultTableFooterProps = {
  rowsLength: number;
  rowsPerPage: number;
  page: number;
  onPageChange: (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowsPerPageChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onExport: () => void;
};
export const ResultTableFooter = memo((props: ResultTableFooterProps) => {
  const logger = useLogger();
  logger.debug({ message: 'ResultsTableFooter render()' });
  const { rowsLength, rowsPerPage, page, onPageChange, onRowsPerPageChange, onExport } = props;

  return (
    <TableFooter>
      <TableRow>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
          count={rowsLength}
          rowsPerPage={rowsPerPage}
          page={page}
          sx={{
            borderBottom: 'none',
            width: '100%',
          }}
          slotProps={{
            select: {
              inputProps: {
                'aria-label': 'rows per page',
              },
              native: true,
            },
          }}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
          ActionsComponent={(props) => <TablePaginationActions {...props} handleExport={onExport} />}
        />
      </TableRow>
    </TableFooter>
  );
});
