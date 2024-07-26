import { PaletteMode } from '@mui/material';

/**
 * The value `null` semantically means that the user does not explicitly choose
 * any theme, so we use the system default.
 */
export type Theme = PaletteMode | null;
