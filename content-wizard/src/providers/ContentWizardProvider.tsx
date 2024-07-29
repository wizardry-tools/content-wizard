import { PropsWithChildren } from 'react';
import { WizardThemeProvider } from './WizardThemeProvider';
import { QueryProvider } from './QueryProvider';
import { ResultsProvider } from './ResultsProvider';
import { FetcherProvider } from './FetcherProvider';
import { FieldsProvider } from './FieldsProvider';
import { useLogger } from './LoggingProvider';
import { useRenderCount } from '@/utility';

export function ContentWizardProvider({ children }: PropsWithChildren) {
  const logger = useLogger();
  const renderCount = useRenderCount();
  logger.debug({ message: `ContentWizardProvider[${renderCount}] render()` });
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
