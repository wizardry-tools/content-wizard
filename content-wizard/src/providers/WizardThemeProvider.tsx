import {
  createContext,
  Dispatch,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { PaletteMode, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { Theme as MuiTheme } from '@mui/material/styles/createTheme';
import { createTheme } from '@mui/material/styles';
import { blue } from '@mui/material/colors';
import CssBaseline from '@mui/material/CssBaseline';
import { useRenderCount } from '@/utility';
import { NullablePaletteMode, Theme } from '@/types';
import { useStorageContext } from '@/components/IDE/core/src';
import { WizardStorageAPI } from '@/components/IDE/core/src/storage-api';
import { useLogger } from './LoggingProvider';

export const DARK: PaletteMode = 'dark';
export const LIGHT: PaletteMode = 'light';

function getThemeMediaQuery(mode: PaletteMode = DARK): MediaQueryList {
  return window.matchMedia(`(prefers-color-scheme: ${mode})`);
}
function isMediaQueryMatch(mq: MediaQueryList, mode: PaletteMode): Theme {
  return mq.matches ? mode : null;
}
function getSystemTheme(mode: PaletteMode = DARK): Theme {
  return isMediaQueryMatch(getThemeMediaQuery(mode), mode);
}

function buildMuiTheme(theme: Theme): MuiTheme {
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
}

const ThemeDispatchContext = createContext<Dispatch<NullablePaletteMode>>(null!);
const IDEThemeContext = createContext<Theme>(null);

export function WizardThemeProvider(props: PropsWithChildren) {
  const logger = useLogger();
  const renderCount = useRenderCount();
  logger.debug({ message: `WizardThemeProvider[${renderCount}] render()` });
  /**
   * Load the Storage Context first
   */
  const storageContext = useStorageContext();

  /**
   * Read the stored Theme if it exists.
   */
  const storedTheme: Theme = useMemo(() => getStoredTheme(storageContext), [storageContext]);

  // theme determination: IDE -> System -> Default
  /**
   * System/Browser determined theme.
   * null assumes light or System default
   * non-null assumes dark System
   */
  const systemTheme = useMemo(() => getSystemTheme(), []);

  /**
   * IDE Theme, init with null, which implies system theme deferral.
   * This is used to override the Mui Theme
   */
  const [IDETheme, setIDETheme] = useState(storedTheme ?? systemTheme);

  /**
   * Mui Theme defaults to the system theme, since that's also the default behavior for IDE Theme.
   * IDE will dispatch non-system values.
   */
  const [muiTheme, setMuiTheme] = useState(buildMuiTheme(storedTheme ?? systemTheme));

  /**
   * if the system/browser changes its theme settings, this will update.
   * We only need to listen to the dark MediaQuery, since the system defaults
   * to light, we don't need to listen for when light is enabled, only when
   * dark is enabled/disabled.
   */
  const darkMqListener = useCallback(
    (event: MediaQueryListEvent) => {
      // system theme or browser theme updated;
      if (!IDETheme) {
        // no IDE Theme, which means we need to inherit from System
        if (event.matches) {
          // System is dark
          setMuiTheme(buildMuiTheme(DARK));
          return;
        }
        // System is light or default(which is light)
        setMuiTheme(buildMuiTheme(LIGHT));
        return;
      }
      // IDE is set
      setMuiTheme(buildMuiTheme(IDETheme));
    },
    [IDETheme],
  );

  /**
   * UseEffect that manages the Dark System Theme Media Query Listener
   */
  useEffect(() => {
    const darkMq = getThemeMediaQuery(DARK);

    darkMq.addEventListener('change', darkMqListener);

    return () => {
      darkMq.removeEventListener('change', darkMqListener);
    };
  }, [darkMqListener]);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    document.body.classList.remove('wizard-light', 'wizard-dark');
    if (IDETheme) {
      document.body.classList.add(`wizard-${IDETheme}`);
    }
  }, [IDETheme]);

  /**
   * This updates the controlled Themes based on the IDE
   * TODO: This only fires when the IDE has been rendered, which doesn't happen until the user goes to the IDE Tab
   */
  const handleThemeDispatch = useCallback(
    (theme: Theme) => {
      storageContext?.set(STORAGE_KEY, theme ?? '');
      setIDETheme(theme);
      // if the IDE theme is set to System Default (null), then this will reset Mui back to system Theme.
      setMuiTheme(buildMuiTheme(theme ?? systemTheme));
    },
    [storageContext, systemTheme],
  );

  return (
    <>
      <IDEThemeContext.Provider value={IDETheme}>
        <MuiThemeProvider theme={muiTheme}>
          <ThemeDispatchContext.Provider value={handleThemeDispatch}>
            <CssBaseline />
            {props.children}
          </ThemeDispatchContext.Provider>
        </MuiThemeProvider>
      </IDEThemeContext.Provider>
    </>
  );
}

export function useThemeDispatch() {
  return useContext(ThemeDispatchContext);
}
export function useIDETheme() {
  return useContext(IDEThemeContext);
}

export const STORAGE_KEY = 'theme';
function getStoredTheme(storageContext: WizardStorageAPI | null): Theme {
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
}
