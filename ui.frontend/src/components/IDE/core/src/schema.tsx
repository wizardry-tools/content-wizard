import { FetcherOpts, fetcherReturnToPromise, formatError, formatResult, isPromise } from '@graphiql/toolkit';
import {
  buildClientSchema,
  getIntrospectionQuery,
  GraphQLError,
  GraphQLSchema,
  IntrospectionQuery,
  validateSchema,
} from 'graphql';
import { ReactNode, RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useEditorContext } from './editor';
import { createContextHook, createNullableContext } from './utility/context';
import { useAlertDispatcher, useFetcher, useLogger, useQuery } from 'src/providers';
import { QueryLanguage } from '../../../Query';

type MaybeGraphQLSchema = GraphQLSchema | null | undefined;

export type SchemaContextType = {
  /**
   * Stores an error raised during introspecting or building the GraphQL schema
   * from the introspection result.
   */
  fetchError: string | null;
  /**
   * Trigger building the GraphQL schema. This might trigger an introspection
   * request if no schema is passed via props and if using a schema is not
   * explicitly disabled by passing `null` as value for the `schema` prop. If
   * there is a schema (either fetched using introspection or passed via props)
   * it will be validated, unless this is explicitly skipped using the
   * `dangerouslyAssumeSchemaIsValid` prop.
   */
  introspect(): void;
  /**
   * If there currently is an introspection request in-flight.
   */
  isFetching: RefObject<boolean>;
  /**
   * The current GraphQL schema.
   */
  schema: MaybeGraphQLSchema;
  /**
   * A list of errors from validating the current GraphQL schema. The schema is
   * valid if and only if this list is empty.
   */
  validationErrors: readonly GraphQLError[];
};

export const SchemaContext = createNullableContext<SchemaContextType>('SchemaContext');

export type SchemaContextProviderProps = {
  children: ReactNode;
  /**
   * This prop can be used to skip validating the GraphQL schema. This applies
   * to both schemas fetched via introspection and schemas explicitly passed
   * via the `schema` prop.
   *
   * IMPORTANT NOTE: Without validating the schema, GraphiQL and its components
   * are vulnerable to numerous exploits and might break. Only use this prop if
   * you have full control over the schema passed to GraphiQL.
   *
   * @default false
   */
  dangerouslyAssumeSchemaIsValid?: boolean;
  /**
   * Invoked after a new GraphQL schema was built. This includes both fetching
   * the schema via introspection and passing the schema using the `schema`
   * prop.
   * @param schema The GraphQL schema that is now used for GraphiQL.
   */
  onSchemaChange?(schema: GraphQLSchema): void;
} & IntrospectionArgs;

