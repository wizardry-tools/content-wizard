import { Dialog, DialogContent, DialogTitle, IconButton, ThemeProvider, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import type { PackageBuilderDialogProps } from '@/types';
import { PackageBuilder } from './PackageBuilder';

/**
 * This Component represents the {@link Dialog} that appears when Packaging Results.
 * This Component will contain the UI Elements scoped to the {@link Dialog},
 * such as background, container, and close buttons.
 * It will contain the {@link PackageBuilder}, which has further UI elements.
 * @param props
 * @constructor
 */
export const PackageBuilderDialog = (props: PackageBuilderDialogProps) => {
  const { closeHandler, open } = props;
  const theme = useTheme();

  return (
    <ThemeProvider theme={theme}>
      <Dialog
        id="package-builder-dialog"
        open={open}
        onClose={closeHandler}
        aria-labelledby="package-builder-dialog-title"
      >
        <Tooltip title="Close Dialog">
          <IconButton
            className={'package-builder-dialog-close'}
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
        <DialogTitle id="package-builder-dialog-title">Build a Content Package</DialogTitle>
        <DialogContent id="package-builder-dialog-content">
          <PackageBuilder />
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
};
