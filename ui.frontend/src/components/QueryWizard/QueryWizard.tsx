import { Stack, Paper, Theme } from '@mui/material';
import { useRef } from 'react';
import { ViewsProps } from 'src/components/ContentWizard/Views';
import { QueryHandler } from 'src/components/Query';

import './QueryWizard.scss';
import { useLogger } from 'src/providers';
import { Accordion, StatementWindow } from './Components';

const buttonStackStyles = (_theme: Theme) => {
  return {
    display: 'block',
    overflowX: 'visible',
    width: 0,
  };
};

export type QueryWizardProps = Pick<ViewsProps, 'onTabPanelSelect'>;

export function QueryWizard({ onTabPanelSelect }: QueryWizardProps) {
  const logger = useLogger();
  const renderCount = useRef(0);
  logger.debug({ message: `QueryWizard[${++renderCount.current}] render()` });

  return (
    <Paper className="wizard-builder">
      <Stack className="main-stack" direction="row" useFlexGap>
        <Stack
          className="statement-stack"
          sx={(theme) => ({
            maxWidth: '100%',
            [theme.breakpoints.up('md')]: {
              maxWidth: '50%',
            },
          })}
        >
          <StatementWindow />
        </Stack>
        <Stack className="accordion-stack">
          <Accordion />
        </Stack>
        <Stack className="query-button-stack" sx={buttonStackStyles} justifyContent="flex-start">
          <QueryHandler onResults={onTabPanelSelect} />
        </Stack>
      </Stack>
    </Paper>
  );
}
