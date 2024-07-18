import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Box, IconButton, TableRow, TextField, Tooltip } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useLogger, useResults } from 'src/providers';
import { TableHeadCell } from './TableHeadCell';
import DownloadIcon from '@mui/icons-material/Download';

export const TableToolBar = () => {
  const logger = useLogger();
  const renderCount = useRef(0);
  logger.debug({ message: `TableToolBar[${++renderCount.current}] render()` });
  const { keys, filter, setFilter, exportResults } = useResults();
  const length = keys.length;
  const [filterValue, setFilterValue] = useState(filter);
  const [openFilter, setOpenFilter] = useState(false);
  const handleFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
    logger.debug({ message: `TableToolBar[${renderCount.current}] handleFilterChange()` });
    const value = event.target.value;
    setFilterValue(value);
  };
  const handleExport = useCallback(() => exportResults(), [exportResults]);

  useEffect(() => {
    function onTimeout() {
      setFilter(filterValue);
    }

    let timeoutId = setTimeout(onTimeout, 200);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [filterValue, setFilter]);

  return (
    <TableRow className="result-table-toolbar">
      <TableHeadCell colSpan={length + 1}>
        {' '}
        {/* +1 for the path colSpan adjustment*/}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            position: 'relative',
          }}
        >
          <Tooltip title="Export results">
            <IconButton
              onClick={handleExport}
              sx={{
                width: '3rem',
                height: '3rem',
                position: 'absolute',
                top: 0,
                left: 0,
              }}
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          {openFilter && (
            <TextField
              id={'result-table-filter'}
              name={'result-table-filter'}
              label={'Filter'}
              value={filterValue}
              color="secondary"
              variant="standard"
              onChange={handleFilterChange}
              disabled={length < 1}
              autoFocus={true}
              sx={{
                display: 'inline-flex',
              }}
            />
          )}
          <Tooltip title="Filter results">
            <IconButton
              onClick={() => setOpenFilter((prev) => !prev)}
              sx={{
                width: '3rem',
                height: '3rem',
              }}
            >
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </TableHeadCell>
    </TableRow>
  );
};
