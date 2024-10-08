// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/5/LICENSE
import CodeMirror from 'codemirror';
import type { QueryBuilderPropertiesState } from '@/types';

(() => {
  CodeMirror.defineMode('querybuilder', () => {
    return {
      token: (stream: CodeMirror.StringStream, state: QueryBuilderPropertiesState) => {
        const sol = stream.sol() || state.afterSection;
        const eol = stream.eol();

        state.afterSection = false;

        if (sol) {
          if (state.nextMultiline) {
            state.inMultiline = true;
            state.nextMultiline = false;
          } else {
            state.position = 'predicate';
          }
        }

        if (eol && !state.nextMultiline) {
          state.inMultiline = false;
          state.position = 'predicate';
        }

        if (sol) {
          while (stream.eatSpace()) {
            /* empty */
          }
        }

        const ch = stream.next();

        if (state.position === 'equals' && ch !== '=') {
          // just assume everything past the '=' is tokenized
          state.position = 'string';
          stream.skipToEnd();
          return 'string';
        }

        if (sol && (ch === '#' || ch === '!' || ch === ';')) {
          state.position = 'comment';
          stream.skipToEnd();
          return 'comment';
        } else if (sol && ch === '[') {
          state.afterSection = true;
          stream.skipTo(']');
          stream.eat(']');
          return 'header';
        } else if (ch === '=' && state.position !== 'equals') {
          // custom logic for Query Builder
          state.position = 'equals';
          return 'readable-token'; // assumes defualt style
        } else if (ch === '\\' && state.position === 'quote') {
          if (stream.eol()) {
            // end of line?
            // Multiline value
            state.nextMultiline = true;
          }
        }

        return state.position;
      },
      startState: () => {
        return {
          position: 'predicate', // Current position, "def", "quote" or "comment"
          nextMultiline: false, // Is the next line multiline value
          inMultiline: false, // Is the current line a multiline value
          afterSection: false, // Did we just open a section
        };
      },
    };
  });
})();
