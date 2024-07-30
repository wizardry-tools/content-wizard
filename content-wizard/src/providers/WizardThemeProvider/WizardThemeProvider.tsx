import { PropsWithChildren, useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { Theme } from '@/types';
import { useRenderCount } from '@/utility';
import { useStorageContext } from '@/components/IDE/core/src';
import { useLogger } from '../LoggingProvider';
import {
  buildMuiTheme,
  DARK,
  getStoredTheme,
  getSystemTheme,
  getThemeMediaQuery,
  IDEThemeContext,
  LIGHT,
  STORAGE_KEY,
  ThemeDispatcherContext,
} from './context';

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
          <ThemeDispatcherContext.Provider value={handleThemeDispatch}>
            <CssBaseline />
            {props.children}
          </ThemeDispatcherContext.Provider>
        </MuiThemeProvider>
      </IDEThemeContext.Provider>
    </>
  );
}
