import { memo, ReactNode, useCallback, useMemo } from 'react';
import { Result } from '../index';
import { Link, TableBody, TableCell, TableRow } from '@mui/material';

export type ResultTableBodyProps = {
  rows: Result[];
  keys: string[];
  rowsPerPage: number;
  emptyRows: number;
  page: number;
  onClick: (value: string) => void;
};
export const ResultTableBody = memo((props: ResultTableBodyProps) => {
  const { rows = [], keys, rowsPerPage, page, onClick, emptyRows } = props;
  const rowsToRender = useMemo(() => {
    if (!Array.isArray(rows)) {
      return [];
    }
    if (rowsPerPage > 0) {
      return rows?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) ?? [];
    }
    return rows;
  }, [page, rows, rowsPerPage]);

  const buildLink = useCallback(
    ({ value }: { value: string }): ReactNode => (
      <Link
        color="secondary"
        onClick={() => onClick(value)}
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
