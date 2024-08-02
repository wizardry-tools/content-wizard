import { createContext, useCallback, useContext, useMemo } from 'react';
import {
  GroupName,
  HandlePackageProps,
  PackageFilter,
  PackageManagerAction,
  PackageManagerRequest,
  PackageManagerRequestOptions,
  PackageManagerResponse,
  PackageProps,
  PackagingContextProps,
  Result,
} from '@/types';
import { useAuthHeaders } from '@/utility';
import { useLogger } from '../LoggingProvider';

export const PACK_MGR_PATH = '/crx/packmgr';
export const DEFAULT_GROUP = 'my_packages';
export const DEFAULT_PACKAGE_NAME = 'Content-Wizard-Results-Content-Package';
export const PATH_DELIMITER = '/jcr:content';

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

export const initialPackage: PackageProps = {
  packageName: DEFAULT_PACKAGE_NAME,
  groupName: DEFAULT_GROUP,
  packagePath: '',
  packageUrl: '',
  downloadUrl: '',
  isReady: false,
};

export const PackagingContext = createContext<PackagingContextProps>(null!);

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
 */
export const usePackageHandler = () => {
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
  const buildPackageFilters: (results: Result[]) => string = useCallback((results) => {
    // map Result[] into PackageFilter[]
    const packageFilters: PackageFilter[] = results
      .map((result) => {
        if ('path' in result) {
          let path: string = result.path as string;
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
    return JSON.stringify(uniquePackageFilters);
  }, []);

  /**
   * Builds the payload of filters to be sent in a form data object.
   *
   * @param {Result[]} results - The results obtained from Content Wizard.
   * @param {PackageProps} packageState - The state of the package.
   * @returns {FormData|null} - The payload of filters in a FormData object or null if packagePath is not set.
   */
  const buildFilterPayload: (results: Result[], packageState: PackageProps) => null | FormData = useCallback(
    (results, packageState) => {
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
  const buildPackageRequest: (props: PackageManagerRequestOptions) => Promise<PackageManagerRequest | null> =
    useCallback(
      async (props) => {
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
   * @returns {Promise<string[] | null>} A promise that resolves to an array of group names if successful, `null` otherwise.
   */
  const fetchGroups: () => Promise<string[] | null> = useCallback(async (): Promise<string[] | null> => {
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
  const createPackage: (props: HandlePackageProps) => Promise<PackageManagerResponse | null> = useCallback(
    async (props) => {
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
  const editPackageFilters: (props: HandlePackageProps) => Promise<PackageManagerResponse | null> = useCallback(
    async (props) => {
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
  const buildPackage: (props: HandlePackageProps) => Promise<boolean> = useCallback(
    async (props) => {
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
