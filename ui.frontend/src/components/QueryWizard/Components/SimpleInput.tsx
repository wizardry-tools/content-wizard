import { ChangeEvent, memo, useCallback, useRef, useState } from 'react';
import { FormGrid } from './FormGrid';
import { Paper, TextField } from '@mui/material';
import { Field, FieldConfig, InputValue } from './fields';

export type SimpleInputProps = {
  onChange: (field: FieldConfig) => void;
  defaultValue: InputValue;
  field: FieldConfig;
  disabled: boolean;
};

export const SimpleInput = memo(({ onChange, field, defaultValue, disabled }: SimpleInputProps) => {
  const initialValue = useRef(defaultValue);
  const [value, setValue] = useState(initialValue.current);

  // this state adds an elevation effect to the fields when focused. More noticeable on light-mode.
  const [focused, setFocused] = useState(false);
  const { name, label, required } = Field(field);

  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const debouncedHandleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value); //update this component
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onChange({
        ...field,
        value: e.target.value,
      }); // update parent config
    }, 500);
  };

  const onFocus = useCallback(() => {
    setFocused((prevState) => !prevState);
  }, []);

  const memoizedHandleChange = useCallback(debouncedHandleChange, [field, onChange]);

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
          onFocus={onFocus}
          onBlur={onFocus}
          onChange={memoizedHandleChange}
          disabled={disabled}
          required={required}
        />
      </Paper>
    </FormGrid>
  );
});
