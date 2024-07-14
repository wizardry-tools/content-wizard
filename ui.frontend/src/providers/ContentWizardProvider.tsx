import { PropsWithChildren, useRef } from 'react';
import { WizardThemeProvider } from './WizardThemeProvider';
import { QueryProvider } from './QueryProvider';
import { ResultsProvider } from './ResultsProvider';
import { FetcherProvider } from './FetcherProvider';
import { FieldsProvider } from './FieldsProvider';
import { useLogger } from './LoggingProvider';

export function ContentWizardProvider({ children }: PropsWithChildren) {
  const logger = useLogger();
  const renderCount = useRef(0);
  logger.debug({ message: `ContentWizardProvider[${++renderCount.current}] render()` });
  return (
    <WizardThemeProvider>
      <ResultsProvider>
        <QueryProvider>
          <FieldsProvider>
            <FetcherProvider>{children}</FetcherProvider>
          </FieldsProvider>
        </QueryProvider>
      </ResultsProvider>
    </WizardThemeProvider>
  );
}