export function SchemaContextProvider(props: SchemaContextProviderProps) {
  const renderCount = useRef(0);
  const logger = useLogger();
  logger.debug({ message: `SchemaContextProvider[${++renderCount.current}] render()` });
  const fetcher = useFetcher();
  if (!fetcher) {
    throw new TypeError('The `SchemaContextProvider` component requires a `fetcher` function to be passed as prop.');
  }
  const alertDispatcher = useAlertDispatcher();
  const { language } = useQuery();

  const { initialHeaders, headerEditor } = useEditorContext({
    nonNull: true,
    caller: SchemaContextProvider,
  });
  const [schema, setSchema] = useState<MaybeGraphQLSchema>();
  const isFetching = useRef(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (fetchError) {
      alertDispatcher({
        message:
          'An error occurred with the GraphQL request. Please ensure that your AEM GraphQL endpoints are configured correctly.',
        severity: 'error',
        caller: SchemaContextProvider,
      });
    }
  }, [fetchError, alertDispatcher]);

  /**
   * Keep a ref to the current headers
   */
  const headersRef = useRef(initialHeaders);
  useEffect(() => {
    if (headerEditor) {
      headersRef.current = headerEditor.getValue();
    }
  });

  /**
   * Get introspection query for settings given via props
   */
  const { introspectionQuery, introspectionQueryName, introspectionQuerySansSubscriptions } = useIntrospectionQuery({
    inputValueDeprecation: props.inputValueDeprecation,
    introspectionQueryName: props.introspectionQueryName,
    schemaDescription: props.schemaDescription,
  });

  /**
   * Fetch the schema
   */
  const { onSchemaChange, dangerouslyAssumeSchemaIsValid, children } = props;
  const introspect = useCallback(() => {
    /**
     * Only introspect if there is no schema provided via props. If the
     * prop is passed an introspection result, we do continue but skip the
     * introspection request.
     */

    if (language !== QueryLanguage.GraphQL) {
      return;
    }
    logger.debug({ message: `SchemaContextProvider[${renderCount.current}] introspect()` });

    async function fetchIntrospectionData() {
      const parsedHeaders = parseHeaderString(headersRef.current);
      if (!parsedHeaders.isValidJSON) {
        setFetchError('Introspection failed as headers are invalid.');
        return;
      }

      const fetcherOpts: FetcherOpts = parsedHeaders.headers ? { headers: parsedHeaders.headers } : {};

      const fetch = fetcherReturnToPromise(
        fetcher(
          {
            query: introspectionQuery,
            operationName: introspectionQueryName,
          },
          fetcherOpts,
        ),
      );

      if (!isPromise(fetch)) {
        setFetchError('Fetcher did not return a Promise for introspection.');
        return;
      }

      isFetching.current = true;
      setFetchError(null);

      let result = await fetch;

      if (typeof result !== 'object' || result === null || !('data' in result)) {
        logger.debug({
          message: `SchemaContextProvider[${renderCount.current}] introspect() first fetch empty, trying second fetch`,
        });
        // Try the stock introspection query first, falling back on the
        // sans-subscriptions query for services which do not yet support it.
        const fetch2 = fetcherReturnToPromise(
          fetcher(
            {
              query: introspectionQuerySansSubscriptions,
              operationName: introspectionQueryName,
            },
            fetcherOpts,
          ),
        );
        if (!isPromise(fetch2)) {
          throw new Error('Fetcher did not return a Promise for introspection.');
        }
        result = await fetch2;
      }

      isFetching.current = false;

      if (result?.data && '__schema' in result.data) {
        return result.data as IntrospectionQuery;
      }

      // handle as if it were an error if the fetcher response is not a string or response.data is not present
      const responseString = typeof result === 'string' ? result : formatResult(result);
      setFetchError(responseString);
    }

    fetchIntrospectionData()
      .then((introspectionData) => {
        /**
         * Don't continue if another introspection request has been started in
         * the meantime or if there is no introspection data.
         */
        if (isFetching.current || !introspectionData) {
          return;
        }

        try {
          const newSchema = buildClientSchema(introspectionData);
          setSchema(newSchema);
          onSchemaChange?.(newSchema);
        } catch (error) {
          setFetchError(formatError(error));
        }
      })
      .catch((error) => {
        /**
         * Don't continue if another introspection request has been started in
         * the meantime.
         */
        if (isFetching.current) {
          return;
        }

        setFetchError(formatError(error));
        isFetching.current = false;
      });
  }, [
    fetcher,
    language,
    logger,
    introspectionQueryName,
    introspectionQuery,
    introspectionQuerySansSubscriptions,
    onSchemaChange,
  ]);

  /**
   * Trigger introspection automatically
   */
  useEffect(() => {
    introspect();
  }, [introspect]);

  /**
   * Trigger introspection manually via short key
   */
  useEffect(() => {
    if (language !== QueryLanguage.GraphQL) {
      function triggerIntrospection(event: KeyboardEvent) {
        if (event.ctrlKey && event.key === 'R') {
          introspect();
        }
      }

      window.addEventListener('keydown', triggerIntrospection);
      return () => window.removeEventListener('keydown', triggerIntrospection);
    }
  }, [introspect, language]);

  /**
   * Derive validation errors from the schema
   */
  const validationErrors = useMemo(() => {
    if (!schema || dangerouslyAssumeSchemaIsValid) {
      return [];
    }
    return validateSchema(schema);
  }, [schema, dangerouslyAssumeSchemaIsValid]);

  /**
   * Memoize context value
   */
  const value = useMemo(
    () => ({
      fetchError,
      introspect,
      isFetching,
      schema,
      validationErrors,
    }),
    [fetchError, introspect, schema, validationErrors],
  );

  return <SchemaContext.Provider value={value}>{children}</SchemaContext.Provider>;
}

export const useSchemaContext = createContextHook(SchemaContext);

type IntrospectionArgs = {
  /**
   * Can be used to set the equally named option for introspecting a GraphQL
   * server.
   * @default false
   * @see {@link https://github.com/graphql/graphql-js/blob/main/src/utilities/getIntrospectionQuery.ts|Utility for creating the introspection query}
   */
  inputValueDeprecation?: boolean;
  /**
   * Can be used to set a custom operation name for the introspection query.
   */
  introspectionQueryName?: string;
  /**
   * Can be used to set the equally named option for introspecting a GraphQL
   * server.
   * @default false
   * @see {@link https://github.com/graphql/graphql-js/blob/main/src/utilities/getIntrospectionQuery.ts|Utility for creating the introspection query}
   */
  schemaDescription?: boolean;
};

function useIntrospectionQuery({
  inputValueDeprecation,
  introspectionQueryName,
  schemaDescription,
}: IntrospectionArgs) {
  return useMemo(() => {
    const queryName = introspectionQueryName || 'IntrospectionQuery';

    let query = getIntrospectionQuery({
      inputValueDeprecation,
      schemaDescription,
    });
    if (introspectionQueryName) {
      query = query.replace('query IntrospectionQuery', `query ${queryName}`);
    }

    const querySansSubscriptions = query.replace('subscriptionType { name }', '');

    return {
      introspectionQueryName: queryName,
      introspectionQuery: query,
      introspectionQuerySansSubscriptions: querySansSubscriptions,
    };
  }, [inputValueDeprecation, introspectionQueryName, schemaDescription]);
}

function parseHeaderString(headersString: string | undefined) {
  let headers: Record<string, unknown> | null = null;
  let isValidJSON = true;

  try {
    if (headersString) {
      headers = JSON.parse(headersString);
    }
  } catch {
    isValidJSON = false;
  }
  return { headers, isValidJSON };
}
