import CodeMirror from 'codemirror';

declare module 'sql' {
  export interface SqlContext {
    prev: SqlContext | null;
    indent: number;
    col: number;
    type: string;
  }

  export interface SqlState {
    tokenize: (arg0: CodeMirror.StringStream, arg1: any) => any;
    context: SqlContext | null;
    indent?: number;
  }
}

export {};
