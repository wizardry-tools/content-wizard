import {createReverseMapping} from "../../utility/libs";

export type TargetType = "none" | "resource" | "template" | "text";
export const TargetTypes: Record<TargetType, string> = {
  none: "None",
  resource: "Resource Type",
  template: "Template Type",
  text: "Full Text Search"
};

export const TargetTypeLookup = createReverseMapping(TargetTypes);
