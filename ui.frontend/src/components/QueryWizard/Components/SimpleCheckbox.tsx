import {Checkbox, FormControlLabel} from "@mui/material";
import {
  FormGrid
} from ".";
import {ChangeEvent, memo, useCallback} from "react";
import {SimpleInputProps} from "./SimpleInput";

export const SimpleCheckbox = memo(({onChange, field}: SimpleInputProps) => {

  const {name, label, value, checkboxValue = true, required} = {...field};

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...field,
      value: e.target.checked ? e.target.value : ''
    });
  }

  const memoizedHandleChange = useCallback(handleCheckboxChange,[field, onChange]);

  if (name) {
    return (
      <FormGrid item >
        <FormControlLabel
          label={label}
          control={
            <Checkbox
              name={name}
              size={"large"}
              value={checkboxValue}
              checked={!!(value)}
              color="secondary"
              onChange={memoizedHandleChange}
              required={required}/>
          }
        />
      </FormGrid>
    );
  }
  return null;
});