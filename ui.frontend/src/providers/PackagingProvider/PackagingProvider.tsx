import { useCallback, useEffect, useMemo, useState } from 'react';
import type { JSX, PropsWithChildren } from 'react';
import { useObjectState, useRenderCount } from '@/utility';
import { useLogger } from '../LoggingProvider';
import { useAlertDispatcher } from '../WizardAlertProvider';
import { useResults } from '../ResultsProvider';
import { initialPackage, PackagingContext, PACK_MGR_PATH, usePackageHandler } from './context';

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
    setIsCreating(true);
    createPackage({ packageState })
      .then((createResponse) => {
        const { path, success, msg } = createResponse ?? {};
        if (success && path) {
          // create multipart formData
          const formData = createFilterPayload(path);
          if (!formData) {
            alertDispatcher({
              severity: 'error',
              message: `Could not Update Package, unable to create Filters: [${msg}]`,
            });
            setIsCreating(false);
            return;
          }
          // issue the edit action
          editPackageFilters({ formData, packageState })
            .then((editResponse) => {
              if (editResponse?.path) {
                // even though packagePath and path are the same, only set it after editPackageFilters has been successful
                setPackagePath(editResponse.path);
              } else {
                if (editResponse?.msg) {
                  alertDispatcher({
                    severity: 'error',
                    message: `Could not Update Package: [${msg}]`,
                  });
                } else {
                  logger.warn({ message: 'Warning, could not edit Package, bad response:', editResponse });
                }
              }
            })
            .catch((error) => {
              console.error('An Error occurred while editing content Package Filters', error);
            });
        } else {
          if (msg) {
            alertDispatcher({
              severity: 'error',
              message: `Package [${msg}] Already exists`,
            });
          } else {
            logger.warn({ message: 'Warning, could not create Package, bad response' });
          }
        }
      })
      .catch((error) => {
        console.error('An Error occurred while creating content Package', error);
      });
    setIsCreating(false);
  }, [createPackage, packageState, logger, createFilterPayload, editPackageFilters, alertDispatcher, setPackagePath]);

  /**
   * This callback is called when the build package button is clicked.
   * It will call an async function that tells CRX PackageManager to build the
   * given Package.
   *
   * Upon success, the isPackageReady state will be set to true.
   */
  const build = useCallback(() => {
    setIsBuilding(true);
    buildPackage({ packageState })
      .then((buildResponse) => {
        if (buildResponse) {
          logger.debug({ message: 'buildPackage buildResponse success', buildResponse });
          // once isPackageReady === true, further package functions are disabled until the dialog is remounted.
          setPackageState({
            isReady: true,
          });
        } else {
          logger.debug({ message: 'buildPackage failed to build' });
          alertDispatcher({
            severity: 'error',
            message: `Error, could not build the content Package [${packageState.packagePath}]. Something went wrong.`,
          });
        }
      })
      .catch((error) => {
        console.error('An Error occurred while building the content Package', error);
      });
    setIsBuilding(false);
  }, [alertDispatcher, buildPackage, logger, packageState, setPackageState]);

  /**
   * This useEffect is responsible for fetching the list of Package Groups,
   * running once when the component mounts
   */
  useEffect(() => {
    fetchGroups()
      .then((groups) => {
        if (groups) {
          setGroups(groups);
        }
      })
      .catch((error) => {
        console.error('An Error occurred while processing Package Groups', error);
      });
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
