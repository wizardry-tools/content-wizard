import CodeMirror from 'codemirror';

/**
 * Customized QueryBuilder codemirror parser mode originally based off of the OOTB "Properties" mode
 */
export type QueryBuilderPropertiesState = {
  position: 'predicate' | 'quote' | 'comment' | 'equals' | 'string';
  nextMultiline: boolean;
  inMultiline: boolean;
  afterSection: boolean;
};

export type SqlContext = {
  prev: SqlContext | null;
  indent: number;
  col: number;
  type: string;
};

export type SqlState = {
  tokenize: (arg0: CodeMirror.StringStream, arg1: any) => any;
  context: SqlContext | null;
  indent?: number;
};
type ModeOptionMap = Record<string, boolean>;
type HookMap = Record<string, (stream: CodeMirror.StringStream) => string>;
export type ModeOptions = {
  client?: any;
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
