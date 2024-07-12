import { memo, useRef } from 'react';
import { Paper, Stack } from '@mui/material';
import { Tooltip, WizardStatementEditor } from 'src/components/IDE/core/src';
import { useLogger } from 'src/providers';

export const StatementWindow = memo(() => {
  const logger = useLogger();
  const renderCount = useRef(0);
  logger.debug({ message: `StatementWindow[${++renderCount.current}] render()` });

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
