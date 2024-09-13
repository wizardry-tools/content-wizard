import type { Editor, Position, Token } from 'codemirror';
import type { ComponentType, PropsWithChildren } from 'react';
import type { SchemaReference } from 'codemirror-graphql/utils/SchemaReference';
import type { DocumentNode, OperationDefinitionNode, ValidationRule } from 'graphql/index';
import type { VariableToType } from 'graphql-language-service';
import type { Query } from '@/types';
import type { UseCopyQueryArgs } from './hooks';
import type { TabsState, TabState } from './IDE';

export type CodeMirrorType = typeof import('codemirror');

// TODO: Refactor this logic to avoid use of `any`
// disable the no-explicit-any rule for this file until the exported function is refactored.
export type CodeMirrorEditor = Editor & { options?: any }; // eslint-disable-line @typescript-eslint/no-explicit-any

export type KeyMap = 'sublime' | 'emacs' | 'vim';

export type CommonEditorProps = {
  /**
   * Sets the color theme you want to use for the editor.
   * @default 'graphiql'
   */
  editorTheme?: string;
  /**
   * Sets the key map to use when using the editor.
   * @default 'sublime'
   * @see {@link https://codemirror.net/5/doc/manual.html#keymaps}
   */
  keyMap?: KeyMap;
};

export type HeaderEditorProps = UseHeaderEditorArgs & {
  /**
   * Visually hide the header editor.
   * @default false
   */
  isHidden?: boolean;
};

export type ImagePreviewProps = { token: Token };

export type Dimensions = {
  width: number | null;
  height: number | null;
};

export type WriteableEditorProps = CommonEditorProps & {
  /**
   * Makes the editor read-only.
   * @default false
   */
  readOnly?: boolean;
};

export type UseResultExplorerEditorArgs = CommonEditorProps & {
  className?: string;
  data?: string;
};

export type CodeMirrorEditorWithOperationFacts = CodeMirrorEditor & {
  documentAST: DocumentNode | null;
  operationName: string | null;
  operations: OperationDefinitionNode[] | null;
  variableToType: VariableToType | null;
};

// Removed OOTB GraphiQL properties since we refactored the IDE Providers to not pass default props...
export type EditorContextProviderProps = PropsWithChildren;

