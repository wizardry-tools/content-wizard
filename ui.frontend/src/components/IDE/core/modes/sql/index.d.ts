import CodeMirror from 'codemirror';

declare module 'sql' {
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
}

export {};
