/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO: Refactor this logic to avoid use of `any`
// disable the no-explicit-any rule for this file until the exported function is refactored.
import { JSXElementConstructor } from 'react';

export const createComponentGroup = <
  Root extends JSXElementConstructor<never>,
  Children extends Record<string, JSXElementConstructor<never>>,
>(
  root: Root,
  children: Children,
): Root & Children => {
  return Object.entries(children).reduce<any>((r, [key, value]) => {
    r[key] = value;
    return r;
  }, root);
};
