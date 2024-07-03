import {DYNAMIC_HEADERS} from ".";

export const getCsrfToken = async ():Promise<string> => {
  const response = await fetch('/libs/granite/csrf/token.json', DYNAMIC_HEADERS);
  const json = await response.json();
  return json.token;
}
