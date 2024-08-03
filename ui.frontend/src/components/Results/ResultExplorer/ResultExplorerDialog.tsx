import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';
import EngineeringIcon from '@mui/icons-material/Engineering';
import type { ResultData, ResultExplorerDialogProps } from '@/types';
import { escapeColon, escapeUrl } from '@/utility';
import { ResultExplorer } from './ResultExplorer';
import { useJcrFetcher } from './useJcrFetcher';
import {
  ASSET_EDITOR,
  CF_PROP,
  CONTENT_EDITOR,
  CONTENT_NODE,
  CRX_DE_PATH,
  DAM_PATH,
  PAGE_PROPERTIES_EDITOR,
  XF_PATH,
} from '@/components/Results/ResultExplorer/constants';

export const ResultExplorerDialog = ({ open, closeHandler, path }: ResultExplorerDialogProps) => {
  const fetching = useRef(false);
  const fetcher = useJcrFetcher({ fetching });

  const isContent = useMemo(() => path.includes(CONTENT_NODE), [path]);
  // Pages and XFs have the same conditions and authoring options
  const isPage = useMemo(() => isContent && !path.includes(DAM_PATH), [isContent, path]);
  const isAsset = useMemo(() => isContent && path.includes(DAM_PATH), [isContent, path]);
  const contentPath = useMemo(() => path.split(CONTENT_NODE)[0], [path]);

  // This is only used for label purposes
  const isXF = useMemo(() => path.includes(XF_PATH), [path]);
  const [isCF, setIsCF] = useState(false);

  useEffect(() => {
    if (!contentPath || !isAsset || !fetcher || fetching.current) {
      // all the reasons not to fetch
      return;
    }
    const resultHandler = (response: ResultData) => {
      if (typeof response === 'object' && CF_PROP in response) {
        setIsCF(!!response[CF_PROP]);
      }
    };
    fetcher.loadData({
      path: `${contentPath}${CONTENT_NODE}/${CF_PROP}`,
      resultHandler,
      stringify: false,
    });
  }, [contentPath, fetcher, isAsset]);

  const ResultDialogActions = () => {
    return (
      <DialogActions className={'result-explorer-dialog-actions'}>
        {isPage && (
          <>
            <Button
              autoFocus
              startIcon={<EditIcon />}
              variant="contained"
              color={'secondary'}
              target="_blank"
              href={`${CONTENT_EDITOR}${contentPath}.html`}
            >
              <Typography>Edit {isXF ? 'XF' : 'Page'}</Typography>
            </Button>
            <Button
              autoFocus
              startIcon={<InfoIcon />}
              variant="contained"
              color={'secondary'}
              target="_blank"
              href={`${PAGE_PROPERTIES_EDITOR}${escapeUrl(contentPath)}`}
            >
              <Typography>Edit {isXF ? 'XF' : 'Page'} Properties</Typography>
            </Button>
          </>
        )}
        {isAsset &&
          ((isCF && (
            <Button
              autoFocus
              startIcon={<EditIcon />}
              variant="contained"
              color={'secondary'}
              target="_blank"
              href={`${CONTENT_EDITOR}${contentPath}`}
            >
              <Typography>Edit CF</Typography>
            </Button>
          )) || (
            <Button
              autoFocus
              startIcon={<InfoIcon />}
              variant="contained"
              color={'secondary'}
              target="_blank"
              href={`${ASSET_EDITOR}${escapeUrl(contentPath)}`}
            >
              <Typography>Edit Asset Properties</Typography>
            </Button>
          ))}
        <Button
          autoFocus
          startIcon={<EngineeringIcon />}
          variant="contained"
          color={'secondary'}
          target="_blank"
          href={`${CRX_DE_PATH}${escapeColon(path)}`}
        >
          <Typography>Open in CRX/DE</Typography>
        </Button>
      </DialogActions>
    );
  };

  return (
    <Dialog
      id="result-explorer-dialog"
      open={open}
      onClose={closeHandler}
      aria-labelledby="result-explorer-dialog-title"
    >
      <Tooltip title="Close Dialog">
        <IconButton
          className={'result-explorer-dialog-close'}
          onClick={closeHandler}
          sx={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
          }}
        >
          <CloseIcon />
        </IconButton>
      </Tooltip>
      <DialogTitle id="result-explorer-dialog-title">Result Explorer [{path}]</DialogTitle>
      <DialogContent>
        <ResultExplorer path={path} />
      </DialogContent>
      <ResultDialogActions />
    </Dialog>
  );
};
