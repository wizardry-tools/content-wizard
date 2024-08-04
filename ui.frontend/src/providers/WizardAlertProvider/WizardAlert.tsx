import { useEffect, useState } from 'react';
import { Alert } from '@mui/material';
import { useLogger } from '@/providers';
import { useRenderCount } from '@/utility';
import { useAlertContext, useAlertDispatcher } from './context';

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

      const onTimeout = () => {
        if (hover) {
          return;
        }
        setShow(false);
        alertDispatcher({ message: '' });
      };

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
