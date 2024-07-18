import { MouseEvent, useCallback, useMemo, useRef } from 'react';
import { Box, TableHead, TableRow, TableSortLabel } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { usePaperTheme } from 'src/utility/theme';
import { useLogger, useResults } from 'src/providers';
import { TableHeadCell } from './TableHeadCell';
import { TableToolBar } from './TableToolBar';

export type ResultTableHeadProps = {
  elevation?: number;
};
export const ResultTableHead = (props: ResultTableHeadProps) => {
  const logger = useLogger();
  const renderCount = useRef(0);
  logger.debug({ message: `ResultTableHead[${++renderCount.current}] render()` });
  const { keys, order, orderBy, setOrder, setOrderBy } = useResults();
  const { elevation = 5 } = props;
  const handleSortClick = useCallback(
    (key: string) => (_event: MouseEvent<unknown>) => {
      // if previous orderBy matches the clicked key and the previous order is asc, then the new order should be desc.
      const isAsc = orderBy === key && order === 'asc';
      logger.debug({ message: `ResultTableHead[${renderCount.current}] handleSortClick()`, isAsc, key, order });
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(key);
    },
    [logger, order, orderBy, setOrder, setOrderBy],
  );

  const headerCellTheme = usePaperTheme({ elevation, styles: { position: 'sticky', top: 0 } });

  const headerRow = useMemo(() => {
    return (
      <TableRow>
        {keys.map((key, index) => (
          <TableHeadCell key={key} align={index === 0 ? 'left' : 'right'} colSpan={key === 'path' ? 2 : 1}>
            <TableSortLabel
              active={orderBy === key}
              direction={orderBy === key ? order : 'asc'}
              onClick={handleSortClick(key)}
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
    );
  }, [handleSortClick, keys, order, orderBy]);

  return (
    <TableHead sx={headerCellTheme}>
      <TableToolBar />
      {headerRow}
    </TableHead>
  );
};
