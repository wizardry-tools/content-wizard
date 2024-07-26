import { createContext, JSX, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLogger } from './LoggingProvider';
import { useAuthHeaders, useObjectState, useRenderCount } from '@/utility';
import { useAlertDispatcher } from './WizardAlertProvider';
import { useResults } from './ResultsProvider';
import { Result } from '@/types';

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
export type PackageManagerResponse = {
  success: boolean;
  msg: string;
  path?: string;
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
  packageName?: string;
  groupName?: string;
  packagePath?: string;
  packageUrl?: string;
  downloadUrl?: string;
  isReady?: boolean;
};
const initialPackage: PackageProps = {
  packageName: DEFAULT_PACKAGE_NAME,
  groupName: DEFAULT_GROUP,
  packagePath: '',
  packageUrl: '',
  downloadUrl: '',
  isReady: false,
};

type PackageManagerRequestOptions = {
  action: PackageManagerAction;
  packageState?: PackageProps;
  formData?: FormData;
};
type HandlePackageProps = Omit<PackageManagerRequestOptions, 'action'>;
type PackageHandlerFunction =
  | (() => Promise<unknown>)
  | ((props: HandlePackageProps) => Promise<unknown>)
  | ((results: Result[], packageState: PackageProps) => FormData | null);

/**
 * Represents the properties required by a PackagingContext component.
 * @typedef {Object} PackagingContextProps
 * @property {string[]} groups - An array of group names.
 * @property {boolean} isCreating - Indicates if the packaging context is in create mode.
 * @property {boolean} isBuilding - Indicates if the packaging context is in build mode.
 * @property {function} setPackageName - A function to set the package name.
 * @property {function} setGroupName - A function to set the group name.
 * @property {function} create - A function to initiate the create process.
 * @property {function} build - A function to initiate the build process.
 * @property {PackageProps} packageState - The current state of the package.
 */
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

/**
 * Represents a provider for packaging functionality.
 *
 * @param {PropsWithChildren} - The properties with children for the PackagingProvider component.
 *
 * @returns {JSX.Element} The PackagingProvider component.
 */
export const PackagingProvider = ({ children }: PropsWithChildren): JSX.Element => {
  const logger = useLogger();
  const renderCount = useRenderCount();
  logger.debug({ message: `PackagingProvider[${renderCount}] render()` });
  const alertDispatcher = useAlertDispatcher();
  const { fetchGroups, createPackage, editPackageFilters, buildPackage, buildFilterPayload } = usePackageHandler();
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
        downloadUrl: `${PACK_MGR_PATH}/download.jsp?${queryString.toString()}`,
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
    [buildFilterPayload, logger, packageState, results],
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
      const { path, success, msg } = await createPackage({ packageState }) ?? {};
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
        const editResponse = await editPackageFilters({ formData, packageState });
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
  }, [createPackage, packageState, logger, createFilterPayload, editPackageFilters, alertDispatcher, setPackagePath]);

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
  }, [alertDispatcher, buildPackage, logger, packageState, setPackageState]);

  /**
   * This useEffect is responsible for fetching the list of Package Groups,
   * running once when the component mounts
   */
  useEffect(() => {
    (async () => {
      const groups = await fetchGroups();
      if (groups) {
        setGroups(groups);
      }
    })();
  }, [fetchGroups]);

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

/**
 * Retrieves the current packaging context from the React context.
 *
 * @return {object} The packaging context object.
 */
export function usePackagingContext(): PackagingContextProps {
  return useContext(PackagingContext);
}

/**
 * This async function is responsible for building and fetching the request
 * to update/edit the filters for a package in CRX PackageManager
 *
 * @returns {any} - A promise that resolves to the response JSON object, or null if the request fails.
 */
