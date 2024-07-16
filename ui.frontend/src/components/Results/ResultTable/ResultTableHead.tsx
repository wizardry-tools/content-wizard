import { memo, MouseEvent } from 'react';
import { Box, TableHead, TableRow, TableCell, TableSortLabel } from '@mui/material';
import { styled } from '@mui/system';
import { Order } from './ResultTable';
import { visuallyHidden } from '@mui/utils';
import { usePaperTheme } from 'src/utility/theme';

const TableHeadCell = styled(TableCell)(() => ({
  fontWeight: 'bold',
}));

export type ResultTableHeadProps = {
  keys: string[];
  onRequestSort: (event: MouseEvent<unknown>, key: string) => void;
  order: Order;
  orderBy: string | number;
  elevation?: number;
};
export const ResultTableHead = memo((props: ResultTableHeadProps) => {
  const { keys, order, orderBy, onRequestSort, elevation = 5 } = props;
  const createSortHandler = (key: string) => (event: MouseEvent<unknown>) => {
    onRequestSort(event, key);
  };
  const headerCellTheme = usePaperTheme({ elevation, styles: { position: 'sticky', top: 0 } });

  return (
    <TableHead sx={headerCellTheme}>
      <TableRow>
        {keys.map((key, index) => (
          <TableHeadCell key={key} align={index === 0 ? 'left' : 'right'}>
            <TableSortLabel
              active={orderBy === key}
              direction={orderBy === key ? order : 'asc'}
              onClick={createSortHandler(key)}
            >
              {key}
              {orderBy === key ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableHeadCell>
        ))}
      </TableRow>
    </TableHead>
  );
});
