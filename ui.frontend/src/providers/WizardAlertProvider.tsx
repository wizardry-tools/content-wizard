import {createContext, Dispatch, MouseEvent, PropsWithChildren, useContext, useEffect, useState} from 'react';
import {Alert, AlertColor, AlertProps} from "@mui/material";


export type WizardAlertProps = AlertProps & {
  message?: string;
  severity?: AlertColor;
  alertTimeout?: number;
};

const WizardAlertContext = createContext<WizardAlertProps>(null!);
const WizardAlertDispatcher = createContext<Dispatch<WizardAlertProps>>(null!);

export type WizardAlertProviderProps = WizardAlertProps & PropsWithChildren;

/**
 * Provides Alert Context and Alert Dispatcher to the React Node and it's Children
 * @param alertTimeout the timeout for the Alert before it disappears
 * @param children the ReactNode Children

 * @constructor
 */
export function WizardAlertProvider({children }: WizardAlertProviderProps) {
  console.log("AlertProvider.render()");

  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<AlertColor>('info');

  const handleAlertDispatch = (alert: WizardAlertProps) => {
    console.log("AlertProvider handleAlertDispatch()2", alert);
    if (alert.message !== null && typeof alert.message !== 'undefined') {
      setMessage(alert.message);
    }
    if(alert.severity) {
      setSeverity(alert.severity);
    }
  };

  return (
    <WizardAlertContext.Provider value={{ message, severity }}>
      <WizardAlertDispatcher.Provider value={handleAlertDispatch}>
        {children}
      </WizardAlertDispatcher.Provider>
    </WizardAlertContext.Provider>
  );
}

export function useAlertContext() {
  console.log("useAlertContext()6");
  return useContext(WizardAlertContext);
}

export function useAlertDispatcher() {
  console.log("useAlertDispatcher()7");
  return useContext(WizardAlertDispatcher);
}


/**

 * @constructor
 */
export const WizardAlert = () => {

  const {message, severity, alertTimeout = 5000} = useAlertContext();
  const alertDispatcher = useAlertDispatcher();
  const [show, setShow] = useState(false);
  const [hover, setHover] = useState(false);

  const handleHover = (_event: MouseEvent) => {
    if (message) {
      setShow(true);
    }
    setHover(true);
  }

  const handleOff = (_event: MouseEvent) => {
    setShow(false);
    setHover(false);
    alertDispatcher({message: ''})
  }

  useEffect(()=> {
    console.log("useEffect()")
    if (message) {
      setShow(true);
    }
    function onTimeout() {
      console.log("onTimeout()3 resetting message");
      setShow(false);
      alertDispatcher({message: ''})
    }
    console.log("AlertProvider.handleAlertDispatch before setTimeout()", alertTimeout);
    const timeoutId = setTimeout(onTimeout, alertTimeout);

    return () => {
      console.log("AlertProvider.handleAlertDispatch clearTimeout()5", timeoutId);
      clearTimeout(timeoutId);
    }
  },[alertTimeout, message]);

  return (
    <Alert
      id="wizard-alert-container"
      className={`${show ? 'show' : 'hide'} ${hover ? 'hover': ''}`}
      sx={({palette})=>({
        border: 'none',
        '&.hover': {
          backgroundOpacity: '0.9',
          border: `1px solid ${palette.mode === 'dark' ? palette.primary.dark : palette.primary.light}`
        }
      })}
      severity={severity}
      variant="filled"
      onMouseOver={handleHover}
      onMouseLeave={handleOff}
    >
      {message}
    </Alert>
  )
}