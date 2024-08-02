import type { PropsWithChildren } from 'react';
import type { AlertColor, AlertProps } from '@mui/material';

export type WizardAlertProps = AlertProps & {
  message?: string;
  severity?: AlertColor;
  alertTimeout?: number;
};
export type WizardAlertProviderProps = WizardAlertProps & PropsWithChildren;
