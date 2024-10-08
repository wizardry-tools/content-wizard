import dayjs from 'dayjs';
import { useCallback, useState } from 'react';
import { Stack, IconButton, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { LocalizationProvider, DateTimePicker, PickersDay } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import type { DateRange, DayTime, WizardInputProps } from '@/types';
import { useFieldDispatcher, useLogger } from '@/providers';
import { useRenderCount } from '@/utility';
import { FormGrid } from './FormGrid';

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

export const WizardDatePicker = ({ field }: WizardInputProps) => {
  const logger = useLogger();
  const renderCount = useRenderCount();
  logger.debug({ message: `WizardDatePicker[${renderCount}] render()` });
  const fieldDispatcher = useFieldDispatcher();
  const { name, label } = { ...field };
  const value = field.value as DateRange;
  const [lowerBound, setLowerBound] = useState(value?.lowerBound ? dayjs(value.lowerBound) : null);
  const [upperBound, setUpperBound] = useState(value?.upperBound ? dayjs(value.upperBound) : null);

  // these two states add an elevation effect to the fields when focused. More noticeable on light-mode.
  const [startFocused, setStartFocused] = useState(false);
  const [endFocused, setEndFocused] = useState(false);

  const handleLowerDateChange = useCallback(
    (dateTime: DayTime) => {
      if (!dateTime) {
        return;
      }
      setLowerBound(dateTime);
      fieldDispatcher({
        name,
        value: {
          upperBound,
          lowerBound: dateTime,
        },
        type: 'UPDATE_VALUE',
      });
    },
    [fieldDispatcher, name, upperBound],
  );

  const handleUpperDateChange = useCallback(
    (dateTime: DayTime) => {
      if (!dateTime) {
        return;
      }
      setUpperBound(dateTime);
      fieldDispatcher({
        name,
        value: {
          lowerBound,
          upperBound: dateTime,
        },
        type: 'UPDATE_VALUE',
      });
    },
    [fieldDispatcher, name, lowerBound],
  );

  const onStartFocus = useCallback(() => {
    setStartFocused((prevState) => !prevState);
  }, []);

  const onEndFocus = useCallback(() => {
    setEndFocused((prevState) => !prevState);
  }, []);

  // Note: both the Paper and the slotted Textfield need to be full width for each DateTimePicker
  return (
    <FormGrid item key={name}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Stack direction={{ lg: 'row', xs: 'column' }} spacing={1} justifyContent="space-between">
          <Paper elevation={startFocused ? 4 : 1} className="query-builder-field">
            <DateTimePicker
              name={`${name}.lowerBound`}
              value={lowerBound}
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
              onChange={handleLowerDateChange}
            />
          </Paper>
          <Paper elevation={endFocused ? 4 : 1} className="query-builder-field">
            <DateTimePicker
              name={`${name}.upperBound`}
              value={upperBound}
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
              onChange={handleUpperDateChange}
            />
          </Paper>
        </Stack>
      </LocalizationProvider>
    </FormGrid>
  );
};
