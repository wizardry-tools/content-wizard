import {useEffect, useRef} from 'react';

import {
  commonKeys,
  DEFAULT_KEY_MAP,
  importCodeMirror,
} from './common';
import { useEditorContext } from './context';
import {useCopyQuery, useKeyMap, useSynchronizeOption, useSynchronizeValue} from './hooks';
import {CodeMirrorType, CommonEditorProps} from './types';
import {useQuery} from "../../../../QueryWizard/providers/QueryProvider";


export type UseWizardStatementEditorArgs = CommonEditorProps & {
  className?: string;
};

/**
 * Not actually used for Editing. This is the code "viewer" for the Query Wizard Statements
 * @param keyMap
 * @param caller
 */
export function useWizardStatementEditor(
  {
    keyMap = DEFAULT_KEY_MAP,
  }: UseWizardStatementEditorArgs = {},
  caller?: Function,
) {
  const { initialWizardStatement, wizardStatementEditor, setWizardStatementEditor } =
    useEditorContext({
      nonNull: true,
      caller: caller || useWizardStatementEditor,
    });
  const copy = useCopyQuery({ caller: caller || useWizardStatementEditor });
  const ref = useRef<HTMLDivElement>(null);
  const {statement} = useQuery();

  const codeMirrorRef = useRef<CodeMirrorType>();


  useEffect(() => {
    if (wizardStatementEditor) {
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
      // @ts-expect-error
      import('codemirror/keymap/sublime'),
      import('../../modes/querybuilder/querybuilder')
    ];
    void importCodeMirror(
        addons,
      { useCommonAddons: true },
    ).then(CodeMirror => {
      // Don't continue if the effect has already been cleaned up
      if (!isActive) {
        return;
      }
      codeMirrorRef.current = CodeMirror;
      const container = ref.current;
      if (!container) {
        return;
      }

      // Handle image tooltips and custom tooltips
      const newEditor = CodeMirror(container, {
        value: initialWizardStatement || statement,
        lineWrapping: true,
        readOnly: true,
        lineNumbers: true,
        theme: 'wizard',
        mode: 'querybuilder',
        foldGutter: true,
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
        // @ts-expect-error
        info: true,
        extraKeys: commonKeys,
      });

      setWizardStatementEditor(newEditor);
    });

    return () => {
      isActive = false;
    };
  }, [setWizardStatementEditor, statement, wizardStatementEditor, initialWizardStatement]);

  useKeyMap(wizardStatementEditor, ['Shift-Ctrl-C'], copy);
  useSynchronizeOption(wizardStatementEditor, 'keyMap', keyMap);
  useSynchronizeValue(wizardStatementEditor, statement);

  return ref;
}
