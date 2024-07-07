import { createContext, Dispatch, PropsWithChildren, useContext, useRef, useState } from 'react';
import { Alert, AlertColor } from '@mui/material';

import { AlertProps } from '@mui/material';
export type WizardAlertProps = AlertProps & {
  message: string;
};
const AlertContext = createContext<WizardAlertProps>(null!);
const AlertDispatcher = createContext<Dispatch<WizardAlertProps>>(null!);

export type AlertProviderProps = PropsWithChildren & {
  alertTimeout?: number;
  defaultMessage?: string;
  defaultSeverity?: AlertColor | undefined;
};

/**
 * Provides Alert Context and Alert Dispatcher to the React Node and it's Children
 * @param alertTimeout the timeout for the Alert before it disappears
 * @param children the ReactNode Children
 * @param defaultMessage the fallback Message if one is not supplied. Empty string by default, resulting in no Alert.
 * @param defaultSeverity the fallback severity level if one is not supplied. See @mui/material/AlertColor
 * @param other unused properties passed to the @mui/maertial/Alert
 * @constructor
 */
export function AlertProvider(
  { alertTimeout, children, defaultMessage, defaultSeverity, ...other }: AlertProviderProps = {
    alertTimeout: 5000,
    defaultMessage: '',
    defaultSeverity: 'info',
  },
) {
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState(defaultSeverity);

  const timeoutRef = useRef(0);

  const handleAlertDispatch = (alert: WizardAlertProps = { message, severity }) => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    const { message, severity } = alert;
    setMessage(message);
    setSeverity(severity);
    timeoutRef.current = window.setTimeout(() => {
      // after timeout, revert message back to empty string;
      setMessage('');
    }, alertTimeout);
  };

  return (
    <AlertContext.Provider value={{ message, severity }}>
      <AlertDispatcher.Provider value={handleAlertDispatch}>
        {children}
        <Alert
          className={`alert-container ${message ? 'show' : 'hide'}`}
          severity={severity}
          variant="filled"
          {...other}
        >
          {message}
        </Alert>
      </AlertDispatcher.Provider>
    </AlertContext.Provider>
  );
}

export function useAlertContext() {
  return useContext(AlertContext);
}

export function useAlertDispatcher() {
  return useContext(AlertDispatcher);
}
