import { Dialog, DialogContent, DialogTitle, IconButton, ThemeProvider, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ResultsExporter } from './ResultsExporter';
import { useTheme } from '@mui/material/styles';

import './ResultsExporter.scss';

export type ResultsExporterModalProps = {
  closeHandler: () => void;
  open: boolean;
};

/**
 * This Component represents the Modal that appears when Exporting Results.
 * This Component will contain the UI Elements scoped to the Modal,
 * such as background, container, and close buttons.
 * It will contain the ResultsExporter, which has further UI elements.
 * @param props
 * @constructor
 */
export const ResultsExporterModal = (props: ResultsExporterModalProps) => {
  const { closeHandler, open } = props;
  const theme = useTheme();

  return (
    <ThemeProvider theme={theme}>
      <Dialog
        id="results-exporter-modal"
        open={open}
        onClose={closeHandler}
        aria-labelledby="results-exporter-modal-title"
      >
        <Tooltip title="Close Modal">
          <IconButton
            className={'results-exporter-modal-close'}
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
        <DialogTitle id="results-exporter-modal-title">Results Exporter</DialogTitle>
        <DialogContent>
          <ResultsExporter />
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
};
