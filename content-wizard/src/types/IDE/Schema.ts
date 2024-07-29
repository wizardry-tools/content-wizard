import { GraphQLError, GraphQLSchema } from 'graphql/index';
import { ReactNode, RefObject } from 'react';

export type IntrospectionArgs = {
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

export type MaybeGraphQLSchema = GraphQLSchema | null | undefined;

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
