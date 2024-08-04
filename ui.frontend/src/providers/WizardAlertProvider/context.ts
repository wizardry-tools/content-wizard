import { createContext, useContext } from 'react';
import type { Dispatch } from 'react';
import type { WizardAlertProps } from '@/types';

const emptyContext: WizardAlertProps = {
  message: '',
  severity: 'info',
  alertTimeout: 5000,
};

export const WizardAlertContext = createContext<WizardAlertProps>(emptyContext);
export const WizardAlertDispatcher = createContext<Dispatch<WizardAlertProps>>(() => ({}));

export const useAlertContext = () => {
  return useContext(WizardAlertContext);
};

export const useAlertDispatcher = () => {
  return useContext(WizardAlertDispatcher);
};
