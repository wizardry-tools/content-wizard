import { memo, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { Link, TableBody, TableCell, TableRow } from '@mui/material';
import type { ResultTableBodyProps } from '@/types';
import { useResults } from '@/providers';

/**
 * This component is the body of the {@link ResultTable}. Contains all {@link Result}s from a {@link Query} execution.
 */
export const ResultTableBody = memo((props: ResultTableBodyProps) => {
  const { tableResults, keys } = useResults();
  const { rowsPerPage, page, onClick } = props;
  const rowsToRender = useMemo(() => {
    if (!Array.isArray(tableResults)) {
      return [];
    }
    if (rowsPerPage > 0) {
      return tableResults.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) ?? [];
    }
    return tableResults;
  }, [page, tableResults, rowsPerPage]);

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows = useMemo(
    () => (page > 0 ? Math.max(0, (1 + page) * rowsPerPage - (tableResults?.length ?? 0)) : 0),
    [tableResults?.length, page, rowsPerPage],
  );

  const buildLink = useCallback(
    ({ value }: { value: string }): ReactNode => (
      <Link
        color="secondary"
        onClick={() => {
          onClick(value);
        }}
        sx={{
          textDecoration: 'none',
          cursor: 'pointer',
          '&:hover': {
            textDecoration: 'underline',
          },
        }}
      >
        {value}
      </Link>
    ),
    [onClick],
  );

  const Rows = () => (
    <>
      {rowsToRender.map((row) => {
        const cells: ReactNode[] = [];
        keys.forEach((key, index) => {
          const value = row[key];
          let path;
          let colSpan = 1;
          if (key === 'path') {
            path = buildLink({ value: value as string });
            colSpan = 2;
          }
          // align first column to the left
          cells.push(
            <TableCell key={key} component="td" scope="row" colSpan={colSpan} align={index === 0 ? 'left' : 'right'}>
              {path ?? value}
            </TableCell>,
          );
        });

        return (
          <TableRow
            key={(row.path as string) ?? Math.random()}
            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
          >
            {cells}
          </TableRow>
        );
      })}
      {emptyRows > 0 && (
        <TableRow
          key="empty-row"
          style={{
            height: 55 * emptyRows,
          }}
        >
          <TableCell colSpan={6} />
        </TableRow>
      )}
    </>
  );
  return (
    <TableBody>
      <Rows />
    </TableBody>
  );
});
