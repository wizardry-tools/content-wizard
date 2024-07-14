import { memo, ReactNode, useCallback, useMemo } from 'react';
import { Results } from '../index';
import { Link, TableBody, TableCell, TableRow } from '@mui/material';

export type ResultTableBodyProps = {
  rows: Results;
  keys: string[];
  rowsPerPage: number;
  page: number;
  onClick: (value: string) => void;
};
export const ResultTableBody = memo((props: ResultTableBodyProps) => {
  const { rows = [], keys, rowsPerPage, page, onClick } = props;
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
    </>
  );
  return (
    <TableBody>
      <Rows />
    </TableBody>
  );
});
