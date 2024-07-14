import { memo } from 'react';
import { TableHead, TableRow, TableCell } from '@mui/material';
import { styled } from '@mui/system';

const TableHeadCell = styled(TableCell)(() => ({
  fontWeight: 'bold',
}));

export type ResultTableHeadProps = {
  keys: string[];
};
export const ResultTableHead = memo((props: ResultTableHeadProps) => {
  const { keys } = props;

  return (
    <TableHead>
      <TableRow>
        {keys.map((key, index) =>
          index === 0 ? (
            <TableHeadCell key={key}>{key}</TableHeadCell>
          ) : (
            <TableHeadCell key={key} align="right">
              {key}
            </TableHeadCell>
          ),
        )}
      </TableRow>
    </TableHead>
  );
});
