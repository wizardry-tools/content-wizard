import { Checkbox, FormControlLabel } from '@mui/material';
import { FormGrid } from './FormGrid';
import { ChangeEvent, useCallback, useState } from 'react';
import { SimpleInputProps } from './SimpleInput';
import { useFieldDispatcher, useLogger } from '@/providers';
import { useRenderCount } from '@/utility';

export const SimpleCheckbox = ({ field, disabled }: SimpleInputProps) => {
  const logger = useLogger();
  const renderCount = useRenderCount();
  logger.debug({ message: `SimpleCheckbox[${renderCount}] render()` });
  const { name, label, checkboxValue = true, required } = { ...field };
  const [value, setValue] = useState('');
  const fieldDispatcher = useFieldDispatcher();

  const handleCheckboxChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.checked ? e.target.value : '';
      setValue(value);
      fieldDispatcher({
        name,
        value,
        type: 'UPDATE_VALUE',
        caller: SimpleCheckbox,
      });
    },
    [fieldDispatcher, name],
  );

  if (name) {
    return (
      <FormGrid item>
        <FormControlLabel
          label={label}
          control={
            <Checkbox
              name={name}
              size={'large'}
              value={checkboxValue}
              checked={!!value}
              color="secondary"
              onChange={handleCheckboxChange}
              required={required}
              disabled={disabled}
            />
          }
        />
      </FormGrid>
    );
  }
  return null;
};
