import {StorageContextProvider} from "../../IDE/core/src/storage";
import {PropsWithChildren} from "react";

export function AppProvider(props: PropsWithChildren){

  return (
    <StorageContextProvider>
      {props.children}
    </StorageContextProvider>
  );
}