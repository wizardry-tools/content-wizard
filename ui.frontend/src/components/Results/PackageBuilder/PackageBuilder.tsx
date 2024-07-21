import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Logger, useAlertDispatcher, useLogger, useResults } from 'src/providers';
import { getAuthorizationHeaders } from 'src/utility';
import { Result } from '../index';
import { Autocomplete, Button, CircularProgress, Paper, Stack, TextField, Typography } from '@mui/material';
import AddBoxIcon from '@mui/icons-material/AddBox';
import ConstructionIcon from '@mui/icons-material/Construction';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import { FormGrid } from 'src/components/QueryWizard/Components';

import './PackageBuilder.scss';
import { useRenderCount } from 'src/utility';

const PACK_MGR_PATH = '/crx/packmgr';
const DEFAULT_GROUP = 'my_packages';
const DEFAULT_PACKAGE_NAME = 'Content-Wizard-Results-Content-Package';
const PATH_DELIMITER = '/jcr:content';

export type PackageFilterRule = {
  modifier: 'include' | 'exclude';
  pattern: string;
};
export type PackageFilter = {
  root: string;
  rules: PackageFilterRule[];
};
export type GroupName = {
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

/**
 * This component controls all Packaging logic.
 *
 * Sequence:
 *    1. Create Package
 *    2. Define Package Filters
 *    3. Build Package
 *    4. Download Package
 *
 * @constructor
 */
export const PackageBuilder = () => {
  const logger = useLogger();
  const renderCount = useRenderCount();
  logger.debug({ message: `PackageBuilder[${renderCount}] render()` });
  const alertDispatcher = useAlertDispatcher();
  const [groups, setGroups] = useState([] as string[]);
  const [isCreating, setIsCreating] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [packageName, setPackageName] = useState(DEFAULT_PACKAGE_NAME);
  const [groupName, setGroupName] = useState(DEFAULT_GROUP);
  const [packagePath, setPackagePath] = useState('');
  const [packageReady, setPackageReady] = useState(false);
  const [focusTarget, setFocusTarget] = useState('');
  const { results } = useResults();

  // When the packagePath is available, a packageUrl is generated
  const packageUrl = useMemo(() => {
    // /crx/packmgr/index.jsp#/etc/packages/my_packages/Content-Wizard-Results-Content-Package.zip
    if (packagePath) {
      return `${PACK_MGR_PATH}/index.jsp#${packagePath}`;
    }
    return '';
  }, [packagePath]);

  // When the packagePath is available, a downloadUrl is generated
  const downloadUrl = useMemo(() => {
    if (packagePath) {
      const params = {
        _charset_: 'utf-8',
        path: packagePath,
      };
      const queryString = new URLSearchParams(params);
      return `${PACK_MGR_PATH}/download.jsp?${queryString}`;
    }
    return '';
  }, [packagePath]);

  // a callback that we use to build the 'filter' Payload from package info and Result[]
  const createFilterPayload = useCallback(
    (packagePath: string): FormData => {
      return buildFilterPayload(results, packagePath, packageName, groupName);
    },
    [groupName, packageName, results],
  );

  // simple callback that handles user input for packageName
  const handleNameChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setPackageName(event.target.value);
    // reset any package props if the user renames the package...
    setPackagePath('');
    setPackageReady(false);
  }, []);

  // simple callback that handles user input for groupName
  const handleGroupChange = useCallback((_event: any, newValue: string | null) => {
    if (newValue) {
      setGroupName(newValue);
      // reset any package props if the user names a different group...
      setPackagePath('');
      setPackageReady(false);
    }
  }, []);

  /**
   * This callback is called when the create package button is clicked.
   * It will call a sequence of async functions that will create a Package in CRX PackageManager
   * if one does not already exist, and then update that package with the full list
   * of content filters, determined by the Result[].
   *
   * Upon success, the packagePath state will be set.
   */
  const handleCreate = useCallback(() => {
    // issue the create action
    setIsCreating(true);
    (async () => {
      const { path, success, msg } = await createPackage({ packageName, groupName, logger });
      if (success && path) {
        // create multipart formData
        const formData = createFilterPayload(path);
        // issue the edit action
        const editResponse = await editPackageFilters({ formData, packageName, groupName, logger });
        if (editResponse?.path) {
          // even though packagePath and path are the same, only set it after editPackageFilters has been successful
          setPackagePath(editResponse.path);
        } else {
          if (editResponse?.msg) {
            alertDispatcher({
              severity: 'error',
              message: `Could not Update Package: [${msg}]`,
              caller: PackageBuilder,
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
            caller: PackageBuilder,
          });
        } else {
          logger.warn({ message: 'Warning, could not create Package, bad response' });
        }
      }
      setIsCreating(false);
    })();
  }, [packageName, groupName, logger, createFilterPayload, alertDispatcher]);

  /**
   * This callback is called when the build package button is clicked.
   * It will call an async function that tells CRX PackageManager to build the
   * given Package.
   *
   * Upon success, the packageReady state will be set to true.
   */
  const handleBuild = useCallback(() => {
    setIsBuilding(true);
    (async () => {
      const buildResponse = await buildPackage({ packagePath, logger });
      if (buildResponse) {
        logger.debug({ message: 'buildPackage buildResponse success', buildResponse });
        // once packageReady === true, further package functions are disabled until the dialog is remounted.
        setPackageReady(true);
      } else {
        logger.debug({ message: 'buildPackage failed to build' });
        alertDispatcher({
          severity: 'error',
          message: `Error, could not build the content Package [${packagePath}]. Something went wrong.`,
          caller: PackageBuilder,
        });
      }

      setIsBuilding(false);
    })();
  }, [alertDispatcher, logger, packagePath]);

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

  const disableAll = useMemo(() => isCreating || isBuilding, [isCreating, isBuilding]);

  return (
    <div className="package-builder">
      <Stack className={`package-builder-stack`} component={Paper} color={'secondary'}>
        <FormGrid item>
          <Paper elevation={focusTarget === 'packageName' ? 4 : 1}>
            <TextField
              id={'package-builder-package-name'}
              name={'package-builder-package-name'}
              label={'Package Name'}
              value={packageName}
              color={'secondary'}
              fullWidth
              className="package-builder-field"
              onFocus={() => setFocusTarget('packageName')}
              onBlur={() => setFocusTarget('')}
              onChange={handleNameChange}
              required
              disabled={disableAll}
            />
          </Paper>
        </FormGrid>
        <FormGrid item>
          <Paper elevation={focusTarget === 'groupName' ? 4 : 1}>
            <Autocomplete
              id={'package-builder-package-group'}
              value={groupName}
              onChange={handleGroupChange}
              fullWidth
              clearOnEscape
              freeSolo
              autoHighlight
              autoSelect
              disabled={disableAll}
              renderInput={(params) => (
                <TextField
                  name={'package-builder-package-group'}
                  label={'Package Group'}
                  color={'secondary'}
                  className="package-builder-field"
                  onFocus={() => setFocusTarget('groupName')}
                  onBlur={() => setFocusTarget('')}
                  required
                  {...params}
                />
              )}
              options={groups}
            />
          </Paper>
        </FormGrid>
        {packagePath && !packageReady && !disableAll && (
          <FormGrid item>
            <Typography>Package has been Created. Ready to build.</Typography>
          </FormGrid>
        )}
        {packagePath && packageReady && !disableAll && (
          <FormGrid item>
            <Typography>Package has been Built. Ready to download.</Typography>
          </FormGrid>
        )}
        {disableAll && (
          <FormGrid item alignItems={'center'}>
            <CircularProgress />
          </FormGrid>
        )}
        <FormGrid item>
          {!packagePath && (
            <FormGrid mt={1}>
              <Button
                onClick={handleCreate}
                color={'secondary'}
                startIcon={<AddBoxIcon />}
                variant={'contained'}
                disabled={disableAll || !packageName}
              >
                Create Content Package
              </Button>
            </FormGrid>
          )}
          {packagePath && !packageReady && (
            <FormGrid mt={1}>
              <Button
                onClick={handleBuild}
                color={'secondary'}
                startIcon={<ConstructionIcon />}
                variant={'contained'}
                disabled={disableAll}
              >
                Build Content Package
              </Button>
            </FormGrid>
          )}
          {packageUrl && (
            <FormGrid mt={1}>
              <Button
                href={packageUrl}
                target="_blank"
                color={'secondary'}
                startIcon={<VisibilityIcon />}
                variant={'contained'}
                disabled={disableAll}
              >
                View Package
              </Button>
            </FormGrid>
          )}
          {packageReady && (
            <FormGrid mt={1}>
              <Button
                href={downloadUrl}
                download
                color={'secondary'}
                startIcon={<DownloadIcon />}
                variant={'contained'}
                disabled={disableAll || !packageReady}
              >
                Download Package Now
              </Button>
            </FormGrid>
          )}
        </FormGrid>
      </Stack>
    </div>
  );
};

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
  return JSON.stringify(uniquePackageFilters);
}

export function buildFilterPayload(
  results: Result[],
  packagePath: string,
  packageName: string,
  groupName: string,
): FormData {
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
  packageName?: string;
  groupName?: string;
  packagePath?: string;
  formData?: FormData;
};
async function buildPackageRequest(props: PackageManagerRequestOptions): Promise<PackageManagerRequest | null> {
  const { action, packageName = DEFAULT_PACKAGE_NAME, groupName = DEFAULT_GROUP, packagePath, formData } = props;
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
