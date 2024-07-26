import { memo, ReactNode, useCallback, useMemo } from 'react';
import { Link, TableBody, TableCell, TableRow } from '@mui/material';
import { useResults } from '@/providers';

export type ResultTableBodyProps = {
  rowsPerPage: number;
  page: number;
  onClick: (value: string) => void;
};
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
          let value = row[key];
          let colSpan = 1;
          if (key === 'path') {
            value = buildLink({ value });
            colSpan = 2;
          }
          // align first column to the left
          cells.push(
            <TableCell key={key} component="td" scope="row" colSpan={colSpan} align={index === 0 ? 'left' : 'right'}>
              {value}
            </TableCell>,
          );
        });

        return (
          <TableRow key={row.path} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
            {cells}
          </TableRow>
        );
      })}
      {emptyRows > 0 && (
        <TableRow
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
