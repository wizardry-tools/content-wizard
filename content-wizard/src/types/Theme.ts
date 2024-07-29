import { PaletteMode } from '@mui/material';
import { CSSProperties } from 'react';

/**
 * The value `null` semantically means that the user does not explicitly choose
 * any theme, so we use the system default.
 */
export type IDETheme = 'light' | 'dark' | null;

/**
 * The value `null` semantically means that the user does not explicitly choose
 * any theme, so we use the system default.
 */
export type Theme = PaletteMode | null;

export type UsePaperThemeProps = {
  elevation?: number;
  styles?: CSSProperties;
};

export type NullablePaletteMode = PaletteMode | null;
