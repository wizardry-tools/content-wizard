import {StorageContextProvider} from "src/components/IDE/core/src";
import {PropsWithChildren} from "react";
import {AlertProvider} from "./AlertProvider";

export function AppProvider(props: PropsWithChildren){

  return (
    <StorageContextProvider>
      <AlertProvider>
        {props.children}
      </AlertProvider>
    </StorageContextProvider>
  );
}