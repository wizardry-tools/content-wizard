import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Logger, useLogger } from './LoggingProvider';
import { getAuthorizationHeaders, useObjectState, useRenderCount } from '../utility';
import { useAlertDispatcher } from './WizardAlertProvider';
import { useResults } from './ResultsProvider';
import { Result } from '../components/Results';

const PACK_MGR_PATH = '/crx/packmgr';
const DEFAULT_GROUP = 'my_packages';
const DEFAULT_PACKAGE_NAME = 'Content-Wizard-Results-Content-Package';
const PATH_DELIMITER = '/jcr:content';

type PackageFilterRule = {
  modifier: 'include' | 'exclude';
  pattern: string;
};
type PackageFilter = {
  root: string;
  rules: PackageFilterRule[];
};
type GroupName = {
  name: string;
  title: string;
  count: number;
  deepCount: number;
};

export type PackageManagerAction = 'create' | 'edit' | 'build' | 'listGroups';
export type PackageManagerRequest = Omit<RequestInit, 'body'> & {
  method: 'GET' | 'POST';
  endpoint: string;
  params?: Record<string, string>;
  body?: FormData;
};

/**
 * This map sets up the static properties of the various PackageManagerRequest types
 */
export const packageRequestMap: Record<PackageManagerAction, PackageManagerRequest> = {
  create: {
    method: 'POST',
    endpoint: `${PACK_MGR_PATH}/service/exec.json`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
    params: {
      cmd: 'create',
    },
  },
  edit: {
    method: 'POST',
    endpoint: `${PACK_MGR_PATH}/update.jsp`,
    headers: {
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/png,image/svg+xml,*/*;q=0.8',
    },
  },
  build: {
    method: 'POST',
    endpoint: `${PACK_MGR_PATH}/service/script.html`,
    headers: {
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/png,image/svg+xml,*/*;q=0.8',
    },
  },
  listGroups: {
    method: 'GET',
    endpoint: `${PACK_MGR_PATH}/groups.jsp`,
    params: {
      _charset_: 'utf-8',
      includeMyPackages: 'true',
    },
  },
};

type PackageProps = {
  packageName: string;
  groupName: string;
  packagePath?: string;
  packageUrl?: string;
  downloadUrl?: string;
  isReady: boolean;
};
const initialPackage: PackageProps = {
  packageName: DEFAULT_PACKAGE_NAME,
  groupName: DEFAULT_GROUP,
  packagePath: '',
  packageUrl: '',
  downloadUrl: '',
  isReady: false,
};

type PackagingContextProps = {
  groups: string[];
  isCreating: boolean;
  isBuilding: boolean;
  setPackageName: (packageName: string) => void;
  setGroupName: (groupName: string) => void;
  create: () => void;
  build: () => void;
  packageState: PackageProps;
};

const PackagingContext = createContext<PackagingContextProps>(null!);

