import { memo } from 'react';
import { Paper, Stack } from '@mui/material';
import { Tooltip, WizardStatementEditor } from '@/components/IDE/core/src';
import { useLogger } from '@/providers';
import { useRenderCount } from '@/utility';

export const StatementWindow = memo(() => {
  const logger = useLogger();
  const renderCount = useRenderCount();
  logger.debug({ message: `StatementWindow[${renderCount}] render()` });

  return (
    <Paper elevation={3} className="statement-paper">
      <Tooltip.Provider>
        <Stack className="wizard-editor-stack" direction="row" spacing={1}>
          <WizardStatementEditor editorTheme="wizard" keyMap="sublime" className="querybuilder-statement" />
        </Stack>
      </Tooltip.Provider>
    </Paper>
  );
});
