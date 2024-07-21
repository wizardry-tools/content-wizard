import { Dialog, DialogContent, DialogTitle, IconButton, ThemeProvider, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ResultsExporter } from './ResultsExporter';
import { useTheme } from '@mui/material/styles';

import './ResultsExporter.scss';

export type ResultsExporterDialogProps = {
  closeHandler: () => void;
  open: boolean;
};

/**
 * This Component represents the Dialog that appears when Exporting Results.
 * This Component will contain the UI Elements scoped to the Dialog,
 * such as background, container, and close buttons.
 * It will contain the ResultsExporter, which has further UI elements.
 * @param props
 * @constructor
 */
export const ResultsExporterDialog = (props: ResultsExporterDialogProps) => {
  const { closeHandler, open } = props;
  const theme = useTheme();

  return (
    <ThemeProvider theme={theme}>
      <Dialog
        id="results-exporter-dialog"
        open={open}
        onClose={closeHandler}
        aria-labelledby="results-exporter-dialog-title"
      >
        <Tooltip title="Close Dialog">
          <IconButton
            className={'results-exporter-dialog-close'}
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
        <DialogTitle id="results-exporter-dialog-title">Export Results</DialogTitle>
        <DialogContent>
          <ResultsExporter />
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
};
