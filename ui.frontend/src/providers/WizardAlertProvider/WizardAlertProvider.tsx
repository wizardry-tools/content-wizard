import { useCallback, useState } from 'react';
import type { AlertColor } from '@mui/material';
import type { WizardAlertProps, WizardAlertProviderProps } from '@/types';
import { useRenderCount } from '@/utility';
import { useLogger } from '../LoggingProvider';
import { WizardAlertContext, WizardAlertDispatcher } from './context';

/**
 * Provides Alert Context and Alert Dispatcher to the React Node and it's Children
 * @param alertTimeout the timeout for the Alert before it disappears
 * @param children the ReactNode Children

 * @constructor
 */
export const WizardAlertProvider = ({ children }: WizardAlertProviderProps) => {
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
};
