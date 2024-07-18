import { createContext, PropsWithChildren, useContext } from 'react';
import { useReleaseInfo } from '../hooks/useReleaseInfo';

export type ReleaseInfo = {
  name: string;
  url: string;
};
const ReleaseInfoContext = createContext<ReleaseInfo>(null!);

/**
 * This Provider sets up the latest ReleaseInfo from GitHub and
 * provides the ReleaseInfo for all components to use/re-use
 *
 * Using Providers prevents components that want to use the same requested
 * information, from re-requesting that information.
 * @param children
 * @constructor
 */
export const ReleaseInfoProvider = ({ children }: PropsWithChildren) => {
  const releaseInfo = useReleaseInfo();

  return <ReleaseInfoContext.Provider value={releaseInfo}>{children}</ReleaseInfoContext.Provider>;
};

export function useReleaseInfoContext() {
  return useContext(ReleaseInfoContext);
}
