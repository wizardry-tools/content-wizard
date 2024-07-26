import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { FormGrid } from './FormGrid';
import { Paper, TextField } from '@mui/material';
import { Field, FieldConfig, InputValue } from './fields';
import { useFieldDispatcher, useLogger } from '@/providers';
import { useDebounce, useRenderCount } from '@/utility';

export type SimpleInputProps = {
  defaultValue: InputValue;
  field: FieldConfig;
  disabled: boolean;
};

export const SimpleInput = ({ field, defaultValue, disabled }: SimpleInputProps) => {
  const logger = useLogger();
  const renderCount = useRenderCount();
  logger.debug({ message: `SimpleInput[${renderCount}] render()` });
  const [value, setValue] = useState(defaultValue);
  const debouncedValue = useDebounce(value, 250);
  const { name, label, required } = Field(field);
  const fieldDispatcher = useFieldDispatcher();
  // this state adds an elevation effect to the fields when focused. More noticeable on light-mode.
  const [focused, setFocused] = useState(false);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  }, []);
  const handleFocus = useCallback(() => {
    setFocused(true);
  }, []);
  const handleBlur = useCallback(() => {
    setFocused(false);
  }, []);

  useEffect(() => {
    fieldDispatcher({
      name,
      value: debouncedValue,
      type: 'UPDATE_VALUE',
      caller: SimpleInput,
    });
  }, [fieldDispatcher, name, debouncedValue]);

  return (
    <FormGrid item key={name}>
      <Paper elevation={focused ? 4 : 1}>
        <TextField
          id={name}
          name={name}
          label={label}
          value={value}
          color="secondary"
          className="query-builder-field"
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          disabled={disabled}
          required={required}
        />
      </Paper>
    </FormGrid>
  );
};
