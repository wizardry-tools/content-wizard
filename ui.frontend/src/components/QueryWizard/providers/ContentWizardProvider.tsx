import {PropsWithChildren} from "react";

export function ContentWizardProvider(props: PropsWithChildren) {

  return (
    <>
      {props.children}
    </>
  );
}