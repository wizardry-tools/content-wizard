import { Stack, Paper, Theme } from '@mui/material';
import { ViewsProps } from '@/components/ContentWizard/Views';
import { QueryHandler } from '@/components/Query';

import './QueryWizard.scss';
import { useLogger } from '@/providers';
import { Accordion, StatementWindow } from './Components';
import { useRenderCount } from '@/utility';

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
  const renderCount = useRenderCount();
  logger.debug({ message: `QueryWizard[${renderCount}] render()` });

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
