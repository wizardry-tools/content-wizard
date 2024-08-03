import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, CircularProgress, Paper, Stack } from '@mui/material';
import type { ResultData, ResultExplorerProps } from '@/types';
import { Tooltip, ResultExplorerEditor } from '@/components/IDE/core/src';
import { useJcrFetcher } from './useJcrFetcher';

import './ResultExplorer.scss';

export const ResultExplorer = ({ path }: ResultExplorerProps) => {
  const [data, setData] = useState<ResultData>('');
  const fetching = useRef(false);
  const fetcher = useJcrFetcher({ fetching });

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
            <ResultExplorerEditor
              editorTheme="wizard"
              keyMap="sublime"
              className="result-explorer-data"
              data={data as string}
            />
          </Stack>
        </Tooltip.Provider>
      </Paper>
    );
  }, [data]);

  return (
    <div className="result-explorer">
      <Box
        className={data ? 'hide' : 'show'}
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
