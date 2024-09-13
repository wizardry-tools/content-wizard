import type { PropsWithChildren } from 'react';
import { useMemo } from 'react';
import type { LoggingProviderProps } from '@/types';
import { previewFetch } from '@/utility';
import { StorageContextProvider } from '@/components/IDE/core/src';
import { WizardAlertProvider } from '../WizardAlertProvider';
import { LoggingProvider } from '../LoggingProvider';

// Check if we are in Preview mode, and replace the native Fetch if we are.
if (import.meta.env.MODE === 'preview') {
  window.fetch = previewFetch;
}

export const AppProvider = ({ children }: PropsWithChildren) => {
  const getLoggingProps = useMemo((): LoggingProviderProps => {
    return import.meta.env.MODE !== 'production'
      ? { showLog: true, showDebug: true, showWarn: true, showError: true }
      : { showError: true };
  }, []);

  return (
    <LoggingProvider {...getLoggingProps}>
      <StorageContextProvider>
        <WizardAlertProvider>{children}</WizardAlertProvider>
      </StorageContextProvider>
    </LoggingProvider>
  );
};
