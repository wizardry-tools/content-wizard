import { FetcherOpts, fetcherReturnToPromise, formatError, formatResult, isPromise } from '@graphiql/toolkit';
import { buildClientSchema, getIntrospectionQuery, IntrospectionQuery, validateSchema } from 'graphql';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { IntrospectionArgs, MaybeGraphQLSchema, SchemaContextProviderProps, SchemaContextType } from '@/types';
import { useRenderCount } from '@/utility';
import { useAlertDispatcher, useFetcher, useLogger, useQuery } from '@/providers';
import { createContextHook, createNullableContext } from './utility/context';
import { useEditorContext } from './editor';

export const SchemaContext = createNullableContext<SchemaContextType>('SchemaContext');

export function SchemaContextProvider(props: SchemaContextProviderProps) {
  const renderCount = useRenderCount();
  const logger = useLogger();
  logger.debug({ message: `SchemaContextProvider[${renderCount}] render()` });
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

    if (language !== 'GraphQL') {
      return;
    }
    logger.debug({ message: `SchemaContextProvider introspect()` });

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
          message: `SchemaContextProvider introspect() first fetch empty, trying second fetch`,
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

      if (
        result &&
        typeof result === 'object' &&
        'data' in result &&
        typeof result.data === 'object' &&
        result.data &&
        '__schema' in result.data
      ) {
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
    if (language !== 'GraphQL') {
      function triggerIntrospection(event: KeyboardEvent) {
        if (event.ctrlKey && event.key === 'R') {
          introspect();
        }
      }

      window.addEventListener('keydown', triggerIntrospection);
      return () => {
        window.removeEventListener('keydown', triggerIntrospection);
      };
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

function useIntrospectionQuery({
  inputValueDeprecation,
  introspectionQueryName,
  schemaDescription,
}: IntrospectionArgs) {
  return useMemo(() => {
    const queryName = introspectionQueryName ?? 'IntrospectionQuery';

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
