import { Paper, List, ListItem, ListItemText } from '@mui/material';
import type { WizardInputProps } from '@/types';
import { useRenderCount } from '@/utility';
import { useLogger } from '@/providers';
import { FormGrid } from './FormGrid';
import { Fragment, ReactElement, useState } from 'react';

export const WizardPredicateList = ({ disabled }: WizardInputProps) => {
  const logger = useLogger();
  const renderCount = useRenderCount();
  const [testListItems, setTestListItems] = useState([] as ReactElement[]);
  logger.debug({ message: `WizardInput[${renderCount}] render()` });
  // TODO: need to track Predicate List Items
  // TODO: need to add Buttons for adding or removing Predicate List Items
  
  const testListItem = (index: number) => (
    <ListItem alignItems="flex-start" key={index}>
      <ListItemText
        primary={`Custom Predicate ${index}`}
        secondary={<Fragment>{`Custom Predicate ${index} Sub Text`}</Fragment>}
      />
    </ListItem>
  );

  const handleClick = () => {
    logger.debug({ message: "clicked" });
    setTestListItems((prevState) => {
      const newIndex = prevState.length + 1;
      return [...prevState, testListItem(newIndex)];
    });
  };

  return (
    <FormGrid item key={'test'} style={{ display: disabled ? 'none' : '' }}>
      <Paper elevation={1}>
        <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
            {testListItems}
            <ListItem button onClick={handleClick}>
              <ListItemText primary={"add item"}  />
            </ListItem>
        </List>
        
      </Paper>
    </FormGrid>
  );
};
