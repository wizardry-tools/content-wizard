import { DYNAMIC_HEADERS } from './http';

export type CSRFToken = Awaited<ReturnType<typeof getCsrfToken>>;

export const getCsrfToken = async (): Promise<string> => {
  const response = await fetch('/libs/granite/csrf/token.json', DYNAMIC_HEADERS);
  const json = await response.json();
  return json.token;
};
