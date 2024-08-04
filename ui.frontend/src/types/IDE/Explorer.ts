import type {
  DirectiveNode,
  GraphQLArgument,
  GraphQLField,
  GraphQLInputField,
  GraphQLNamedType,
  GraphQLSchema,
  GraphQLType,
} from 'graphql/index';
import type { ReactNode } from 'react';

export type ExplorerFieldDef = GraphQLField<unknown, unknown, unknown> | GraphQLInputField | GraphQLArgument;

export type ExplorerNavStackItem = {
  /**
   * The name of the item.
   */
  name: string;
  /**
   * The definition object of the item, this can be a named type, a field, an
   * input field or an argument.
   */
  def?: GraphQLNamedType | ExplorerFieldDef;
};

// There's always at least one item in the nav stack
export type ExplorerNavStack = [ExplorerNavStackItem, ...ExplorerNavStackItem[]];

export type ExplorerContextType = {
  /**
   * A stack of navigation items. The last item in the list is the current one.
   * This list always contains at least one item.
   */
  explorerNavStack: ExplorerNavStack;
  /**
   * Push an item to the navigation stack.
   * @param item The item that should be pushed to the stack.
   */
  push: (item: ExplorerNavStackItem) => void;
  /**
   * Pop the last item from the navigation stack.
   */
  pop: () => void;
  /**
   * Reset the navigation stack to its initial state, this will remove all but
   * the initial stack item.
   */
  reset: () => void;
};
export type ExplorerContextProviderProps = {
  children: ReactNode;
};

export type ArgumentProps = {
  /**
   * The argument that should be rendered.
   */
  arg: GraphQLArgument;
  /**
   * Toggle if the default value for the argument is shown (if there is one)
   * @default false
   */
  showDefaultValue?: boolean;
  /**
   * Toggle whether to render the whole argument including description and
   * deprecation reason (`false`) or to just render the argument name, type,
   * and default value in a single line (`true`).
   * @default false
   */
  inline?: boolean;
};

export type DefaultValueProps = {
  /**
   * The field or argument for which to render the default value.
   */
  field: ExplorerFieldDef;
};
export type DeprecationReasonProps = {
  /**
   * The deprecation reason as markdown string.
   */
  children?: string | null;
  preview?: boolean;
};

export type DirectiveProps = {
  /**
   * The directive that should be rendered.
   */
  directive: DirectiveNode;
};

export type FieldDocumentationProps = {
  /**
   * The field or argument that should be rendered.
   */
  field: ExplorerFieldDef;
};

export type FieldLinkProps = {
  /**
   * The field or argument that should be linked to.
   */
  field: ExplorerFieldDef;
};

export type SchemaDocumentationProps = {
  /**
   * The schema that should be rendered.
   */
  schema: GraphQLSchema;
};

export type TypeMatch = { type: GraphQLNamedType };

export type FieldMatch = {
  type: GraphQLNamedType;
  field: GraphQLField<unknown, unknown> | GraphQLInputField;
  argument?: GraphQLArgument;
};

export type SearchMatch = {
  within: FieldMatch[];
  types: TypeMatch[];
  fields: FieldMatch[];
};

export type SearchMatchCallback = (searchValue: string) => SearchMatch;

export type TypeProps = { type: GraphQLNamedType };

export type FieldProps = {
  field: GraphQLField<unknown, unknown> | GraphQLInputField;
  argument?: GraphQLArgument;
};

export type ExplorerSectionProps = {
  children: ReactNode;
  /**
   * The title of the section, which will also determine the icon rendered next
   * to the headline.
   */
  title:
    | 'Root Types'
    | 'Fields'
    | 'Deprecated Fields'
    | 'Type'
    | 'Arguments'
    | 'Deprecated Arguments'
    | 'Implements'
    | 'Implementations'
    | 'Possible Types'
    | 'Enum Values'
    | 'Deprecated Enum Values'
    | 'Directives'
    | 'All Schema Types';
};

export type TypeDocumentationProps = {
  /**
   * The type that should be rendered.
   */
  type: GraphQLNamedType;
};

export type TypeLinkProps = {
  /**
   * The type that should be linked to.
   */
  type: GraphQLType;
};
