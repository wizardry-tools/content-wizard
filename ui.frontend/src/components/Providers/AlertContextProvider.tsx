import {
  createContext,
  Dispatch,
  PropsWithChildren, useCallback,
  useContext,
  useState
} from "react";
import {WizardAlertProps} from "./index";
import {Alert} from "@mui/material";

const ALERT_TIMEOUT = 5000;

const AlertContext = createContext<WizardAlertProps>(null!);
const AlertDispatcher = createContext<Dispatch<WizardAlertProps>>(null!);

const emptyAlert: WizardAlertProps = {message: '', severity: 'info'};

export function AlertContextProvider({children}: PropsWithChildren) {

  const [alert, setAlert] = useState(emptyAlert);

  const handleAlertDispatch = useCallback((alert: WizardAlertProps)=>{
    setAlert(alert)
    setTimeout(()=>{
      // after timeout, revert message back to emptyString;
      setAlert(emptyAlert);
    }, ALERT_TIMEOUT);
  },[]);

  return (
    <AlertContext.Provider value={alert}>
      <AlertDispatcher.Provider value={handleAlertDispatch}>
        {children}
        <Alert
          className={`alert-container ${alert.message ? 'show' : 'hide'}`}
          severity={alert.severity || "info"}
          variant="filled"
        >
          {alert.message}
        </Alert>
      </AlertDispatcher.Provider>
    </AlertContext.Provider>
  )
}

export function useAlertContext() {
  return useContext(AlertContext);
}

export function useAlertDispatcher() {
  return useContext(AlertDispatcher);
}