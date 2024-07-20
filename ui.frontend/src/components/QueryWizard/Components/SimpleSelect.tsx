import { FormGrid } from './FormGrid';
import { InputLabel, Select, MenuItem, FormControl, Paper } from '@mui/material';
import { useCallback, useMemo, useRef, useState } from 'react';
import { InputValue } from './fields';
import { SimpleInputProps } from './SimpleInput';
import { useFieldDispatcher, useLogger } from 'src/providers';

export const SimpleSelect = ({ field, disabled }: SimpleInputProps) => {
  const logger = useLogger();
  const renderCount = useRef(0);
  logger.debug({ message: `SimpleSelect[${++renderCount.current}] render()` });
  const { name, label, required, options } = field;
  const [value, setValue] = useState(field.value);
  // this state adds an elevation effect to the fields when focused. More noticeable on light-mode.
  const [focused, setFocused] = useState(false);
  const fieldDispatcher = useFieldDispatcher();

  const handleChange = useCallback(
    (e: { target: { value: InputValue } }) => {
      const newValue = e.target.value;
      setValue(newValue)
      fieldDispatcher({
        name: name,
        value: newValue,
        type: 'UPDATE_VALUE',
        caller: SimpleSelect,
      });
    },
    [fieldDispatcher, name],
  );

  const menuItems = useMemo(() => {
    return Object.entries(options || []).map((entry) => {
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
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            required={required}
            disabled={disabled}
          >
            {menuItems}
          </Select>
        </Paper>
      </FormControl>
    </FormGrid>
  );
};
