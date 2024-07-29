import { createContext, Dispatch, useCallback, useContext, useEffect, useState } from 'react';
import { Alert, AlertColor } from '@mui/material';
import { useLogger } from './LoggingProvider';
import { useRenderCount } from '@/utility';
import { WizardAlertProps, WizardAlertProviderProps } from '@/types';

const emptyContext: WizardAlertProps = {
  message: '',
  severity: 'info',
  alertTimeout: 5000,
};
const WizardAlertContext = createContext<WizardAlertProps>(emptyContext);
const WizardAlertDispatcher = createContext<Dispatch<WizardAlertProps>>(() => ({}));

/**
 * Provides Alert Context and Alert Dispatcher to the React Node and it's Children
 * @param alertTimeout the timeout for the Alert before it disappears
 * @param children the ReactNode Children

 * @constructor
 */
export function WizardAlertProvider({ children }: WizardAlertProviderProps) {
  const logger = useLogger();
  const renderCount = useRenderCount();
  logger.debug({ message: `WizardAlertProvider[${renderCount}] render()` });
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<AlertColor>('info');

  const handleAlertDispatch = useCallback(
    (alert: WizardAlertProps) => {
      logger.debug({ message: 'WizardAlertProvider Alert Dispatcher called: ' });

      if (alert.message !== null && typeof alert.message !== 'undefined') {
        setMessage(alert.message);
      }
      if (alert.severity) {
        setSeverity(alert.severity);
      }
    },
    [logger],
  );

  return (
    <WizardAlertContext.Provider value={{ message, severity }}>
      <WizardAlertDispatcher.Provider value={handleAlertDispatch}>{children}</WizardAlertDispatcher.Provider>
    </WizardAlertContext.Provider>
  );
}

export function useAlertContext() {
  return useContext(WizardAlertContext);
}

export function useAlertDispatcher() {
  return useContext(WizardAlertDispatcher);
}

/**

 * @constructor
 */
export const WizardAlert = () => {
  const logger = useLogger();
  const renderCount = useRenderCount();
  logger.debug({ message: `WizardAlert[${renderCount}] render()` });
  const { message, severity, alertTimeout = 5000 } = useAlertContext();
  const alertDispatcher = useAlertDispatcher();
  const [show, setShow] = useState(false);
  const [hover, setHover] = useState(false);

  const handleHover = () => {
    if (message) {
      setShow(true);
    }
    setHover(true);
  };

  const handleOff = () => {
    setShow(false);
    setHover(false);
    if (message) {
      alertDispatcher({ message: '' });
    }
  };

  useEffect(() => {
    if (message) {
      setShow(true);

      function onTimeout() {
        if (hover) {
          return;
        }
        setShow(false);
        alertDispatcher({ message: '' });
      }

      const timeoutId = setTimeout(onTimeout, alertTimeout);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [alertDispatcher, alertTimeout, hover, message]);

  return (
    <Alert
      id="wizard-alert-container"
      className={`${show ? 'show' : 'hide'} ${hover ? 'hover' : ''}`}
      sx={({ palette }) => ({
        border: 'none',
        '&.hover': {
          backgroundOpacity: '0.9',
          border: `1px solid ${palette.mode === 'dark' ? palette.primary.dark : palette.primary.light}`,
        },
      })}
      severity={severity}
      variant="filled"
      onMouseOver={handleHover}
      onMouseLeave={handleOff}
    >
      {message}
    </Alert>
  );
};