export const PackagingProvider = ({ children }: PropsWithChildren) => {
  const logger = useLogger();
  const renderCount = useRenderCount();
  logger.debug({ message: `PackagingProvider[${renderCount}] render()` });
  const alertDispatcher = useAlertDispatcher();
  const { results } = useResults();
  const [groups, setGroups] = useState([] as string[]);

  const [packageState, setPackageState] = useObjectState(initialPackage);

  const [isCreating, setIsCreating] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);

  const setPackagePath = useCallback(
    (packagePath: string) => {
      const params = {
        _charset_: 'utf-8',
        path: packagePath,
      };
      const queryString = new URLSearchParams(params);
      setPackageState({
        packagePath,
        packageUrl: `${PACK_MGR_PATH}/index.jsp#${packagePath}`,
        downloadUrl: `${PACK_MGR_PATH}/download.jsp?${queryString}`,
      });
    },
    [setPackageState],
  );

  const setPackageName = useCallback(
    (packageName: string) => {
      // reset any package props if the user renames the package...
      setPackageState({ packageName, isReady: false, packagePath: '', packageUrl: '', downloadUrl: '' });
    },
    [setPackageState],
  );

  const setGroupName = useCallback(
    (groupName: string) => {
      // reset any package props if the user names a different group...
      setPackageState({ groupName, isReady: false, packagePath: '', packageUrl: '', downloadUrl: '' });
    },
    [setPackageState],
  );

  // a callback that we use to build the 'filter' Payload from package info and Result[]
  const createFilterPayload = useCallback(
    (packagePath: string): FormData | null => {
      logger.debug({ message: `PackagingProvider createFilterPayload: packagePath: `, packagePath });
      return buildFilterPayload(results, { ...packageState, packagePath });
    },
    [logger, packageState, results],
  );

  /**
   * This callback is called when the create package button is clicked.
   * It will call a sequence of async functions that will create a Package in CRX PackageManager
   * if one does not already exist, and then update that package with the full list
   * of content filters, determined by the Result[].
   *
   * Upon success, the packagePath state will be set.
   */
  const create = useCallback(() => {
    (async () => {
      setIsCreating(true);
      const { path, success, msg } = await createPackage({ packageState, logger });
      if (success && path) {
        // create multipart formData
        const formData = createFilterPayload(path);
        if (!formData) {
          alertDispatcher({
            severity: 'error',
            message: `Could not Update Package, unable to create Filters: [${msg}]`,
            caller: PackagingProvider,
          });
          setIsCreating(false);
          return;
        }
        // issue the edit action
        const editResponse = await editPackageFilters({ formData, packageState, logger });
        if (editResponse?.path) {
          // even though packagePath and path are the same, only set it after editPackageFilters has been successful
          setPackagePath(editResponse.path);
        } else {
          if (editResponse?.msg) {
            alertDispatcher({
              severity: 'error',
              message: `Could not Update Package: [${msg}]`,
              caller: PackagingProvider,
            });
          } else {
            logger.warn({ message: 'Warning, could not edit Package, bad response:', editResponse });
          }
        }
      } else {
        if (msg) {
          alertDispatcher({
            severity: 'error',
            message: `Package [${msg}] Already exists`,
            caller: PackagingProvider,
          });
        } else {
          logger.warn({ message: 'Warning, could not create Package, bad response' });
        }
      }
      setIsCreating(false);
    })();
  }, [packageState, logger, createFilterPayload, setPackagePath, alertDispatcher]);

  /**
   * This callback is called when the build package button is clicked.
   * It will call an async function that tells CRX PackageManager to build the
   * given Package.
   *
   * Upon success, the isPackageReady state will be set to true.
   */
  const build = useCallback(() => {
    (async () => {
      setIsBuilding(true);
      const buildResponse = await buildPackage({ packageState, logger });
      if (buildResponse) {
        logger.debug({ message: 'buildPackage buildResponse success', buildResponse });
        // once isPackageReady === true, further package functions are disabled until the dialog is remounted.
        setPackageState(() => ({
          isReady: true,
        }));
      } else {
        logger.debug({ message: 'buildPackage failed to build' });
        alertDispatcher({
          severity: 'error',
          message: `Error, could not build the content Package [${packageState.packagePath}]. Something went wrong.`,
          caller: PackagingProvider,
        });
      }
      setIsBuilding(false);
    })();
  }, [alertDispatcher, logger, packageState, setPackageState]);

  /**
   * This useEffect is responsible for fetching the list of Package Groups,
   * running once when the component mounts
   */
  useEffect(() => {
    (async () => {
      const groups = await fetchGroups(logger);
      if (groups) {
        setGroups(groups);
      }
    })();
  }, [logger]);

  /**
   * This useEffect will reset the packageState to initial values when the Results update.
   * This allows the user to create additional packages based on different results.
   */
  useEffect(() => {
    setPackageState(initialPackage);
  }, [results, setPackageState]);

  const value = useMemo(
    () => ({
      create,
      build,
      groups,
      isCreating,
      isBuilding,
      packageState,
      setPackageName,
      setGroupName,
    }),
    [create, build, groups, isCreating, isBuilding, packageState, setPackageName, setGroupName],
  );

  return <PackagingContext.Provider value={value}>{children}</PackagingContext.Provider>;
};

