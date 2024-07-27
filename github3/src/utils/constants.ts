import { ReleaseInfo } from '@/types';

export const OWNER = 'wizardry-tools';
export const REPO = 'content-wizard';
export const REPO_URL = `https://github.com/${OWNER}/${REPO}`;
export const API_ENDPOINT = `https://api.github.com/repos/${OWNER}/${REPO}/releases`;
export const DEFAULT_RELEASE_URL = `${REPO_URL}/releases`;
export const EMPTY_RELEASE: ReleaseInfo = {
  name: `${REPO}-#.#.#`,
  url: DEFAULT_RELEASE_URL,
};
