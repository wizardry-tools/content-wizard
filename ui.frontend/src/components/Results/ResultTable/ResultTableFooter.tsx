import { memo, useMemo } from 'react';
import { TableFooter, TablePagination, TableRow } from '@mui/material';
import type { ResultTableFooterProps } from '@/types';
import { useLogger, useResults } from '@/providers';
import { usePaperTheme } from '@/utility';
import { TablePaginationActions } from './TablePaginationActions';

export const ResultTableFooter = memo((props: ResultTableFooterProps) => {
  const logger = useLogger();
  logger.debug({ message: 'ResultsTableFooter render()' });
  const { tableResults } = useResults();
  const length = useMemo(() => tableResults.length, [tableResults]);
  const { rowsPerPage, page, onPageChange, onRowsPerPageChange, elevation = 5 } = props;
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
          count={length}
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
          ActionsComponent={(props) => <TablePaginationActions {...props} />}
        />
      </TableRow>
    </TableFooter>
  );
});
