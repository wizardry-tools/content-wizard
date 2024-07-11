import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, CircularProgress, Paper, Stack } from '@mui/material';
import { Tooltip, ResultExplorerEditor } from 'src/components/IDE/core/src';
import { useFetcher } from './fetcher';

export type ResultExplorerProps = {
  path: string;
};
export type ResultData = string;
export const ResultExplorer = ({ path }: ResultExplorerProps) => {
  const [data, setData] = useState<ResultData>('');
  const fetching = useRef(false);
  const fetcher = useFetcher({ fetching });

  useEffect(() => {
    if (data || !fetcher || fetching.current) {
      // all the reasons not to fetch
      return;
    }
    fetcher.loadData({ path, resultHandler: setData });
  }, [data, fetcher, path]);

  const ExplorerWindow = useMemo(() => {
    return (
      <Paper elevation={3} className="explorer-paper">
        <Tooltip.Provider>
          <Stack className={`result-explorer-stack`} direction="row" spacing={1}>
            <ResultExplorerEditor editorTheme="wizard" keyMap="sublime" className="result-explorer-data" data={data} />
          </Stack>
        </Tooltip.Provider>
      </Paper>
    );
  }, [data]);

  return (
    <div className="result-explorer">
      <Box
        className={`${data ? 'hide' : 'show'}`}
        sx={{
          position: 'absolute',
          left: '50%',
          right: '50%',
          display: 'none',
          '&.show': {
            display: 'block',
          },
        }}
      >
        <CircularProgress />
      </Box>
      <Stack
        className={`result-explorer-stack ${!data ? 'hide' : 'show'}`}
        sx={{
          '&.hide': {
            display: 'none',
          },
        }}
      >
        {ExplorerWindow}
      </Stack>
    </div>
  );
};
