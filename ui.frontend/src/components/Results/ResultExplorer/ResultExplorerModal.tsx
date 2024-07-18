import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Fab, Theme, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';
import EngineeringIcon from '@mui/icons-material/Engineering';
import { ResultExplorer } from './ResultExplorer';
import { useFetcher } from './fetcher';
import { useEffect, useMemo, useRef, useState } from 'react';
import { escapeColon, escapeUrl } from 'src/utility';

type ResultExplorerModalProps = {
  open: boolean;
  path: string;
  closeHandler: () => void;
};

export const DAM_PATH = '/dam';
export const XF_PATH = '/experience-fragments';
export const CRX_DE_PATH = '/crx/de/index.jsp#';
export const CONTENT_NODE = '/jcr:content';
export const CF_PROP = 'contentFragment';
export const ASSET_EDITOR = '/mnt/overlay/dam/gui/content/assets/metadataeditor.external.html?_charset_=utf-8&item=';
// used by Pages, XFs, and CFs
export const CONTENT_EDITOR = '/editor.html';
// used by Pages and XFs
export const PAGE_PROPERTIES_EDITOR = '/mnt/overlay/wcm/core/content/sites/properties.html?item=';

export const ResultExplorerModal = ({ open, closeHandler, path }: ResultExplorerModalProps) => {
  const fetching = useRef(false);
  const fetcher = useFetcher({ fetching });

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
    const resultHandler = (response: any) => {
      if (response.hasOwnProperty(CF_PROP)) {
        setIsCF(response[CF_PROP]);
      }
    };
    fetcher.loadData({
      path: `${contentPath}${CONTENT_NODE}/${CF_PROP}`,
      resultHandler,
      defaultResult: false,
      stringify: false,
    });
  }, [contentPath, fetcher, isAsset]);

  const ModalActions = () => {
    return (
      <DialogActions className={'result-explorer-modal-actions'}>
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
    <Dialog id="result-explorer-modal" open={open} onClose={closeHandler} aria-labelledby="result-explorer-modal-title">
      <Fab
        sx={(theme: Theme) => ({
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          backgroundColor: theme.palette.mode === 'light' ? theme.palette.primary.light : theme.palette.primary.dark,
          '&:hover': {
            backgroundColor:
              theme.palette.mode === 'light' ? theme.palette.secondary.light : theme.palette.secondary.dark,
          },
        })}
        size="small"
        className={'result-explorer-modal-close'}
        onClick={closeHandler}
      >
        <CloseIcon />
      </Fab>
      <DialogTitle id="result-explorer-modal-title">Result Explorer [{path}]</DialogTitle>
      <DialogContent>
        <ResultExplorer path={path} />
      </DialogContent>
      <ModalActions />
    </Dialog>
  );
};