export function usePackagingContext() {
  return useContext(PackagingContext);
}

/**
 * This method takes an array of Result objects, loops through them,
 * and builds a stringified PackageFilter array
 *
 * example filter: [
 *    {
 *      "root":"/content/some/path",
 *      "rules": [
 *        {
 *          "modifier":"include",
 *          "pattern":"jcr:content"
 *        }
 *      ]
 *    }
 * ]
 * @param results
 */
function buildPackageFilters(results: Result[]): string {
  // map Result[] into PackageFilter[]
  const packageFilters: PackageFilter[] = results
    .map((result) => {
      if (result.hasOwnProperty('path')) {
        let path = result.path;
        const jcrIndex = path.indexOf(PATH_DELIMITER);
        if (jcrIndex !== -1) {
          // is part of content, need to grab content node parent
          path = path.slice(0, jcrIndex);
        } // else, is the content
        return {
          root: path + PATH_DELIMITER,
          rules: [],
        };
      }
      // if a result doesn't have a path, we can't add it to a package.
      return {
        root: '',
        rules: [],
      };
    })
    // filter the PackageFilter[] to remove objects without root prop
    .filter((filter) => !!filter.root);
  // remove duplicate values
  const uniquePackageFilters: PackageFilter[] = [];
  const seenValues = new Set<string>();
  for (const filter of packageFilters) {
    if (!seenValues.has(filter.root)) {
      seenValues.add(filter.root);
      uniquePackageFilters.push(filter);
    }
  }
  console.log('buildPackageFilters() uniquePackageFilters: ', uniquePackageFilters);
  return JSON.stringify(uniquePackageFilters);
}

function buildFilterPayload(results: Result[], packageState: PackageProps): FormData | null {
  if (!packageState.packagePath) {
    return null;
  }
  const formData = new FormData();
  const packageFilters = buildPackageFilters(results);
  formData.append('path', packageState.packagePath);
  formData.append('packageName', packageState.packageName);
  formData.append('groupName', packageState.groupName);
  formData.append('version', '');
  formData.append('description', 'This Content package was built with results found by Content Wizard.');
  formData.append('filter', packageFilters);
  formData.append('_charset_', 'UTF-8');
  console.log('buildFilterPayload() formData: ', formData);
  return formData;
}

async function appendAuthHeader(request: PackageManagerRequest): Promise<PackageManagerRequest> {
  const authHeaders = await getAuthorizationHeaders(request.method);
  return {
    ...request,
    headers: {
      ...request.headers,
      ...authHeaders,
    },
  };
}

type PackageManagerRequestOptions = {
  action: PackageManagerAction;
  packageState?: PackageProps;
  formData?: FormData;
};
async function buildPackageRequest(props: PackageManagerRequestOptions): Promise<PackageManagerRequest | null> {
  const { action, packageState, formData } = props;
  const { packageName = DEFAULT_PACKAGE_NAME, groupName = DEFAULT_GROUP, packagePath } = packageState || {};
  switch (action) {
    case 'create': {
      let request = await appendAuthHeader(packageRequestMap.create);
      const body = {
        packageName,
        groupName,
        packageVersion: '',
        _charset_: 'utf-8',
      };
      request.body = new URLSearchParams(body);
      return request;
    }
    case 'edit': {
      if (!formData) {
        // formData is required
        return null;
      }
      let request = await appendAuthHeader(packageRequestMap.edit);
      request.body = formData;
      return request;
    }
    case 'build': {
      if (!packagePath) {
        // packagePath is required for this action
        return null;
      }
      let request = await appendAuthHeader(packageRequestMap.build);
      request.endpoint = request.endpoint + packagePath;
      const formData = new FormData();
      formData.append('cmd', 'build');
      request.body = formData;
      return request;
    }
    case 'listGroups': {
      let request = await appendAuthHeader(packageRequestMap.listGroups);
      request.params = {
        ...request.params,
        _dc: `${Date.now()}`,
      };
      return request;
    }
  }

  return null;
}

