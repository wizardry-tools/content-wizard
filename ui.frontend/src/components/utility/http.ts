import {Query, QueryLanguage, QueryLanguageKey, QueryLanguageLookup} from "../Query";

/**
 * The AUTH_TOKEN exists for dev builds
 */
const AUTH_TOKEN = process.env.REACT_APP_AEM_AUTHORIZATION_HEADER as string;

export const DYNAMIC_HEADERS = ((): RequestInit =>{
  return (AUTH_TOKEN && {
    credentials: 'same-origin',
    headers: {
      'Authorization': AUTH_TOKEN
    }
  }) || {}
})();

export function getParams(query: Query): Record<string,string> {
  if (query.language === QueryLanguageLookup[QueryLanguage.SQL]) {
    return {
      '_charset_': 'utf-8',
      type: 'sql',
      showResults: 'true',
      stmt: query.statement
    }
  } else if (query.language === QueryLanguageLookup[QueryLanguage.JCR_SQL2] as QueryLanguageKey) {
    return {
      '_charset_': 'utf-8',
      type: 'JCR-SQL2',
      showResults: 'true',
      stmt: query.statement
    }
  } else if (query.language === QueryLanguageLookup[QueryLanguage.XPATH]) {
    return {
      '_charset_': 'utf-8',
      type: 'xpath',
      showResults: 'true',
      stmt: query.statement
    }
  } else if (query.language === QueryLanguageLookup[QueryLanguage.QueryBuilder]) {
    return queryToParams(query.statement);
  }
  return {};
}

export const queryToParams = (query: string) => {
  let o:{[name: string]: string} = {};

  const replacer = (match: string, s1: string, s2: string) => {
    o[s1] = s2;
    return match; //forced to return string because of string.replace()
  };

  query.split(/\n/).forEach( (line) => {
    // maybe use something besides replace that forces a string return
    line.replace(/([\w\W]*?)=([\w\W]*)/, replacer);
  });
  return o;
}