const usePackageHandler = (): Record<string, PackageHandlerFunction> => {
  const logger = useLogger();
  const authHeaders = useAuthHeaders();

  /**
   * Append authentication header to the given package manager request.
   *
   * @param {PackageManagerRequest} request - The package manager request to append the header to.
   * @returns {Promise<PackageManagerRequest>} The updated package manager request with the appended header.
   */
  const appendAuthHeader = useCallback(
    async (request: PackageManagerRequest): Promise<PackageManagerRequest> => {
      const headers = await authHeaders.get(request);
      return {
        ...request,
        headers,
      };
    },
    [authHeaders],
  );

  /**
   * Builds package filters based on an array of results.
   *
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
   *
   * @param {Result[]} results - The array of results to build package filters from.
   * @returns {string} - A stringified version of the unique package filters in JSON format.
   */
  const buildPackageFilters = useCallback((results: Result[]): string => {
    // map Result[] into PackageFilter[]
    const packageFilters: PackageFilter[] = results
      .map((result) => {
        if (Object.prototype.hasOwnProperty.call(result, 'path')) {
          let path: string = result.path;
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
  }, []);

  /**
   * Builds the payload of filters to be sent in a form data object.
   *
   * @param {Result[]} results - The results obtained from Content Wizard.
   * @param {PackageProps} packageState - The state of the package.
   * @returns {FormData|null} - The payload of filters in a FormData object or null if packagePath is not set.
   */
  const buildFilterPayload = useCallback(
    (results: Result[], packageState: PackageProps): FormData | null => {
      const { packagePath, packageName, groupName } = packageState;
      if (!packagePath || !packageName || !groupName) {
        return null;
      }
      const formData = new FormData();
      const packageFilters = buildPackageFilters(results);
      formData.append('path', packagePath);
      formData.append('packageName', packageName);
      formData.append('groupName', groupName);
      formData.append('version', '');
      formData.append('description', 'This Content package was built with results found by Content Wizard.');
      formData.append('filter', packageFilters);
      formData.append('_charset_', 'UTF-8');
      console.log('buildFilterPayload() formData: ', formData);
      return formData;
    },
    [buildPackageFilters],
  );

  /**
   * Async function used to build a package request.
   *
   * @param {PackageManagerRequestOptions} props - The package manager request options.
   * @returns {Promise<PackageManagerRequest | null>} - A Promise that resolves with the package manager request or null if there was an error.
   */
  const buildPackageRequest = useCallback(
    async (props: PackageManagerRequestOptions): Promise<PackageManagerRequest | null> => {
      const { action, packageState, formData } = props;
      const { packageName = DEFAULT_PACKAGE_NAME, groupName = DEFAULT_GROUP, packagePath } = packageState ?? {};
      switch (action) {
        case 'create': {
          const request = await appendAuthHeader(packageRequestMap.create);
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
          const request = await appendAuthHeader(packageRequestMap.edit);
          request.body = formData;
          return request;
        }
        case 'build': {
          if (!packagePath) {
            // packagePath is required for this action
            return null;
          }
          const request = await appendAuthHeader(packageRequestMap.build);
          request.endpoint = request.endpoint + packagePath;
          const formData = new FormData();
          formData.append('cmd', 'build');
          request.body = formData;
          return request;
        }
        case 'listGroups': {
          const request = await appendAuthHeader(packageRequestMap.listGroups);
          request.params = {
            ...request.params,
            _dc: `${Date.now()}`,
          };
          return request;
        }
      }
    },
    [appendAuthHeader],
  );

  /**
   * Fetches package groups from AEM.
   *
   * This function sends a request to the server to retrieve a list of groups.
   *
   * @param {Logger} logger - The logger object for logging debug messages.
   * @returns {Promise<string[] | null>} A promise that resolves to an array of group names if successful, `null` otherwise.
   */
  const fetchGroups = useCallback(async (): Promise<string[] | null> => {
    const request = await buildPackageRequest({ action: 'listGroups' });
    logger.debug({ message: 'fetchGroups request: ', request });
    if (request) {
      try {
        const { endpoint, params, headers, method } = request;
        const url = endpoint + (params ? '?' + new URLSearchParams(params).toString() : '');
        const response = await fetch(url, {
          method,
          headers,
        });
        logger.debug({ message: `fetchGroups response`, response });
        if (response.ok) {
          const { groups }: { groups: GroupName[] } = await response.json();
          logger.debug({ message: `fetchGroups json groups`, groups });

          return groups.map(({ name }: GroupName) => name);
        }
      } catch (error) {
        logger.error({ message: 'Error occurred while fetching Package Manager groups.', error });
        throw error;
      }
    }
    return null;
  }, [buildPackageRequest, logger]);

  /**
   * This async function is responsible for building and fetching the request
   * to create a package in CRX PackageManager
   *
   * @param {HandlePackageProps} props - The props to handle the package creation.
   * @returns {Promise<any>} - A promise that resolves to the response JSON object, or null if the request fails.
   */
  const createPackage = useCallback(
    async (props: HandlePackageProps): Promise<unknown> => {
      const request = await buildPackageRequest({ action: 'create', ...props });
      logger.debug({ message: 'createPackage request: ', request });
      if (request) {
        try {
          const { endpoint, params, headers, method, body } = request;
          const url = endpoint + (params ? '?' + new URLSearchParams(params).toString() : '');
          const response = await fetch(url, {
            method,
            headers,
            body,
          });
          logger.debug({ message: 'createPackage response: ', response });
          if (response.ok && response.status === 200) {
            const json: PackageManagerResponse = await response.json();
            logger.debug({ message: 'createPackage json: ', json });
            return json;
          }
        } catch (error) {
          logger.error({ message: 'Error occurred while attempting to create package definition', error });
          throw error;
        }
      }
      return null;
    },
    [buildPackageRequest, logger],
  );

  /**
   * This async function is responsible for building and fetching the request
   * to update/edit the filters for a package in CRX PackageManager
   *
   * @param {HandlePackageProps} props - The properties needed to handle the package.
   * @returns {Promise<any>} - A promise that resolves to the API response data, or null if the edit request failed.
   */
  const editPackageFilters = useCallback(
    async (props: HandlePackageProps): Promise<unknown> => {
      const request = await buildPackageRequest({ action: 'edit', ...props });
      logger.debug({ message: 'editPackageFilter: request ', request });
      if (request) {
        try {
          const { endpoint, params, headers, method, body } = request;
          const url = endpoint + (params ? '?' + new URLSearchParams(params).toString() : '');
          const response = await fetch(url, {
            method,
            headers,
            body,
          });
          logger.debug({ message: 'editPackageFilter response: ', response });
          if (response.ok && response.status === 200) {
            const json: PackageManagerResponse = await response.json();
            logger.debug({ message: 'editPackageFilter json: ', json });
            return json;
          }
        } catch (error) {
          logger.error({ message: 'Error occurred while trying to edit package filters', error });
          throw error;
        }
      }
      return null;
    },
    [buildPackageRequest, logger],
  );

  /**
   * This async function is responsible for building and fetching the request
   * to build a package in CRX PackageManager
   * Packages have to be created before they can be built.
   *
   * @param {HandlePackageProps} props - The handle package props.
   * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating whether the package was successfully built.
   */
  const buildPackage = useCallback(
    async (props: HandlePackageProps): Promise<boolean> => {
      const request = await buildPackageRequest({ action: 'build', ...props });
      logger.debug({ message: 'buildPackage: request ', request });
      if (request) {
        const { endpoint, params, headers, method, body } = request;
        const url = endpoint + (params ? '?' + new URLSearchParams(params).toString() : '');
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
    },
    [buildPackageRequest, logger],
  );

  return useMemo(
    () => ({
      fetchGroups,
      createPackage,
      editPackageFilters,
      buildPackage,
      buildFilterPayload,
    }),
    [buildFilterPayload, buildPackage, createPackage, editPackageFilters, fetchGroups],
  );
};