async function fetchGroups(logger: Logger): Promise<string[] | null> {
  const request = await buildPackageRequest({ action: 'listGroups' });
  logger.debug({ message: 'fetchGroups request: ', request });
  if (request) {
    const { endpoint, params, headers, method } = request;
    const url = endpoint + (params ? '?' + new URLSearchParams(params) : '');
    const response = await fetch(url, {
      method,
      headers,
    });
    logger.debug({ message: `fetchGroups response`, response });
    if (response.ok) {
      const json = await response.json();
      if (json) {
        logger.debug({ message: `fetchGroups json`, json });
        if (json.groups) {
          return json.groups.map(({ name }: GroupName) => name) || null;
        }
      }
    }
  }
  return null;
}

type HandlePackageProps = Omit<PackageManagerRequestOptions, 'action'> & {
  logger: Logger;
};

/**
 * This async function is responsible for building and fetching the request
 * to create a package in CRX PackageManager
 * @param props
 */
async function createPackage(props: HandlePackageProps): Promise<any> {
  const { logger, ...other } = props;
  const request = await buildPackageRequest({ action: 'create', ...other });
  logger.debug({ message: 'createPackage request: ', request });
  if (request) {
    const { endpoint, params, headers, method, body } = request;
    const url = endpoint + (params ? '?' + new URLSearchParams(params) : '');
    const response = await fetch(url, {
      method,
      headers,
      body,
    });
    logger.debug({ message: 'createPackage response: ', response });
    if (response.ok && response.status === 200) {
      const json = await response.json();
      if (json) {
        logger.debug({ message: 'createPackage json: ', json });
        return json;
      }
    }
  }
  return null;
}

/**
 * This async function is responsible for building and fetching the request
 * to update/edit the filters for a package in CRX PackageManager
 * @param props
 */
async function editPackageFilters(props: HandlePackageProps): Promise<any> {
  const { logger, ...other } = props;
  const request = await buildPackageRequest({ action: 'edit', ...other });
  logger.debug({ message: 'editPackageFilter: request ', request });
  if (request) {
    const { endpoint, params, headers, method, body } = request;
    const url = endpoint + (params ? '?' + new URLSearchParams(params) : '');
    const response = await fetch(url, {
      method,
      headers,
      body,
    });
    logger.debug({ message: 'editPackageFilter response: ', response });
    if (response.ok && response.status === 200) {
      const json = await response.json();
      if (json) {
        logger.debug({ message: 'editPackageFilter json: ', json });
        return json;
      }
    }
  }
  return null;
}

/**
 * This async function is responsible for building and fetching the request
 * to build a package in CRX PackageManager
 * Packages have to be created before they can be built.
 * @param props
 */
async function buildPackage(props: HandlePackageProps): Promise<boolean> {
  const { logger, ...other } = props;
  const request = await buildPackageRequest({ action: 'build', ...other });
  logger.debug({ message: 'buildPackage: request ', request });
  if (request) {
    const { endpoint, params, headers, method, body } = request;
    const url = endpoint + (params ? '?' + new URLSearchParams(params) : '');
    const response = await fetch(url, {
      method,
      headers,
      body,
    });
    logger.debug({ message: 'buildPackage response: ', response });
    if (response.ok && response.status === 200) {
      const html = await response.text();
      if (html) {
        logger.debug({ message: 'buildPackage html: ', html });
        return true;
      }
    }
  }
  return false;
}
