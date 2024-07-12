import { StorageContextProvider } from 'src/components/IDE/core/src';
import {PropsWithChildren, useMemo} from 'react';
import { WizardAlertProvider } from './WizardAlertProvider';
import { LoggingProvider, LoggingProviderProps } from './LoggingProvider';



export function AppProvider({ children }: PropsWithChildren) {

  const getLoggingProps = useMemo((): LoggingProviderProps => {
    return process.env.NODE_ENV !== 'production'
      ? { showLog: true, showDebug: true, showWarn: true, showError: true}
      : { showError: true};
  },[]);

  return (
    <LoggingProvider {...getLoggingProps}>
      <StorageContextProvider>
        <WizardAlertProvider>{children}</WizardAlertProvider>
      </StorageContextProvider>
    </LoggingProvider>
  );
}
