import {StorageContextProvider} from "../IDE/core/src";
import {PropsWithChildren} from "react";
import {AlertContextProvider} from "./AlertContextProvider";

export function AppProvider(props: PropsWithChildren){

  return (
    <StorageContextProvider>
      <AlertContextProvider>
        {props.children}
      </AlertContextProvider>
    </StorageContextProvider>
  );
}