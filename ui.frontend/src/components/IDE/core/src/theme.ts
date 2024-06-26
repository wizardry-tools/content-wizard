import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { useStorageContext } from './storage';
import {StorageAPI} from "@graphiql/toolkit";

/**
 * The value `null` semantically means that the user does not explicitly choose
 * any theme, so we use the system default.
 */
export type Theme = 'light' | 'dark' | null;

function getStoredTheme (storageContext: StorageAPI | null): Theme {
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

/**
 * This is the Theme Provider for the IDE, but it is also being used to
 * drive the Theme for the rest of the APP.
 */
export function useTheme() {
  const storageContext = useStorageContext();

  const storedTheme = useMemo(()=>getStoredTheme(storageContext),[storageContext])

  const [theme, setThemeInternal] = useState<Theme>(storedTheme);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    document.body.classList.remove('wizard-light', 'wizard-dark');
    if (theme) {
      document.body.classList.add(`wizard-${theme}`);
    }
  }, [theme]);

  const setTheme = useCallback(
    (newTheme: Theme) => {
      storageContext?.set(STORAGE_KEY, newTheme || '');
      setThemeInternal(newTheme);
    },
    [storageContext],
  );

  return useMemo(() => ({ theme, setTheme }), [theme, setTheme]);
}

const STORAGE_KEY = 'theme';
