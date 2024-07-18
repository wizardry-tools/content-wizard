import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_RELEASE_URL, getReleaseInfo, REPO } from '../utils/getReleaseInfo';
import { ReleaseInfo } from '../providers/ReleaseInfoProvider';

const EMPTY_RELEASE: ReleaseInfo = {
  name: `${REPO}-#.#.#`,
  url: DEFAULT_RELEASE_URL,
};

/**
 * This hook will perform a Request to GitHub API and return the latest ReleaseInfo
 */
export const useReleaseInfo = (): ReleaseInfo => {
  const [name, setName] = useState(EMPTY_RELEASE.name);
  const [url, setUrl] = useState(EMPTY_RELEASE.url);

  useEffect(() => {
    getReleaseInfo()
      .then((res) => {
        if (res?.status === 200 && res?.data) {
          console.log('API Response: ', res.data);
          const latestRelease = res.data[0];
          const { name, html_url } = latestRelease;
          if (name) {
            setName(name);
          }
          if (html_url) {
            setUrl(html_url);
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return useMemo(
    () => ({
      name,
      url,
    }),
    [name, url],
  );
};
