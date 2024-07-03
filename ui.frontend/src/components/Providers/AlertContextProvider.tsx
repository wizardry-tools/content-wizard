import {
  createContext,
  Dispatch,
  PropsWithChildren, useCallback,
  useContext,
  useState
} from "react";

const ALERT_TIMEOUT = 5000;

const AlertContext = createContext<string>('');
const AlertDispatcher = createContext<Dispatch<string>>(null!);

export function AlertContextProvider({children}: PropsWithChildren) {

  const [message, setMessage] = useState('');

  const handleMessageDispatch = useCallback((message: string)=>{
    setMessage(message);
    setTimeout(()=>{
      // after timeout, revert message back to emptyString;
      setMessage('');
    }, ALERT_TIMEOUT);
  },[]);

  return (
    <AlertContext.Provider value={message}>
      <AlertDispatcher.Provider value={handleMessageDispatch}>
        {children}
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