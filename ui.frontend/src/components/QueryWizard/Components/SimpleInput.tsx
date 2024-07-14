import { ChangeEvent, memo, useCallback, useEffect, useRef, useState } from 'react';
import { FormGrid } from './FormGrid';
import { Paper, TextField } from '@mui/material';
import { Field, FieldConfig, InputValue } from './fields';
import { useFieldDispatcher, useLogger } from 'src/providers';

export type SimpleInputProps = {
  defaultValue: InputValue;
  field: FieldConfig;
  disabled: boolean;
};

export const SimpleInput = memo(({ field, defaultValue, disabled }: SimpleInputProps) => {
  const logger = useLogger();
  const renderCount = useRef(0);
  logger.debug({ message: `SimpleInput[${++renderCount.current}] render()` });
  const [value, setValue] = useState(defaultValue);
  const { name, label, required } = Field(field);
  const fieldDispatcher = useFieldDispatcher();
  // this state adds an elevation effect to the fields when focused. More noticeable on light-mode.
  const [focused, setFocused] = useState(false);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  }, []);

  useEffect(() => {
    function onTimeout() {
      fieldDispatcher({
        name,
        value,
        type: 'UPDATE_VALUE',
        caller: SimpleInput,
      });
    }

    let timeoutId = setTimeout(onTimeout, 250);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [fieldDispatcher, name, value]);

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
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={handleChange}
          disabled={disabled}
          required={required}
        />
      </Paper>
    </FormGrid>
  );
});
