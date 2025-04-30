import { Paper, List, ListItem, ListItemText } from '@mui/material';
import type { WizardInputProps } from '@/types';
import { useRenderCount } from '@/utility';
import { useLogger } from '@/providers';
import { FormGrid } from './FormGrid';
import { Fragment } from 'react';

export const WizardPredicateList = ({ disabled }: WizardInputProps) => {
  const logger = useLogger();
  const renderCount = useRenderCount();
  logger.debug({ message: `WizardInput[${renderCount}] render()` });

  return (
    <FormGrid item key={'test'} style={{ display: disabled ? 'none' : '' }}>
      <Paper elevation={1}>
        <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
          <ListItem alignItems="flex-start">
            <ListItemText
              primary="Test List Item Primary Text"
              secondary={<Fragment>{'Test List Item Secondary Text'}</Fragment>}
            />
          </ListItem>
        </List>
      </Paper>
    </FormGrid>
  );
};
