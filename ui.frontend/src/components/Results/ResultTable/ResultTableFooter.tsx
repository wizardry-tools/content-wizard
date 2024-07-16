import { ChangeEvent, memo, MouseEvent } from 'react';
import { TableFooter, TablePagination, TableRow } from '@mui/material';
import { TablePaginationActions } from './TablePaginationActions';
import { useLogger } from 'src/providers';
import { usePaperTheme } from 'src/utility/theme';

export type ResultTableFooterProps = {
  rowsLength: number;
  rowsPerPage: number;
  page: number;
  onPageChange: (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => void;
  onRowsPerPageChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onExport: () => void;
  elevation?: number;
};
export const ResultTableFooter = memo((props: ResultTableFooterProps) => {
  const logger = useLogger();
  logger.debug({ message: 'ResultsTableFooter render()' });
  const { rowsLength, rowsPerPage, page, onPageChange, onRowsPerPageChange, onExport, elevation = 5 } = props;
  const footerTheme = usePaperTheme({
    elevation,
    styles: {
      position: 'sticky',
      bottom: 0,
      zIndex: 2,
    },
  });

  return (
    <TableFooter sx={footerTheme}>
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
