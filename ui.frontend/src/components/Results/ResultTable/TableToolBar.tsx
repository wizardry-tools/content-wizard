import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { Box, IconButton, TableRow, TextField, Tooltip } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useLogger, useResults } from '@/providers';
import { TableHeadCell } from './TableHeadCell';
import DownloadIcon from '@mui/icons-material/Download';
import WidgetsIcon from '@mui/icons-material/Widgets';
import { ResultsExporterDialog } from '../ResultsExporter';
import { PackageBuilderDialog } from '../PackageBuilder';
import { useDebounce, useRenderCount } from '@/utility';

export const TableToolBar = () => {
  const logger = useLogger();
  const renderCount = useRenderCount();
  logger.debug({ message: `TableToolBar[${renderCount}] render()` });
  const { keys, filter, setFilter } = useResults();
  const length = keys.length;
  const [filterValue, setFilterValue] = useState(filter);
  const debouncedValue = useDebounce(filterValue, 200);
  const [openFilter, setOpenFilter] = useState(false);
  const [openExporter, setOpenExporter] = useState(false);
  const [openPackageBuilder, setOpenPackageBuilder] = useState(false);

  const handleFilterChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      logger.debug({ message: `TableToolBar handleFilterChange()` });
      const value = event.target.value;
      setFilterValue(value);
    },
    [logger],
  );

  const handleCloseExporter = useCallback(() => {
    setOpenExporter(false);
  }, []);
  const handleOpenExporter = useCallback(() => {
    setOpenExporter(true);
  }, []);

  const handleClosePackageBuilder = useCallback(() => {
    setOpenPackageBuilder(false);
  }, []);
  const handleOpenPackageBuilder = useCallback(() => {
    setOpenPackageBuilder(true);
  }, []);

  useEffect(() => {
    setFilter(debouncedValue);
  }, [debouncedValue, setFilter]);

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
              onClick={handleOpenExporter}
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
          <ResultsExporterDialog closeHandler={handleCloseExporter} open={openExporter} />
          <Tooltip title="Build Content Package">
            <IconButton
              onClick={handleOpenPackageBuilder}
              sx={{
                width: '3rem',
                height: '3rem',
                position: 'absolute',
                top: 0,
                left: '3rem',
              }}
            >
              <WidgetsIcon />
            </IconButton>
          </Tooltip>
          <PackageBuilderDialog closeHandler={handleClosePackageBuilder} open={openPackageBuilder} />
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
              onClick={() => {
                setOpenFilter((prev) => !prev);
              }}
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
