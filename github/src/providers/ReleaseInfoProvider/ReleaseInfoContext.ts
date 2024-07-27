import { createContext, useContext } from 'react';
import { ReleaseInfo } from '@/types';
import { EMPTY_RELEASE } from '@/utils';

export const ReleaseInfoContext = createContext<ReleaseInfo>(EMPTY_RELEASE);

export function useReleaseInfoContext() {
  return useContext(ReleaseInfoContext);
}
