import { Stack, Paper } from '@mui/material';
import type { QueryWizardProps } from '@/types';
import { useLogger } from '@/providers';
import { useRenderCount } from '@/utility';
import { Accordion, QueryHandler, StatementWindow } from './Components';
import './QueryWizard.scss';

const buttonStackStyles = () => {
  return {
    display: 'block',
    overflowX: 'visible',
    width: 0,
  };
};

export function QueryWizard({ onViewPanelSelect }: QueryWizardProps) {
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
          <QueryHandler onResults={onViewPanelSelect} />
        </Stack>
      </Stack>
    </Paper>
  );
}
