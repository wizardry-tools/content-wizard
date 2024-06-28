import { Dialog, DialogContent, DialogTitle, IconButton, ThemeProvider, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import type { ResultsExporterDialogProps } from '@/types';
import { ResultsExporter } from './ResultsExporter';

/**
 * This Component represents the {@link Dialog} that appears when Exporting Results.
 * This Component will contain the UI Elements scoped to the {@link Dialog},
 * such as background, container, and close buttons.
 * It will contain the {@link ResultsExporter}, which has further UI elements.
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
