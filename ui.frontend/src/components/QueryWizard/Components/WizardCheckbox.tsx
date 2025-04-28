import { useCallback, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Checkbox, FormControlLabel } from '@mui/material';
import type { WizardInputProps } from '@/types';
import { useRenderCount } from '@/utility';
import { useFieldDispatcher, useLogger } from '@/providers';
import { FormGrid } from './FormGrid';

export const WizardCheckbox = ({ field, disabled }: WizardInputProps) => {
  const logger = useLogger();
  const renderCount = useRenderCount();
  logger.debug({ message: `WizardCheckbox[${renderCount}] render()` });
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
              style={{ display: disabled ? 'none' : '' }}
            />
          }
        />
      </FormGrid>
    );
  }
  return null;
};
