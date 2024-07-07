import dayjs from 'dayjs';
import { Stack, IconButton, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { LocalizationProvider, DateTimePicker, PickersDay } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { FormGrid } from './FormGrid';
import { memo, useCallback, useState } from 'react';
import { DateRange, DayTime, FieldConfig } from './fields';
import { SimpleInputProps } from './SimpleInput';

const StyledButton = styled(IconButton)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
}));
const StyledDay = styled(PickersDay)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  color: theme.palette.mode === 'light' ? theme.palette.secondary.dark : theme.palette.secondary.light,
  '&.Mui-selected,&.Mui-focused,&:hover': {
    backgroundColor: theme.palette.mode === 'light' ? theme.palette.secondary.light : theme.palette.secondary.dark,
    color: theme.palette.mode === 'light' ? theme.palette.secondary.dark : theme.palette.secondary.light,
  },
}));

export const SimpleDatePicker = memo(({ onChange, field }: SimpleInputProps) => {
  const { name, label, value } = { ...field };
  const { lowerBound, upperBound } = { ...(value as DateRange) };
  const [startFocused, setStartFocused] = useState(false);
  const [endFocused, setEndFocused] = useState(false);

  const handleLowerDateChange = (dateTime: DayTime) => {
    if (!dateTime) {
      return;
    }
    const updatedfield: FieldConfig = {
      ...field,
      value: {
        ...(value as DateRange),
        lowerBound: dateTime,
      },
    };
    onChange(updatedfield);
  };
  const memoizedLowerDateChange = useCallback(handleLowerDateChange, [field, onChange, value]);

  const onStartFocus = useCallback(() => {
    setStartFocused((prevState) => !prevState);
  }, []);

  const onEndFocus = useCallback(() => {
    setEndFocused((prevState) => !prevState);
  }, []);

  const handleUpperDateChange = (dateTime: DayTime) => {
    if (!dateTime) {
      return;
    }
    const updatedfield: FieldConfig = {
      ...field,
      value: {
        ...(value as DateRange),
        upperBound: dateTime,
      },
    };
    onChange(updatedfield);
  };
  const memoizedUpperDateChange = useCallback(handleUpperDateChange, [field, onChange, value]);

  // Note: both the Paper and the slotted Textfield need to be full width for each DateTimePicker
  return (
    <FormGrid item key={name}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Stack direction={{ md: 'row', xs: 'column' }} spacing={1} justifyContent="space-between">
          <Paper elevation={startFocused ? 4 : 1} className="query-builder-field">
            <DateTimePicker
              name={`${name}.lowerBound`}
              value={dayjs(lowerBound)}
              slots={{
                openPickerButton: StyledButton,
                day: StyledDay,
              }}
              slotProps={{
                openPickerIcon: { fontSize: 'large' },
                openPickerButton: { color: 'secondary' },
                textField: {
                  label: `${label} Start Date`,
                  color: 'secondary',
                  onFocus: onStartFocus,
                  onBlur: onStartFocus,
                  className: 'query-builder-field',
                },
              }}
              onChange={memoizedLowerDateChange}
            />
          </Paper>
          <Paper elevation={endFocused ? 4 : 1} className="query-builder-field">
            <DateTimePicker
              name={`${name}.upperBound`}
              value={dayjs(upperBound)}
              slots={{
                openPickerButton: StyledButton,
                day: StyledDay,
              }}
              slotProps={{
                openPickerIcon: { fontSize: 'large' },
                openPickerButton: { color: 'secondary' },
                textField: {
                  label: `${label} End Date`,
                  color: 'secondary',
                  className: 'query-builder-field',
                  onFocus: onEndFocus,
                  onBlur: onEndFocus,
                },
              }}
              onChange={memoizedUpperDateChange}
            />
          </Paper>
        </Stack>
      </LocalizationProvider>
    </FormGrid>
  );
});
