import type { PropsWithChildren } from 'react';
import { useMemo } from 'react';
import type { LoggingProviderProps } from '@/types';
import { StorageContextProvider } from '@/components/IDE/core/src';
import { WizardAlertProvider } from '../WizardAlertProvider';
import { LoggingProvider } from '../LoggingProvider';

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
