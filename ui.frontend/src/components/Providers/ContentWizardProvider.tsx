import {PropsWithChildren} from "react";
import {WizardThemeProvider} from "./WizardThemeProvider";
import {QueryProvider} from "./QueryProvider";
import {ResultsProvider} from "./ResultsProvider";

export function ContentWizardProvider({children}: PropsWithChildren) {

  return (
    <WizardThemeProvider>
      <QueryProvider>
        <ResultsProvider>
          {children}
        </ResultsProvider>
      </QueryProvider>
    </WizardThemeProvider>
  );
}