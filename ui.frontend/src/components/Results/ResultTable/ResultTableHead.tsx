import { useCallback, useMemo } from 'react';
import { Box, TableHead, TableRow, TableSortLabel } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import type { ResultTableHeadProps } from '@/types';
import { useRenderCount, usePaperTheme } from '@/utility';
import { useLogger, useResults } from '@/providers';
import { TableHeadCell } from './TableHeadCell';
import { TableToolBar } from './TableToolBar';

/**
 * This component is the Table Head for the {@link ResultTable}. It contains sorting logic on header cells.
 * @param props
 * @constructor
 */
export const ResultTableHead = (props: ResultTableHeadProps) => {
  const logger = useLogger();
  const renderCount = useRenderCount();
  logger.debug({ message: `ResultTableHead[${renderCount}] render()` });
  const { keys, order, orderBy, setOrder, setOrderBy } = useResults();
  const { elevation = 5 } = props;
  const handleSortClick = useCallback(
    (key: string) => () => {
      // if previous orderBy matches the clicked key and the previous order is asc, then the new order should be desc.
      const isAsc = orderBy === key && order === 'asc';
      logger.debug({ message: `ResultTableHead handleSortClick()`, isAsc, key, order });
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
