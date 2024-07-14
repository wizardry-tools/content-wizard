import { useEffect, useRef, useState } from 'react';

import { commonKeys, DEFAULT_KEY_MAP, importCodeMirror } from './common';
import { useCopyResult, useKeyMap, useSynchronizeOption, useSynchronizeValue } from './hooks';
import { CodeMirrorEditor, CommonEditorProps } from './types';
import { useEditorContext } from './context';
import { useLogger } from 'src/providers';

export type UseResultExplorerEditorArgs = CommonEditorProps & {
  className?: string;
  data?: string;
};

/**
 * This is the Editor used for the Result Explorer.
 *
 * The Application does not write query updates to this editor, therefore it will instantiate a new editor instance
 * when it mounts. Since this lives in a @mui/material/Dialog, the Dialog is unmounted when the user closes it.
 * Each time the component mounts, it's being mounted with the json response of a JCR request.
 *
 * Does not require EditorContext, unless we want to add 'editing' features.
 * @param keyMap
 * @param data
 * @param caller
 */
export function useResultExplorerEditor(
  { keyMap = DEFAULT_KEY_MAP, data = '' }: UseResultExplorerEditorArgs = {},
  caller?: Function,
) {
  const logger = useLogger();
  const renderCount = useRef(0);
  logger.debug({ message: `useResultExplorerEditor[${++renderCount.current}] render()` });
  const [editor, setEditor] = useState<CodeMirrorEditor | null>(null);
  const copy = useCopyResult({ caller: caller || useResultExplorerEditor });
  const ref = useRef<HTMLDivElement>(null);

  // still need to use the editor context, so that the useCopyResult function works.
  const { setResultExplorerEditor } = useEditorContext({
    nonNull: true,
    caller: caller || useResultExplorerEditor,
  });

  useEffect(() => {
    if (editor) {
      // prevent duplicate editors from being instantiated.
      return;
    }
    let isActive = true;
    let addons = [
      import('codemirror/addon/fold/foldgutter'),
      import('codemirror/addon/fold/brace-fold'),
      import('codemirror/addon/dialog/dialog'),
      import('codemirror/addon/search/search'),
      import('codemirror/addon/search/searchcursor'),
      import('codemirror/addon/search/jump-to-line'),
      import('codemirror/mode/javascript/javascript' as any),
      // @ts-expect-error
      import('codemirror/keymap/sublime'),
    ];
    void importCodeMirror(addons, { useCommonAddons: true }).then((CodeMirror) => {
      // Don't continue if the effect has already been cleaned up
      if (!isActive) {
        return;
      }

      const container = ref.current;
      if (!container) {
        return;
      }

      // Handle image tooltips and custom tooltips
      const newEditor = CodeMirror(container, {
        value: data,
        lineWrapping: true,
        readOnly: true, // making this read-only until we're able to submit changes, branch experiment/result-editor
        lineNumbers: true,
        theme: 'wizard',
        mode: 'application/json',
        foldGutter: true,
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
        // @ts-expect-error
        info: true,
        inputStyle: 'contenteditable',
        electricChars: true,
        extraKeys: commonKeys,
      });
      // setting the editor internaly, for re-use until the component is unmounted
      setEditor(newEditor);
      setResultExplorerEditor(newEditor);
    });

    return () => {
      isActive = false;
    };
  }, [data, editor, setResultExplorerEditor]);

  useKeyMap(editor, ['Shift-Ctrl-C'], copy);
  useSynchronizeOption(editor, 'keyMap', keyMap);

  // this is just a basic handler that updates the content inside the editor when the content changes.
  // it is required for when we open subsequent Result Explorers, and the codeMirror is being re-used.
  // it's useless on the first ResultExplorer, but required for subsequent ResultExplorers.
  useSynchronizeValue(editor, data);

  return ref;
}
