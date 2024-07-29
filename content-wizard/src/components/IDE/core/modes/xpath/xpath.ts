// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/5/LICENSE
import CodeMirror from 'codemirror';
import { XpathPropertiesState } from '@/types';

/**
 * turn a space-separated list into an array. For some reason, this method can't be imported into other files.
 * @param str
 */
function set(str: string) {
  const obj: any = {},
    words = str.split(' ');
  for (let i = 0; i < words.length; ++i) obj[words[i]] = true;
  return obj;
}

const pathMatch: any = /^[\w\-/:]*\/\//;
const functionMatch: any = /^[\w:]+\(/;
const variableMatch: any = /^[\w]+:?[\w]+[,*=\s\])}]?/;

const atoms = set('or and like order by');

(() => {
  CodeMirror.defineMode('xpath', function () {
    return {
      token: function (stream: CodeMirror.StringStream, state: XpathPropertiesState) {
        const sol = stream.sol() || state.afterSection;
        //var eol = stream.eol();

        state.afterSection = false;

        if (sol) {
          while (stream.eatSpace()) {}
        }

        const ch = stream.next();

        // process sol checks before processing non-sol checks
        if (sol && ch === '/' && stream.match(pathMatch, false)) {
          // found the path of the XPATH
          state.position = 'path';
          stream.match(pathMatch, true);
          return 'predicate';
        } else if (sol && (ch === '#' || ch === '!' || ch === ';')) {
          // comments
          state.position = 'comment';
          stream.skipToEnd();
          return 'comment';
        } else if (ch === '(') {
          // prevents wrapped statements from including "(" in tokens.
          return null;
        } else if (stream.match(functionMatch, false)) {
          // function name "def"
          state.position = 'function';
          stream.skipTo('(');
          return 'def'; // return the function's name, don't process the function parentheses yet.
        } else if (ch === '*') {
          // wildcard character
          return 'atom';
        } else if (ch === '@' && stream.match(variableMatch, false)) {
          // property name
          stream.eat('@');
          stream.eatWhile(/[\w:]/);
          return 'keyword';
        } else if (ch === "'" && stream.match(/^.*'/)) {
          stream.skipTo("'");
          return 'string';
        } else if (ch === '"' && stream.match(/^.*"/)) {
          stream.skipTo('"');
          return 'string';
        } else {
          // keyword check
          stream.eatWhile(/^[_\w\d]/);
          const word = stream.current().toLowerCase().trim();
          if (atoms.hasOwnProperty(word)) return 'atom';
          return null;
        }
      },

      startState: function () {
        return {
          position: 'path', // Current position, "def", "quote" or "comment"
          nextMultiline: false, // Is the next line multiline value
          inMultiline: false, // Is the current line a multiline value
          afterSection: false, // Did we just open a section
        };
      },
    };
  });
})();
