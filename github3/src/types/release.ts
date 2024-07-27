export type Release = {
  name: string;
  html_url: string;
};
export type ReleaseResponse = Release[];

export type ReleaseInfo = Pick<Release, 'name'> & {
  url: string;
};
