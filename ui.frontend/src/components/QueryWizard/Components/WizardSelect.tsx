import { useCallback, useMemo, useState } from 'react';
import { InputLabel, Select, MenuItem, FormControl, Paper } from '@mui/material';
import type { InputValue, WizardInputProps } from '@/types';
import { useFieldDispatcher, useLogger } from '@/providers';
import { useRenderCount } from '@/utility';
import { FormGrid } from './FormGrid';

export const WizardSelect = ({ field, disabled }: WizardInputProps) => {
  const logger = useLogger();
  const renderCount = useRenderCount();
  logger.debug({ message: `WizardSelect[${renderCount}] render()` });
  const { name, label, required, options } = field;
  const [value, setValue] = useState(field.value);
  // this state adds an elevation effect to the fields when focused. More noticeable on light-mode.
  const [focused, setFocused] = useState(false);
  const fieldDispatcher = useFieldDispatcher();

  const handleChange = useCallback(
    (e: { target: { value: InputValue } }) => {
      const newValue = e.target.value;
      setValue(newValue);
      fieldDispatcher({
        name: name,
        value: newValue,
        type: 'UPDATE_VALUE',
      });
    },
    [fieldDispatcher, name],
  );

  const menuItems = useMemo(() => {
    return Object.entries(options ?? []).map((entry) => {
      const [key, option] = entry;
      return (
        <MenuItem key={key} value={key}>
          {option}
        </MenuItem>
      );
    });
  }, [options]);

  return (
    <FormGrid item key={name}>
      <FormControl>
        <Paper elevation={focused ? 4 : 1}>
          <InputLabel id={name + '-label'} color="secondary" required={required}>
            {label}
          </InputLabel>
          <Select
            labelId={name + '-label'}
            id={name}
            name={name}
            value={value}
            label={label}
            color="secondary"
            onChange={handleChange}
            className="query-builder-field"
            onFocus={() => {
              setFocused(true);
            }}
            onBlur={() => {
              setFocused(false);
            }}
            required={required}
            disabled={disabled}
            style={{ display: disabled ? 'none' : '' }}
          >
            {menuItems}
          </Select>
        </Paper>
      </FormControl>
    </FormGrid>
  );
};
