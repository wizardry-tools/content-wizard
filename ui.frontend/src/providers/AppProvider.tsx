import { StorageContextProvider } from 'src/components/IDE/core/src';
import { PropsWithChildren } from 'react';
import { WizardAlertProvider } from './WizardAlertProvider';

export function AppProvider(props: PropsWithChildren) {
  return (
    <StorageContextProvider>
      <WizardAlertProvider>{props.children}</WizardAlertProvider>
    </StorageContextProvider>
  );
}
