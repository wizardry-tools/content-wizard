import { useCallback, useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Paper, TextField } from '@mui/material';
import type { WizardInputProps } from '@/types';
import { useDebounce, useRenderCount } from '@/utility';
import { useFieldDispatcher, useLogger } from '@/providers';
import { Field } from './fields';
import { FormGrid } from './FormGrid';

export const WizardInput = ({ field, defaultValue, disabled }: WizardInputProps) => {
  const logger = useLogger();
  const renderCount = useRenderCount();
  logger.debug({ message: `WizardInput[${renderCount}] render()` });
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
