// ContentWizard, copyright (c) by Darrin Johnson and others
// Distributed under an MIT license: https://xxxxxxxxxx.net/5/LICENSE
// TODO: Setup MIT License before putting on github.
import QueryWizard from '../QueryWizard/QueryWizard';

import {ContentWizardProvider} from "../QueryWizard/providers/ContentWizardProvider";
import {WizardThemeProvider} from "../QueryWizard/providers/WizardThemeProvider";
import {Box} from "@mui/material";

export default function ContentWizard() {

  return(
    <ContentWizardProvider>
      <WizardThemeProvider>
        <Box className="content-wizard-main">
          <QueryWizard/>
        </Box>
      </WizardThemeProvider>
    </ContentWizardProvider>
  );
}

