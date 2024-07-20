import { Slider, InputLabel, Tooltip } from '@mui/material';
import { FormGrid } from './FormGrid';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NumberValue } from './fields';
import { SimpleInputProps } from './SimpleInput';
import { useFieldDispatcher, useLogger } from 'src/providers';
import { useDebounce, useRenderCount } from 'src/utility';

type SimpleSliderProps = SimpleInputProps & {
  min: number;
  max: number;
  step: number;
};

export const SimpleSlider = ({ min = -1, max = 1000, step = 10, defaultValue, field }: SimpleSliderProps) => {
  const logger = useLogger();
  const renderCount = useRenderCount();
  logger.debug({ message: `SimpleSlider[${renderCount}] render()` });
  const fieldDispatcher = useFieldDispatcher();
  const initialValue = useRef(defaultValue);
  const [value, setValue] = useState(initialValue.current);
  const debouncedValue = useDebounce(value, 150);
  const { name, label } = { ...field };

  const handleChange = useCallback((_event: Event, value: NumberValue) => {
    if (value) {
      setValue(value);
    }
  }, []);

  useEffect(() => {
    fieldDispatcher({
      name: name,
      value: debouncedValue,
      type: 'UPDATE_VALUE',
      caller: SimpleSlider,
    });
  }, [fieldDispatcher, name, debouncedValue]);

  const marks = useMemo(() => {
    const items = [
      {
        value: min,
      },
    ];
    // defines lower scaled values
    items.push(
      ...[...Array(step)].map((_, i) => {
        const value = i * step;
        return { value };
      }),
    );

    // defines higher scaled values
    items.push(
      ...[...Array(step)].map((_, i) => {
        const value = (i + 1) * step * step;
        return { value };
      }),
    );
    return items;
  }, [min, step]);

  return (
    <FormGrid item>
      {label && (
        <Tooltip title={'-1 enables unlimited results'}>
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
        valueLabelDisplay="auto"
        onChange={handleChange}
      />
    </FormGrid>
  );
};
