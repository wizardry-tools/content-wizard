/**
 * The AUTH_TOKEN exists for dev builds
 */
const AUTH_TOKEN = process.env.REACT_APP_AEM_AUTHORIZATION_HEADER as string;

/**
 * Builds HTTP Fetch options that are needed for local development.
 */
export const DYNAMIC_HEADERS = ((): RequestInit => {
  return (
    (AUTH_TOKEN && {
      credentials: 'same-origin',
      headers: {
        Authorization: AUTH_TOKEN,
      },
    }) ||
    {}
  );
})();

export type GetParamsProps = {
  language: string;
  statement: string;
};
/**
 * Takes a language and statement as {string}s, then constructs a {Record<string,string>} to represent
 * a param object for HTTP fetch
 * @param query
 */
export function getParams({ language, statement }: GetParamsProps): Record<string, string> {
  switch (language) {
    case 'SQL': {
      return {
        _charset_: 'utf-8',
        type: 'sql',
        showResults: 'true',
        stmt: statement,
      };
    }
    case 'JCR_SQL2': {
      return {
        _charset_: 'utf-8',
        type: 'JCR-SQL2',
        showResults: 'true',
        stmt: statement,
      };
    }
    case 'XPATH': {
      return {
        _charset_: 'utf-8',
        type: 'xpath',
        showResults: 'true',
        stmt: statement,
      };
    }
    case 'QueryBuilder': {
      return queryToParams(statement);
    }
    default: {
      return {};
    }
  }
}

/**
 * Takes a query string {string} and builds {Record<string,string>} to represent
 * a param object for HTTP fetch
 * @param statement
 */
export const queryToParams = (statement: string) => {
  let o: { [name: string]: string } = {};

  const replacer = (match: string, s1: string, s2: string) => {
    o[s1] = s2;
    return match; //forced to return string because of string.replace()
  };

  statement.split(/\n/).forEach((line) => {
    // maybe use something besides replace that forces a string return
    line.replace(/([\w\W]*?)=([\w\W]*)/, replacer);
  });
  return o;
};

export const escapeColon = (path: string) => {
  return path.replace(':', '%3A');
};

export const escapeUrl = (path: string) => {
  return encodeURIComponent(path);
};