export type EditorContextType = TabsState & {
  /**
   * Add a new tab.
   */
  addTab: () => void;
  /**
   * Switch to a different tab.
   * @param index The index of the tab that should be switched to.
   */
  changeTab: (index: number) => void;
  /**
   * Move a tab to a new spot.
   * @param newOrder The new order for the tabs.
   */
  moveTab: (newOrder: TabState[]) => void;
  /**
   * Close a tab. If the currently active tab is closed, the tab before it will
   * become active. If there is no tab before the closed one, the tab after it
   * will become active.
   * @param index The index of the tab that should be closed.
   */
  closeTab: (index: number) => void;
  /**
   * Update the state for the tab that is currently active. This will be
   * reflected in the `tabs` object and the state will be persisted in storage
   * (if available).
   * @param partialTab A partial tab state object that will override the
   * current values. The properties `id`, `hash` and `title` cannot be changed.
   */
  updateActiveTabValues: (partialTab: Partial<Omit<TabState, 'id' | 'hash' | 'title'>>) => void;

  /**
   * The CodeMirror editor instance for the headers editor.
   */
  headerEditor: CodeMirrorEditor | null;
  /**
   * The CodeMirror editor instance for the query editor. This editor also
   * stores the operation facts that are derived from the current editor
   * contents.
   */
  queryEditor: CodeMirrorEditorWithOperationFacts | null;
  /**
   * The CodeMirror editor instance for the response editor.
   */
  responseEditor: CodeMirrorEditor | null;
  /**
   * The CodeMirror editor instance for the wizard statement editor.
   */
  wizardStatementEditor: CodeMirrorEditor | null;
  /**
   * The CodeMirror editor instance for the result explorer editor.
   */
  resultExplorerEditor: CodeMirrorEditor | null;
  /**
   * The CodeMirror editor instance for the variables editor.
   */
  variableEditor: CodeMirrorEditor | null;
  /**
   * Set the CodeMirror editor instance for the headers editor.
   */
  setHeaderEditor: (newEditor: CodeMirrorEditor) => void;
  /**
   * Set the CodeMirror editor instance for the query editor.
   */
  setQueryEditor: (newEditor: CodeMirrorEditorWithOperationFacts) => void;
  /**
   * Set the CodeMirror editor instance for the response editor.
   */
  setResponseEditor: (newEditor: CodeMirrorEditor) => void;
  /**
   * Set the CodeMirror editor instance for the wizard statement editor.
   */
  setWizardStatementEditor: (newEditor: CodeMirrorEditor) => void;
  /**
   * Set the CodeMirror editor instance for the result explorer editor.
   */
  setResultExplorerEditor: (newEditor: CodeMirrorEditor) => void;
  /**
   * Set the CodeMirror editor instance for the variables editor.
   */
  setVariableEditor: (newEditor: CodeMirrorEditor) => void;

  /**
   * Changes the operation name and invokes the `onEditOperationName` callback.
   */
  setOperationName: (operationName: string) => void;

  /**
   * The contents of the headers editor when initially rendering the provider
   * component.
   */
  initialHeaders: string;
  /**
   * The contents of the query editor when initially rendering the provider
   * component.
   */
  initialQuery: Query | null;
  /**
   * The contents of the response editor when initially rendering the provider
   * component.
   */
  initialResponse: string;

  /**
   * The contents of the wizard statement editor when initially rendering the provider
   * component.
   */
  initialWizardStatement: string;
  /**
   * The contents of the variables editor when initially rendering the provider
   * component.
   */
  initialVariables: string;
  /**
   * A list of custom validation rules that are run in addition to the rules
   * provided by the GraphQL spec.
   */
  validationRules: ValidationRule[];

  /**
   * If the contents of the headers editor are persisted in storage.
   */
  shouldPersistHeaders: boolean;
  /**
   * Changes if headers should be persisted.
   */
  setShouldPersistHeaders: (persist: boolean) => void;
};

export type ResponseTooltipType = ComponentType<{
  /**
   * The position of the token in the editor contents.
   */
  pos: Position;
  /**
   * The token that has been hovered over.
   */
  token: Token;
}>;

export type UseHeaderEditorArgs = WriteableEditorProps & {
  /**
   * Invoked when the contents of the headers editor change.
   * @param value The new contents of the editor.
   */
  onEdit?: (value: string) => void;
};

export type UseQueryEditorArgs = WriteableEditorProps &
  Pick<UseCopyQueryArgs, 'onCopyQuery'> & {
    /**
     * Invoked when a reference to the GraphQL schema (type or field) is clicked
     * as part of the editor or one of its tooltips.
     * @param reference The reference that has been clicked.
     */
    onClickReference?: (reference: SchemaReference) => void;
    /**
     * Invoked when the contents of the query editor change.
     * @param value The new contents of the editor.
     * @param documentAST The editor contents parsed into a GraphQL document.
     */
    onEdit?: (value: string, documentAST?: DocumentNode) => void;
  };

export type UseResponseEditorArgs = CommonEditorProps & {
  /**
   * Customize the tooltip when hovering over properties in the response
   * editor.
   */
  responseTooltip?: ResponseTooltipType;
};

export type UseVariableEditorArgs = WriteableEditorProps & {
  /**
   * Invoked when a reference to the GraphQL schema (type or field) is clicked
   * as part of the editor or one of its tooltips.
   * @param reference The reference that has been clicked.
   */
  onClickReference?: (reference: SchemaReference) => void;
  /**
   * Invoked when the contents of the variables editor change.
   * @param value The new contents of the editor.
   */
  onEdit?: (value: string) => void;
};

export type UseWizardStatementEditorArgs = CommonEditorProps & {
  className?: string;
};

export type VariableEditorProps = UseVariableEditorArgs & {
  /**
   * Visually hide the header editor.
   * @default false
   */
  isHidden?: boolean;
};
