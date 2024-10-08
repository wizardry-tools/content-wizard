import { useEffect, useRef } from 'react';
import type { Caller, CodeMirrorType, UseVariableEditorArgs } from '@/types';
import { useExecutionContext } from '../ide-providers';
import { commonKeys, DEFAULT_EDITOR_THEME, DEFAULT_KEY_MAP, importCodeMirror } from './common';
import { useEditorContext } from './context';
import {
  useChangeHandler,
  useCompletion,
  useKeyMap,
  useMergeQuery,
  usePrettifyEditors,
  useSynchronizeOption,
} from './hooks';

export const useVariableEditor = (
  { editorTheme = DEFAULT_EDITOR_THEME, keyMap = DEFAULT_KEY_MAP, readOnly = false }: UseVariableEditorArgs = {},
  caller?: Caller,
) => {
  const { initialVariables, variableEditor, setVariableEditor } = useEditorContext({
    nonNull: true,
    caller: caller ?? useVariableEditor,
  });
  const executionContext = useExecutionContext();
  const merge = useMergeQuery({ caller: caller ?? useVariableEditor });
  const prettify = usePrettifyEditors({ caller: caller ?? useVariableEditor });
  const ref = useRef<HTMLDivElement>(null);
  const codeMirrorRef = useRef<CodeMirrorType>();

  useEffect(() => {
    let isActive = true;

    void importCodeMirror([
      import('codemirror-graphql/esm/variables/hint'),
      import('codemirror-graphql/esm/variables/lint'),
      import('codemirror-graphql/esm/variables/mode'),
    ]).then((CodeMirror) => {
      // Don't continue if the effect has already been cleaned up
      if (!isActive) {
        return;
      }

      codeMirrorRef.current = CodeMirror;

      const container = ref.current;
      if (!container) {
        return;
      }

      const newEditor = CodeMirror(container, {
        value: initialVariables,
        lineNumbers: true,
        tabSize: 2,
        mode: 'graphql-variables',
        theme: editorTheme,
        autoCloseBrackets: true,
        matchBrackets: true,
        showCursorWhenSelecting: true,
        readOnly: readOnly ? 'nocursor' : false,
        foldGutter: true,
        lint: {
          // @ts-expect-error CodeMirror Configs are severely outdated, need to migrate to CodeMirror6
          variableToType: undefined,
        },
        hintOptions: {
          closeOnUnfocus: false,
          completeSingle: false,
          container,
          // @ts-expect-error CodeMirror Configs are severely outdated, need to migrate to CodeMirror6
          variableToType: undefined,
        },
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

      setVariableEditor(newEditor);
    });

    return () => {
      isActive = false;
    };
  }, [editorTheme, initialVariables, readOnly, setVariableEditor]);

  useSynchronizeOption(variableEditor, 'keyMap', keyMap);

  useChangeHandler(variableEditor, undefined, STORAGE_KEY, 'variables', useVariableEditor);

  useCompletion(variableEditor, null, useVariableEditor);

  useKeyMap(variableEditor, ['Cmd-Enter', 'Ctrl-Enter'], executionContext?.run);
  useKeyMap(variableEditor, ['Shift-Ctrl-P'], prettify);
  useKeyMap(variableEditor, ['Shift-Ctrl-M'], merge);

  return ref;
};

export const STORAGE_KEY = 'variables';
