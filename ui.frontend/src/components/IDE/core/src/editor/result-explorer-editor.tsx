import {useEffect, useRef, useState} from 'react';

import { commonKeys, DEFAULT_KEY_MAP, importCodeMirror } from './common';
import {useCopyResult, useKeyMap, useSynchronizeOption, useSynchronizeValue} from './hooks';
import {CodeMirrorEditor, CommonEditorProps} from './types';
import {EditorChange} from "codemirror";
import {useEditorContext} from "./context";

export type UseResultExplorerEditorArgs = CommonEditorProps & {
  className?: string;
  data?:string;
};


/**
 * This is the Editor used for the Result Explorer.
 *
 * The Application does not write updates to this editor, therefore it will instantiate a new editor instance
 * when it mounts. Since this lives in a @mui/material/Dialog, the Dialog is unmounted when the user closes it.
 * @param keyMap
 * @param data
 * @param caller
 */
export function useResultExplorerEditor(
  {
    keyMap = DEFAULT_KEY_MAP,
    data = '',
  }: UseResultExplorerEditorArgs = {},
  caller?: Function,
) {

  const [editor, setEditor] = useState<CodeMirrorEditor | null>(null);
  const copy = useCopyResult({ caller: caller || useResultExplorerEditor });
  const ref = useRef<HTMLDivElement>(null);

  // still need to use the editor setter, so that other logic can access the value of this editor.
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
        readOnly: false,
        lineNumbers: true,
        theme: 'wizard',
        mode: 'application/json',
        foldGutter: true,
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
        // @ts-expect-error
        info: true,
        extraKeys: commonKeys,
      });
      setEditor(newEditor);
      setResultExplorerEditor(newEditor);
    });

    return () => {
      isActive = false;
    };
  }, [data, editor, setResultExplorerEditor]);

  useEffect(()=>{
    if (!editor) {
      return;
    }
    const handleChange = (editorInstance: CodeMirrorEditor, changeObj: EditorChange | undefined) => {
      // When we signal a change manually without actually changing anything
      // we don't want to invoke the callback.
      if (!changeObj) {
        return;
      }

      const newValue = editorInstance.getValue();
      //setValue(newValue);
      // we aren't doing anything with the edited values yet,
      // but the goal would be to submit the change to AEM as a POST,
      // so that the changes are persisted. This would require a lot of testing and possibly a user override.
      console.log("editorChange: ", newValue);
    };
    editor.on('change', handleChange);
    return () => {
      editor.off('change', handleChange);
    }
  },[editor]);

  useKeyMap(editor, ['Shift-Ctrl-C'], copy);
  useSynchronizeOption(editor, 'keyMap', keyMap);
  useSynchronizeValue(editor, data);

  return ref;
}
