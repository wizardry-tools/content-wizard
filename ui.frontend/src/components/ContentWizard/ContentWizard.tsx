import { useState } from 'react';
import type { SyntheticEvent } from 'react';
import { ContentWizardProvider, IDEProvider, useLogger } from '@/providers';
import { Box } from '@mui/material';
import { useRenderCount } from '@/utility';
import { GlobalNav } from './GlobalNav';
import { Bar } from './Bar';
import { Views } from './Views';
import './ContentWizard.scss';

/**
 * This is the Wrapper component for the {@link ContentWizardInterface}. It contains the initialization
 * of the {@link ContentWizardProvider}.
 * @constructor
 */
export function ContentWizard() {
  const renderCount = useRenderCount();
  const logger = useLogger();
  logger.debug({ message: `ContentWizard[${renderCount}] render()` });
  return (
    <ContentWizardProvider>
      <ContentWizardInterface />
    </ContentWizardProvider>
  );
}

/**
 * This is the nested child of ContentWizard. It contains the logic controllers for the {@link ViewPanel} selection
 * and the initialization of the {@link IDEProvider}.
 * @constructor
 */
function ContentWizardInterface() {
  const renderCount = useRenderCount();
  const logger = useLogger();
  logger.debug({ message: `ContentWizardInterface[${renderCount}] render()` });

  const [selectedView, setView] = useState(0);
  const onViewSelect = (_event: SyntheticEvent, value: number) => {
    setView(value);
  };
  const onViewPanelSelect = (index: number) => {
    setView(index);
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
          <Bar selectedView={selectedView} onViewSelect={onViewSelect} />
          <Views selectedView={selectedView} onViewPanelSelect={onViewPanelSelect} />
        </Box>
      </Box>
    </IDEProvider>
  );
}
