import {Slider, InputLabel, Tooltip} from "@mui/material";
import FormGrid from "./FormGrid";
import {SimpleInputProps} from "./SimpleInput";
import {memo, useCallback, useMemo, useRef, useState} from "react";
import {NumberValue} from "../defaults/fields";

type SimpleSliderProps = SimpleInputProps & {
  min: number;
  max: number;
  step: number;
};

const SimpleSlider = ({min = -1, max = 1000, step = 10, defaultValue, onChange, field}: SimpleSliderProps) => {

  const [value, setValue] = useState(defaultValue);
  const {name, label} = {...field};

  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const debouncedHandleChange = useCallback((value: NumberValue)=>{
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(()=>{
      onChange({
        ...field,
        value
      }); // update parent config
    }, 250)
  },[field, onChange]);

  const handleChange = (_event: Event, value: NumberValue) => {
    if (value) {
      setValue(value);
      debouncedHandleChange(value);
    }
  };
  const memoizedHandleChange = useCallback(handleChange, [debouncedHandleChange]);

  const marks = useMemo(() => {
    const items = [{
      value: min
    }];
    // defines lower scaled values
    items.push(
      ...[...Array(step)]
        .map((_, i) => {
          const value = i * step;
          return {value};
        })
    );

    // defines higher scaled values
    items.push(
      ...[...Array(step)]
        .map((_, i) => {
          const value = (i + 1) * step * step;
          return {value};
        })
    );
    return items;
  },[min, step]);

  return (
    <FormGrid item>

        {label && (
          <Tooltip title={"-1 enables unlimited results"}>
            <InputLabel id={`${name}-label`}>{label}</InputLabel>
          </Tooltip>
        )}
        <Slider
          id={name}
          value={value as NumberValue} // force number type
          min={min}
          max={max}
          marks={marks}
          color="secondary"
          step={null} // required explicit null prop
          valueLabelDisplay='auto'
          onChange={memoizedHandleChange}
        />
    </FormGrid>
  );
}

export default memo(SimpleSlider);