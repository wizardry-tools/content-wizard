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
  body?: FormData | URLSearchParams;
};
export type PackageManagerResponse = {
  success: boolean;
  msg: string;
  path?: string;
};

export type PackageProps = {
  packageName?: string;
  groupName?: string;
  packagePath?: string;
  packageUrl?: string;
  downloadUrl?: string;
  isReady?: boolean;
};

export type PackageManagerRequestOptions = {
  action: PackageManagerAction;
  packageState?: PackageProps;
  formData?: FormData;
};
export type HandlePackageProps = Omit<PackageManagerRequestOptions, 'action'>;
// export type PackageHandlerFunction =
//   | (() => Promise<unknown>)
//   | ((props: HandlePackageProps) => Promise<unknown>)
//   | ((results: Result[], packageState: PackageProps) => FormData | null);

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
export type PackagingContextProps = {
  groups: string[];
  isCreating: boolean;
  isBuilding: boolean;
  setPackageName: (packageName: string) => void;
  setGroupName: (groupName: string) => void;
  create: () => void;
  build: () => void;
  packageState: PackageProps;
};

export type PackageBuilderDialogProps = {
  closeHandler: () => void;
  open: boolean;
};
