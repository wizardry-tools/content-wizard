import {getQueryType, graphQLQueryBuilder} from "./GraphQLQueryBuilder";
import {GraphQLAPI, GraphQLEndpointConfig} from "../types/QueryTypes";

export const AEM_GRAPHQL_ACTIONS = {
  persist: 'graphql/persist.json',
  execute: 'graphql/execute.json',
  list: 'graphql/list.json',
  endpoint: 'content/cq:graphql/global/endpoint.json',
  serviceURL: '/',
  endpointConfig: '/libs/cq/graphql/sites/wizard/_jcr_content/explorer/content/items/wizardconfig.json'
}


export const AEM_GRAPHQL_TYPES = {
  BY_PATH: 'ByPath',
  LIST: 'List',
  PAGINATED: 'Paginated'
}



/**
 * simple string to base64 implementation
 *
 * @private
 * @param {string} str
 */
const __str2base64 = (str: string) => {
  if (typeof btoa === 'function') {
    return btoa(str)
  } else {
    return Buffer.from(str, 'utf8').toString('base64')
  }
}

/**
 * Removes first / in a path
 *
 * @private
 * @param {string} path
 * @returns {string} path
 */
const __getPath = (path: string) => {
  return path[0] === '/' ? path.substring(1) : path
}

/**
 * Add last / in domain
 *
 * @private
 * @param {string} domain
 * @returns {string} valid domain
 */
const __getDomain = (domain: string) => {
  return domain[domain.length - 1] === '/' ? domain : `${domain}/`
}

/**
 * Check valid url or absolute path
 *
 * @private
 * @param {string} url
 * @returns void
 */
const __validateUrl = (url: string) => {
  const fullUrl = url[0] === '/' ? `https://domain${url}` : url

  try {
    new URL(fullUrl) // eslint-disable-line
  } catch (e) {
    console.error(`Invalid URL/path: ${url}`);
  }
}

/**
 * get Browser Fetch instance
 *
 * @private
 * @returns {object} fetch instance
 */
const __getBrowserFetch = ():any | null => {
  if (typeof window !== 'undefined') {
    return window.fetch.bind(window)
  }

  // eslint-disable-next-line no-restricted-globals
  if (typeof self !== 'undefined') {
    return self.fetch.bind(self) // eslint-disable-line
  }

  return null
}

/**
 * get Fetch instance
 *
 * @private
 * @param {object} [fetch]
 * @returns {object} fetch instance
 */
const __getFetch = (fetch:any):any => {
  if (!fetch) {
    const browserFetch = __getBrowserFetch()
    if (!browserFetch) {
      console.error('Required param missing: config.fetch');
    }

    return browserFetch
  }

  return fetch
}

/**
 * Returns Authorization GlobalNav value.
 *
 * @private
 * @param {string|array} auth - Bearer token string or [user,pass] pair array
 * @returns {string} Authorization GlobalNav value
 */
const __getAuthHeader = (auth: string|string[]) => {
  //let authType = 'Bearer'
  let authToken = auth
  // If auth is user, password` pair
  if (Array.isArray(auth) && auth[0] && auth[1]) {
    //authType = 'Basic'
    authToken = __str2base64(`${auth[0]}:${auth[1]}`)
  }

  return `${authToken}`
}

/**
 * This class provides methods to call AEM GraphQL APIs.
 * Before calling any method initialize the instance
 * with GraphQL endpoint, GraphQL serviceURL and auth if needed
 */
