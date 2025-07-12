import { memo, useMemo } from 'react';
import { InputBase, TableFooter, TablePagination, TableRow } from '@mui/material';
import type { ResultTableFooterProps } from '@/types';
import { useLogger, useResults } from '@/providers';
import { usePaperTheme } from '@/utility';
import { TablePaginationActions } from './TablePaginationActions';
import { styled } from '@mui/system';

/**
 * This component is the Table Footer for the {@link ResultTable}. It contains the {@link TablePagination}.
 * @param props
 * @constructor
 */
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
  const selectMenuTheme = usePaperTheme({
    styles: {
      boxShadow: 'none',
    },
  });

  const BootstrapInput = styled(InputBase)(({ theme }) => {
    return {
      'label + &': {
        marginTop: theme.spacing(3),
      },
      '& .MuiInputBase-input': {
        borderRadius: 4,
        '&:focus': {
          borderRadius: 4,
          borderColor: '#80bdff',
          boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
        },
        '.MuiTablePagination-menuItem': {
          ...selectMenuTheme,
        },
      },
    };
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
              input: <BootstrapInput />,
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
