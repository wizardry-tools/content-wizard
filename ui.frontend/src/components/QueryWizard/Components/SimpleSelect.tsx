import { FormGrid } from './FormGrid';
import { InputLabel, Select, MenuItem, FormControl, Paper } from '@mui/material';
import { memo, useCallback, useState } from 'react';
import { FieldConfig, InputValue } from './fields';
import { SimpleInputProps } from './SimpleInput';

export const SimpleSelect = memo(({ onChange, field }: SimpleInputProps) => {
  const { name, label, value, required, options } = { ...field };
  const [focused, setFocused] = useState(false);

  const handleChange = (e: { target: { value: InputValue } }) => {
    const updatedField: FieldConfig = {
      ...field,
      value: e.target.value,
    };
    onChange(updatedField);
  };

  const onFocus = useCallback(() => {
    setFocused((prevState) => !prevState);
  }, []);

  const memoizedHandleChange = useCallback(handleChange, [onChange, field]);

  const menuItems = () => {
    const items = [];
    if (options) {
      for (const key in options) {
        if (options.hasOwnProperty(key)) {
          const option = options[key as keyof typeof options];
          items.push(
            <MenuItem key={key} value={key}>
              {option}
            </MenuItem>,
          );
        }
      }
    }
    return items;
  };

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
            onChange={memoizedHandleChange}
            className="query-builder-field"
            onFocus={onFocus}
            onBlur={onFocus}
            required={required}
          >
            {menuItems()}
          </Select>
        </Paper>
      </FormControl>
    </FormGrid>
  );
});