export default class ClientService {
  auth: string|string[];
  headers: any;
  serviceURL: string;
  endpoint: string;
  fetch: any;
  /**
   * Constructor.
   *
   * If param is a string, it's treated as AEM server URL, default GraphQL endpoint is used.
   * For granular params, use config object
   *
   * @param {string|object} config - Configuration object, or AEM server URL string
   * @param {string} [config.serviceURL] - AEM server URL
   * @param {string} [config.endpoint] - GraphQL endpoint
   * @param {(string|Array)} [config.auth] - Bearer token string or [user,pass] pair array
   * @param {object} [config.headers] - header { name: value, name: value, ... }
   * @param {object} [config.fetch] - custom Fetch instance
   */
  constructor (config: any) {
    let endpoint = AEM_GRAPHQL_ACTIONS.endpoint
    let serviceURL = AEM_GRAPHQL_ACTIONS.serviceURL

    if (typeof config === 'string') {
      serviceURL = config
      this.auth = '';
      this.headers = '';
    } else {
      serviceURL = config.serviceURL || serviceURL
      endpoint = config.endpoint || endpoint
      this.auth = config.auth
      this.headers = config.headers
    }

    this.serviceURL = __getDomain(serviceURL)
    this.endpoint = __getPath(endpoint)
    this.fetch = __getFetch(config.fetch)
  }

  /**
   * Returns valid url.
   *
   * @param {string} domain
   * @param {string} path
   * @returns {string} valid url
   */
  getEndpointUrl({domain = this.serviceURL, path = this.endpoint}:Record<string,string>):string {
    return `${domain}${path}`
  }

  /**
   * Returns a Promise that resolves with a POST request JSON data.
   *
   * @param {string|object} body - the query string or an object with query (and optionally variables) as a property
   * @param {object} [options={}] - additional POST request options
   * @param {object} [retryOptions={}] - retry options for @adobe/aio-lib-core-networking
   * @returns {Promise<any>} - the response body wrapped inside a Promise
   */
  async runQuery (body:string|any, options:any = {}, retryOptions:any = {}):Promise<any> {
    const postBody = typeof body === 'object' ? body : { query: body }
    return this.__handleRequest(this.endpoint, JSON.stringify(postBody), options, retryOptions)
  }

  /**
   * Returns a Promise that resolves with a PUT request JSON data.
   *
   * @param {string} query - the query string
   * @param {string} path - AEM path to save query, format: configuration_name/endpoint_name
   * @param {object} [options={}] - additional PUT request options
   * @param {object} [retryOptions={}] - retry options for @adobe/aio-lib-core-networking
   * @returns {Promise<any>} - the response body wrapped inside a Promise
   */
  async persistQuery (query:string, path:string, options:any = {}, retryOptions:any = {}):Promise<any> {
    const url = `${AEM_GRAPHQL_ACTIONS.persist}/${path}`
    return this.__handleRequest(url, query, { method: 'PUT', ...options }, retryOptions)
  }

  /**
   * Returns a Promise that resolves with a GET request JSON data.
   *
   * @param {string} apiId - Optional API string to filter Persisted Queries by API
   * @param {object} [options={}] - additional GET request options
   * @param {object} [retryOptions={}] - retry options for @adobe/aio-lib-core-networking
   * @returns {Promise<any>} - the response body wrapped inside a Promise
   */
  async listPersistedQueries (apiId?: string,options:any = {}, retryOptions:any = {}):Promise<GraphQLEndpointConfig[]> {
    const url = !!apiId ? `${AEM_GRAPHQL_ACTIONS.list}/${apiId}` : `${AEM_GRAPHQL_ACTIONS.list}`;
    return this.__handleRequest(url, '', { method: 'GET', ...options }, retryOptions);
  }

  async getGraphQLAPIs(options:any = {}, retryOptions:any = {}):Promise<GraphQLAPI[]> {
    let response = await this.listPersistedQueries('', options, retryOptions);
    if (response) {
      return this.mapAPIs(response);
    }
    return [];
  }

  mapAPIs = (response: GraphQLEndpointConfig[]):GraphQLAPI[] => {
    return response?.map(this.configToAPI);
  }

  configToAPI(config: GraphQLEndpointConfig):GraphQLAPI {
    return {
      endpoint: config.configurationName,
      persistedQueries: config.queries
    }
  }

