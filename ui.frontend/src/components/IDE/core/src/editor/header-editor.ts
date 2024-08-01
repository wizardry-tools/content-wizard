import { useEffect, useRef } from 'react';

import { Caller, UseHeaderEditorArgs } from '@/types';
import { useExecutionContext } from '../execution';
import { commonKeys, DEFAULT_EDITOR_THEME, DEFAULT_KEY_MAP, importCodeMirror } from './common';
import { useEditorContext } from './context';
import { useChangeHandler, useKeyMap, useMergeQuery, usePrettifyEditors, useSynchronizeOption } from './hooks';

export const useHeaderEditor = (
  { editorTheme = DEFAULT_EDITOR_THEME, keyMap = DEFAULT_KEY_MAP, readOnly = false }: UseHeaderEditorArgs = {},
  caller?: Caller,
) => {
  const { initialHeaders, headerEditor, setHeaderEditor, shouldPersistHeaders } = useEditorContext({
    nonNull: true,
    caller: caller ?? useHeaderEditor,
  });
  const executionContext = useExecutionContext();
  const merge = useMergeQuery({ caller: caller ?? useHeaderEditor });
  const prettify = usePrettifyEditors({ caller: caller ?? useHeaderEditor });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isActive = true;
    void importCodeMirror([import('codemirror/mode/javascript/javascript' as never)]).then((CodeMirror) => {
      // Don't continue if the effect has already been cleaned up
      if (!isActive) {
        return;
      }

      const container = ref.current;
      if (!container) {
        return;
      }

      const newEditor = CodeMirror(container, {
        value: initialHeaders ?? '',
        lineNumbers: true,
        tabSize: 2,
        mode: { name: 'javascript', json: true },
        theme: editorTheme,
        autoCloseBrackets: true,
        matchBrackets: true,
        showCursorWhenSelecting: true,
        readOnly: readOnly ? 'nocursor' : false,
        foldGutter: true,
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
        extraKeys: commonKeys,
      });

      newEditor.addKeyMap({
        'Cmd-Space'() {
          newEditor.showHint({ completeSingle: false, container });
        },
        'Ctrl-Space'() {
          newEditor.showHint({ completeSingle: false, container });
        },
        'Alt-Space'() {
          newEditor.showHint({ completeSingle: false, container });
        },
        'Shift-Space'() {
          newEditor.showHint({ completeSingle: false, container });
        },
      });

      newEditor.on('keyup', (editorInstance, event) => {
        const { code, key, shiftKey } = event;
        const isLetter = code.startsWith('Key');
        const isNumber = !shiftKey && code.startsWith('Digit');
        if (isLetter || isNumber || key === '_' || key === '"') {
          editorInstance.execCommand('autocomplete');
        }
      });

      setHeaderEditor(newEditor);
    });

    return () => {
      isActive = false;
    };
  }, [editorTheme, initialHeaders, readOnly, setHeaderEditor]);

  useSynchronizeOption(headerEditor, 'keyMap', keyMap);

  useChangeHandler(headerEditor, undefined, shouldPersistHeaders ? STORAGE_KEY : null, 'headers', useHeaderEditor);

  useKeyMap(headerEditor, ['Cmd-Enter', 'Ctrl-Enter'], executionContext?.run);
  useKeyMap(headerEditor, ['Shift-Ctrl-P'], prettify);
  useKeyMap(headerEditor, ['Shift-Ctrl-M'], merge);

  return ref;
};

export const STORAGE_KEY = 'headers';
