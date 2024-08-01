import CodeMirror from 'codemirror';

export type QueryBuilderPropertiesStatePosition = 'predicate' | 'quote' | 'comment' | 'equals' | 'string';
/**
 * Customized QueryBuilder codemirror parser mode originally based off of the OOTB "Properties" mode
 */
export type QueryBuilderPropertiesState = {
  position: QueryBuilderPropertiesStatePosition;
  nextMultiline: boolean;
  inMultiline: boolean;
  afterSection: boolean;
};

export type SqlContext = {
  prev: SqlContext | null;
  indent: number;
  col: number;
  type: string;
  align?: boolean;
};

export type SqlState = {
  tokenize: (arg0: CodeMirror.StringStream, arg1: SqlState) => string | null | undefined;
  context: SqlContext | null;
  indent?: number;
};
type ModeOptionMap = Record<string, boolean>;
type HookMap = Record<string, (stream: CodeMirror.StringStream) => string>;
export type ModeOptions = {
  client?: ModeOptionMap;
  atoms?: ModeOptionMap;
  builtin?: ModeOptionMap;
  keywords?: ModeOptionMap;
  operatorChars?: RegExp;
  support?: ModeOptionMap;
  hooks?: HookMap;
  dateSQL?: ModeOptionMap;
  backslashStringEscapes?: boolean;
  brackets?: RegExp;
  punctuation?: RegExp;
};

/**
 * This is a Custom Codemirror mode for XPATH parsing originally based on the OOTB "Properties" mode
 */
export type XpathPropertiesState = {
  position: 'predicate' | 'quote' | 'comment' | 'path' | 'string' | 'function' | 'def';
  nextMultiline: boolean;
  inMultiline: boolean;
  afterSection: boolean;
};

export type CodeMirrorImport =
  | typeof import('codemirror/addon/comment/comment')
  | typeof import('codemirror/addon/search/search')
  | typeof import('codemirror-graphql/esm/hint')
  | typeof import('codemirror-graphql/esm/lint')
  | typeof import('codemirror-graphql/esm/info')
  | typeof import('codemirror-graphql/esm/jump')
  | typeof import('codemirror-graphql/esm/mode')
  | typeof import('@/components/IDE/core/modes/sql/sql')
  | typeof import('@/components/IDE/core/modes/xpath/xpath')
  | typeof import('@/components/IDE/core/modes/querybuilder/querybuilder');
