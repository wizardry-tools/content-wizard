// the public path for preview content.
const PREVIEW_PATH = '/demo/content-wizard/resources/demo-content';

/**
 * This is a simple URL replacement function that checks existing request URLs
 * to see what kind of preview content we can replace the request with.
 * @param url
 * @param options
 */
function replacePreviewURL(url: string, options: RequestInit): string {
  if (url.startsWith('/content/cq:graphql')) {
    const body = options.body;
    if (body) {
      const bodyObject = JSON.parse(body as string);
      if ('operationName' in bodyObject) {
        const { operationName } = bodyObject;
        if (operationName === 'IntrospectionQuery') {
          return `${PREVIEW_PATH}/graphql-introspection.json`;
        }
      } else if ('query' in bodyObject) {
        return `${PREVIEW_PATH}/graphql-query.json`;
      }
    }
  } else if (url.startsWith('/content/')) {
    return `${PREVIEW_PATH}/results.json`;
  } else if (url.startsWith('/crx/de/query.jsp')) {
    return `${PREVIEW_PATH}/query.json`;
  } else if (url.startsWith('/bin/querybuilder.json')) {
    return `${PREVIEW_PATH}/querybuilder.json`;
  } else if (url.startsWith('/graphql/list')) {
    return `${PREVIEW_PATH}/graphql-list.json`;
  } else if (url.startsWith('/crx/packmgr/groups.jsp')) {
    return `${PREVIEW_PATH}/packmgr-groups.json`;
  } else if (url.startsWith('/crx/packmgr/service/exec.json?cmd=create')) {
    return `${PREVIEW_PATH}/create-package.json`;
  } else if (url.startsWith('/crx/packmgr/update.jsp')) {
    return `${PREVIEW_PATH}/create-package-update.json`;
  } else if (url.startsWith('/crx/packmgr/service/script.html')) {
    return `${PREVIEW_PATH}/build-package.html`;
  } else if (url.startsWith('/libs/granite/csrf/token')) {
    return `${PREVIEW_PATH}/token.json`;
  }
  return url;
}

// capture the native Fetch, so it can be called after we check URLs
const originalFetch = window.fetch;

/**
 * This is a simple Fetch override method that will replace URLs with
 * paths to static demo/preview content. Replacing the native Fetch
 * with this method allows the functionality to persist for all requests.
 * @param url
 * @param options
 */
export async function previewFetch(url: RequestInfo | URL, options: RequestInit = {}) {
  console.log(`Fetching resource from: ${url as string}`);
  url = replacePreviewURL(url as string, options);
  try {
    // convert POST to GET, since we cannot POST on GitHub with the demo content.
    options.method = 'GET';
    options.body = undefined;
    const response = await originalFetch(url, options);
    return response;
  } catch (error) {
    console.error(`Failed to fetch from URL: ${url}`, error);
    throw error;
  }
}