  /**
   * Returns a Promise that resolves with a GET request JSON data.
   *
   * @param {string} path - AEM path for persisted query, format: configuration_name/endpoint_name
   * @param {object} [variables={}] - query variables
   * @param {object} [options={}] - additional GET request options
   * @param {object} [retryOptions={}] - retry options for @adobe/aio-lib-core-networking
   * @returns {Promise<any>} - the response body wrapped inside a Promise
   */

  async runPersistedQuery (path:string, variables:any = {}, options:any = {}, retryOptions:any = {}):Promise<any> {
    const method = (options.method || 'GET').toUpperCase()
    let body = ''
    let variablesString = encodeURIComponent(Object.keys(variables).map(key => {
      const val = (typeof variables[key] === 'string') ? variables[key] : JSON.stringify(variables[key])
      return `;${key}=${val}`
    }).join(''))

    if (method === 'POST') {
      body = JSON.stringify({ variables })
      variablesString = ''
    }

    const url = `${AEM_GRAPHQL_ACTIONS.execute}/${path}${variablesString}`
    return this.__handleRequest(url, body, { method, ...options }, retryOptions)
  }

  /**
   * Returns a Generator Function.
   *
   * @generator
   * @param {string} model - contentFragment model name
   * @param {string} fields - The query string for item fields
   * @param {ModelConfig} [config={}] - Pagination config
   * @param {ModelArgs} [args={}] - Query arguments
   * @param {object} [options={}] - additional POST request options
   * @param {object} [retryOptions={}] - retry options for @adobe/aio-lib-core-networking
   * @yields {null | Promise<object | Array>} - the response items wrapped inside a Promise
   */
  async * runPaginatedQuery (model:string, fields:string, config:any = {}, args:any = {}, options:any, retryOptions:any):AsyncGenerator<Promise<any | any[]>> {
    if (!model || !fields) {
      console.error('Required param missing: @param {string} fields - query string for item fields');
    }

    let isInitial = true
    let hasNext = true
    let after = args.after || ''
    const limit = args.limit
    const size = args.first || limit
    let pagingArgs = args
    while (hasNext) {
      const offset = pagingArgs.offset || 0
      if (!isInitial) {
        pagingArgs = this.__updatePagingArgs(args, { offset, limit, after })
      }

      isInitial = false

      const { query, type } = this.buildQuery(model, fields, config, pagingArgs)
      const { data } = await this.runQuery(query, options, retryOptions)

      let filteredData:any = {}
      try {
        filteredData = this.__filterData(model, type, data, size)
      } catch (e:any) {
        console.error(`Error while filtering response data. ${e.message}`);
      }

      hasNext = filteredData.hasNext
      after = filteredData.endCursor

      yield filteredData.data
    }
  }

  /**
   * Builds a GraphQL query string for the given parameters.
   *
   * @param {string} model - contentFragment Model Name
   * @param {string} fields - The query string for item fields
   * @param {ModelConfig} [config={}] - Pagination config
   * @param {ModelArgs} [args={}] - Query arguments
   * @returns {QueryBuilderResult} - object with The GraphQL query string and type
   */
  buildQuery (model:string, fields:string, config:any, args:any = {}):any {
    return graphQLQueryBuilder(model, fields, config, args)
  }

  /**
   * Returns the updated paging arguments based on the current arguments and the response data.
   *
   * @private
   * @param {object} args - The current paging arguments.
   * @param {object} data - Current page arguments.
   * @param {string} data.after - The cursor to start after.
   * @param {number} data.offset - The offset to start from.
   * @param {number} [data.limit = 10] - The maximum number of items to return per page.
   * @returns {object} The updated paging arguments.
   */
  __updatePagingArgs (args:any = {}, { after, offset, limit = 10 }:{after:string,offset:number,limit:number}):any {
    const queryType = getQueryType(args)
    const pagingArgs = { ...args }
    if (queryType === AEM_GRAPHQL_TYPES.LIST) {
      pagingArgs.offset = offset + limit
    }

    if (queryType === AEM_GRAPHQL_TYPES.PAGINATED) {
      pagingArgs.after = after
    }

    return pagingArgs
  }

