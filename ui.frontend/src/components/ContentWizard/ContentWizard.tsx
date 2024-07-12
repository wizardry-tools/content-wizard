import { ContentWizardProvider, IDEProvider, useLogger } from 'src/providers';
import { Box } from '@mui/material';
import { GlobalNav } from '../GlobalNav';
import { useRef, useState } from 'react';
import { Bar, Views } from './index';
import './ContentWizard.scss';

export function ContentWizard() {
  const renderCount = useRef(0);
  const logger = useLogger();
  logger.debug({ message: `ContentWizard[${++renderCount.current}] render()` });
  return (
    <ContentWizardProvider>
      <ContentWizardInterface />
    </ContentWizardProvider>
  );
}

function ContentWizardInterface() {
  const renderCount = useRef(0);
  const logger = useLogger();
  logger.debug({ message: `ContentWizardInterface[${++renderCount.current}] render()` });

  const [tabValue, setTabValue] = useState(0);
  const onTabSelect = (_event: any, value: any) => {
    setTabValue(value);
  };
  const onTabPanelSelect = (index: number) => {
    setTabValue(index);
  };

  /*
    IDEProvider can't be included in the ContentWizardProvider, since ContentWizardProvider contains the
    initialization of other Providers that IDEProvider relies on.
   */
  return (
    <IDEProvider>
      <Box className="content-wizard-main">
        <GlobalNav pageTitle="Content Wizard" />
        <Box className="content-wizard-content-wrapper">
          <Bar tabValue={tabValue} onTabSelect={onTabSelect} />
          <Views tabValue={tabValue} onTabPanelSelect={onTabPanelSelect} />
        </Box>
      </Box>
    </IDEProvider>
  );
}
