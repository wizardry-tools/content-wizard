import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { ReleaseInfo, ReleaseResponse } from '@/types';
import { API_ENDPOINT, EMPTY_RELEASE } from '@/utils';
import { ReleaseInfoContext } from './ReleaseInfoContext';

/**
 * This method builds and runs the Request for retrieving the latest releases from GitHub API
 */
async function getReleaseInfo(): Promise<ReleaseInfo> {
  /**
   * This function retrieves the stored GitHub API Token.
   * This token has to be defined in the Repository Secrets within GitHub.
   *
   * For local development, add `export REACT_APP_GH_API_TOKEN="..."` to your Bash profile
   * replacing "..." with your own personal API Token. You will need appropriate
   * Repository access to be able to use this.
   */
  const apiToken = import.meta.env.VITE_GH_API_TOKEN ?? '';
  if (!apiToken) {
    // refusing to get Release Info
    return EMPTY_RELEASE;
  }

  const headers: RequestInit = {
    headers: {
      'X-GitHub-Api-Version': '2022-11-28',
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${apiToken}`,
    },
  };
  const response = await fetch(API_ENDPOINT, headers);
  if (response) {
    const json: ReleaseResponse = await response.json();
    const latestRelease = json[0];
    const { name, html_url } = latestRelease;
    return { name, url: html_url };
  }

  return EMPTY_RELEASE;
}

/**
 * This hook will perform a Request to GitHub API and return the latest ReleaseInfo
 */
function useReleaseInfo(): ReleaseInfo {
  const [name, setName] = useState(EMPTY_RELEASE.name);
  const [url, setUrl] = useState(EMPTY_RELEASE.url);

  useEffect(() => {
    getReleaseInfo()
      .then(({ name, url }) => {
        if (name) {
          setName(name);
        }
        if (url) {
          setUrl(url);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return useMemo(
    () => ({
      name,
      url,
    }),
    [name, url],
  );
}

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