  /**
   * Returns items list and paging info.
   *
   * @private
   * @param {string} model - contentFragment model name
   * @param {string} type - model query type: byPath, List, Paginated
   * @param {object} data - raw response data
   * @param {number} size - page size
   * @returns {object} - object with filtered data and paging info
   */
  __filterData (model:string, type:string, data:any, size:number = 0) {
    let response
    let filteredData
    let hasNext
    let endCursor
    let len
    switch (type) {
      case AEM_GRAPHQL_TYPES.BY_PATH:
        filteredData = data[`${model}${type}`].item
        hasNext = false
        break
      case AEM_GRAPHQL_TYPES.PAGINATED:
        response = data[`${model}${type}`]
        filteredData = response.edges.map((item:any):any => item.node)
        len = (filteredData && filteredData.length) || 0
        hasNext = response.pageInfo.hasNextPage && len > 0 && len >= size
        endCursor = response.pageInfo.endCursor
        break
      default:
        filteredData = data[`${model}${type}`].items
        len = (filteredData && filteredData.length) || 0
        hasNext = len > 0 && len >= size
    }

    return {
      data: filteredData,
      hasNext,
      endCursor
    }
  }

  /**
   * Returns an object for Request options
   *
   * @private
   * @param {string} [body] - Request body (the query string)
   * @param {object} [options] Additional Request options
   * @returns {object} the Request options object
   */
  __getRequestOptions (body:string, options:any) {
    const { method = 'POST' } = options

    const requestOptions: {
      [name: string]: Record<string,string> | string;
      headers: Record<string, string>;
    } = {
      headers: {
        'Content-Type': 'application/json'
      }
    }

    if (this.headers) {
      requestOptions.headers = {
        ...this.headers,
        ...requestOptions.headers
      }
    }

    if (this.auth) {
      requestOptions.headers = {
        ...requestOptions.headers,
        'Authorization': __getAuthHeader(this.auth)
      }
      requestOptions.credentials = 'same-origin'
    }

    return {
      method,
      ...body ? { body } : {},
      ...requestOptions,
      ...options
    }
  }

  /**
   * Returns a Promise that resolves with a PUT request JSON data.
   *
   * @private
   * @param {string} endpoint - Request endpoint
   * @param {string} [body=''] - Request body (the query string)
   * @param {object} [options={}] - Request options
   * @param {object} [retryOptions={}] - retry options for @adobe/aio-lib-core-networking
   * @returns {Promise<any>} the response body wrapped inside a Promise
   */
  async __handleRequest (endpoint:string, body:string, options:any, retryOptions:any):Promise<any> {
    const requestOptions = this.__getRequestOptions(body, options)
    const url = this.getEndpointUrl({domain: this.serviceURL, path: endpoint})
    __validateUrl(url)

    let response
    // 1. Handle Request
    try {
      response = await this.fetch(url, requestOptions, retryOptions)
    } catch (error:any) {
      // 1.1 Request error: general
      console.error( error.message);
    }

    let apiError
    // 2. Handle Response error
    if (!response.ok) {
      try {
        // 2.1 Check if custom error is returned
        apiError = await response.json()
      } catch (error:any) {
        // 2.3 Response error: Couldn't parse JSON - no error defined in API response
        console.error(error.message);
      }
    }

    if (apiError) {
      // 2.2 Response error: JSON parsed - valid error defined in API response
      console.error(apiError);
    }
    // 3. Handle ok response
    let data:any
    try {
      data = await response.json()
    } catch (error:any) {
      // 3.2. Response ok: Data error - Couldn't parse the JSON from OK response
      console.error(error.message);
    }
    // 3.2. Response ok: containing errors info
    if (data && data.errors) {
      console.error(
        data.errors.map((error:any) => error.message).join('. ')
      );
    }

    return data
  }
}
