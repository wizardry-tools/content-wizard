import { createContext, useContext } from 'react';
import type { Dispatch } from 'react';
import type { PaletteMode } from '@mui/material';
import type { Theme as MuiTheme } from '@mui/material/styles/createTheme';
import { createTheme } from '@mui/material/styles';
import { blue } from '@mui/material/colors';
import type { NullablePaletteMode, Theme, WizardStorageAPI } from '@/types';

export const DARK: PaletteMode = 'dark';
export const LIGHT: PaletteMode = 'light';

export const ThemeDispatcherContext = createContext<Dispatch<NullablePaletteMode>>(null!);
export const IDEThemeContext = createContext<Theme>(null);

export const getThemeMediaQuery = (mode: PaletteMode = DARK): MediaQueryList => {
  return window.matchMedia(`(prefers-color-scheme: ${mode})`);
};
export const isMediaQueryMatch = (mq: MediaQueryList, mode: PaletteMode): Theme => {
  return mq.matches ? mode : null;
};
export const getSystemTheme = (mode: PaletteMode = DARK): Theme => {
  return isMediaQueryMatch(getThemeMediaQuery(mode), mode);
};

export const buildMuiTheme = (theme: Theme): MuiTheme => {
  // main theme setup
  const muiTheme = createTheme({
    palette: {
      mode: theme ?? LIGHT, // light is our default for Mui
      ...(theme === DARK
        ? {
            primary: {
              main: '#F0F0F0',
            },
            secondary: {
              main: blue[500],
            },
          }
        : {
            primary: {
              main: '#E0E0E0',
            },
            secondary: {
              main: blue[700],
            },
          }),
    },
    shape: {
      borderRadius: 8,
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 557,
        md: 967,
        lg: 1400,
        xl: 1536,
      },
    },
    typography: {
      h4: {
        fontSize: '2.125rem',
        '@media (max-width: 1400px)': {
          fontSize: '1.5rem',
        },
        '@media (max-width: 967px)': {
          fontSize: '1.2rem',
        },
        '@media (max-width: 557px)': {
          fontSize: '0.8rem',
        },
      },
    },
  });

  // augmented color setup
  return createTheme(muiTheme, {
    palette: {
      tertiary: muiTheme.palette.augmentColor({
        color: {
          main: '#FF5794',
        },
        name: 'tertiary',
      }),
    },
  });
};

export const STORAGE_KEY = 'theme';
export const getStoredTheme = (storageContext: WizardStorageAPI | null): Theme => {
  if (!storageContext) {
    return null;
  }
  const stored = storageContext.get(STORAGE_KEY);
  switch (stored) {
    case 'light':
      return 'light';
    case 'dark':
      return 'dark';
    default:
      if (typeof stored === 'string') {
        // Remove the invalid stored value
        storageContext.set(STORAGE_KEY, '');
      }
      return null;
  }
};

export const useThemeDispatch = () => {
  return useContext(ThemeDispatcherContext);
};
export const useIDETheme = () => {
  return useContext(IDEThemeContext);
};
