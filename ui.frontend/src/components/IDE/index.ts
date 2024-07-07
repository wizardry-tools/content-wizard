/**
 * This module contains a modified version of the GraphiQL IDE https://github.com/graphql/graphiql
 *
 * Modified the styles and colors.
 * Added a Language-Selector plugin, which introduces Multi-language Support (query languages) for the Code Editor.
 *    This also introduces the ability to change APIs and select PersistedQueries for GraphQL.
 * Added new Codemirror "modes" for QueryBuilder, XPATH, and JCR_SQL2
 * Added a new read-only "Editor" for the QueryBuilder preview in the Query Wizard, see "wizard-statement-editor".
 * Copied the Storage-API from @graphiql/toolkit and customized it for mutli-language support.
 *    The "custom" storage plugin that was provided by @graphiql/toolkit was insufficient,
 *    so I built a different version of what's in the toolkit.
 * Replaced some existing elements with @mui/material components
 *
 */
export * from './IDE';