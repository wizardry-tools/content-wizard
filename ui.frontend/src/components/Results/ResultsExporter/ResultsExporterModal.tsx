import { Dialog, DialogContent, DialogTitle, Fab, Theme, ThemeProvider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ResultsExporter } from './ResultsExporter';
import { useTheme } from '@mui/material/styles';

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
          className={'results-exporter-modal-close'}
          onClick={closeHandler}
        >
          <CloseIcon />
        </Fab>
        <DialogTitle id="results-exporter-modal-title">Results Exporter</DialogTitle>
        <DialogContent>
          <ResultsExporter />
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
};
