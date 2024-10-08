/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />
import '@mui/material/styles';

declare module '@mui/material/styles' {
  type Palette = {
    tertiary: Palette['primary'];
  };

  type PaletteOptions = {
    tertiary?: PaletteOptions['primary'];
  };
}
