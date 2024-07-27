import { PropsWithChildren } from 'react';
import { ReleaseInfoProvider } from './ReleaseInfoProvider';

/**
 * This is the root Provider for the entire App.
 * Other providers will be listed here for the App to access.
 * @param children
 * @constructor
 */
export const AppProvider = ({ children }: PropsWithChildren) => {
  return <ReleaseInfoProvider>{children}</ReleaseInfoProvider>;
};
