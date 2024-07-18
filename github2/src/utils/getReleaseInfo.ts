import { Octokit } from '@octokit/core';

export const OWNER = 'wizardry-tools';
export const REPO = 'content-wizard';
export const REPO_URL = `https://github.com/${OWNER}/${REPO}`;
export const DEFAULT_RELEASE_URL = `${REPO_URL}/releases`;

/**
 * This function retrieves the stored GitHub API Token.
 * This token has to be defined in the Repository Secrets within GitHub.
 *
 * For local development, add `export REACT_APP_GH_API_TOKEN="..."` to your Bash profile
 * replacing "..." with your own personal API Token. You will need appropriate
 * Repository access to be able to use this.
 */
function getApiToken() {
  return import.meta.env.VITE_GH_API_TOKEN || '';
}

/**
 * This method builds and runs the Request for retrieving the latest releases from GitHub API
 */
export async function getReleaseInfo(): Promise<unknown> {
  const apiToken = getApiToken();
  if (!apiToken) {
    // refusing to get Release Info
    return;
  }
  const octokit = new Octokit({
    auth: apiToken,
  });

  return await octokit.request(`GET /repos/{owner}/{repo}/releases`, {
    owner: OWNER,
    repo: REPO,
    headers: {
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
}
