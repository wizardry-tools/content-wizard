import { useCallback, useEffect, useState } from 'react';
import { Box, IconButton, List, ListItem, Paper, TextField, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import type { CustomPredicate, WizardInputProps } from '@/types';
import { useRenderCount } from '@/utility';
import { useFieldDispatcher, useLogger } from '@/providers';
import { Field } from './fields';
import { FormGrid } from './FormGrid';

const emptyPredicate = (): CustomPredicate => ({ property: '', value: '' });

export const WizardPredicateList = ({ field, defaultValue, disabled }: WizardInputProps) => {
  const logger = useLogger();
  const renderCount = useRenderCount();
  logger.debug({ message: `WizardPredicateList[${renderCount}] render()` });

  const { name } = Field(field);
  const fieldDispatcher = useFieldDispatcher();
  const [items, setItems] = useState<CustomPredicate[]>(
    Array.isArray(defaultValue) ? (defaultValue as CustomPredicate[]) : [],
  );

  useEffect(() => {
    fieldDispatcher({ name, value: items, type: 'UPDATE_VALUE' });
  }, [fieldDispatcher, name, items]);

  const handleAdd = useCallback(() => {
    setItems((prev) => [...prev, emptyPredicate()]);
  }, []);

  const handleRemove = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleChange = useCallback((index: number, key: keyof CustomPredicate, val: string) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [key]: val } : item)));
  }, []);

  return (
    <FormGrid item key={name} style={{ display: disabled ? 'none' : '' }}>
      <Paper elevation={1} sx={{ width: '100%' }}>
        <List disablePadding>
          {items.map((item, index) => (
            <ListItem
              key={index}
              disableGutters
              sx={{ gap: 1, px: 1, py: 0.5, flexWrap: 'wrap', alignItems: 'flex-start' }}
            >
              <TextField
                size="small"
                label="Property"
                placeholder="jcr:content/myProperty"
                value={item.property}
                onChange={(e) => handleChange(index, 'property', e.target.value)}
                sx={{ flex: '1 1 180px' }}
                color="secondary"
              />
              <TextField
                size="small"
                label="Value"
                value={item.value}
                onChange={(e) => handleChange(index, 'value', e.target.value)}
                sx={{ flex: '1 1 180px' }}
                color="secondary"
              />
              <Tooltip title="Remove predicate">
                <Box display="flex" alignItems="center">
                  <IconButton size="small" onClick={() => handleRemove(index)} aria-label="remove predicate">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Tooltip>
            </ListItem>
          ))}
          <ListItem disableGutters sx={{ px: 1, py: 0.5 }}>
            <Tooltip title="Add custom predicate">
              <IconButton size="small" onClick={handleAdd} color="secondary" aria-label="add predicate">
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </ListItem>
        </List>
      </Paper>
    </FormGrid>
  );
};
