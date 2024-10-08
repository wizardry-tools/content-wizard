import { alpha } from '@mui/system/colorManipulator';
import { getOverlayAlpha } from '@mui/material';
import type { Theme } from '@mui/material';
import type { UsePaperThemeProps } from '@/types';

export const usePaperTheme = (props?: UsePaperThemeProps) => {
  const { elevation = 1, styles = {} } = props ?? {};

  return (theme: Theme) => ({
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    transition: theme.transitions.create('box-shadow'),
    '--Paper-shadow': theme.shadows[elevation],
    '--Paper-overlay': `linear-gradient(${alpha(
      '#fff',
      Number(getOverlayAlpha(elevation)),
    )}, ${alpha('#fff', Number(getOverlayAlpha(elevation)))})`,
    boxShadow: 'var(--Paper-shadow)',
    backgroundImage: 'var(--Paper-overlay)',
    ...styles,
  });
};
