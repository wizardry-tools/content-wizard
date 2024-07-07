import { useEffect, useRef } from 'react';

import { commonKeys, DEFAULT_KEY_MAP, importCodeMirror } from './common';
import { useEditorContext } from './context';
import { useCopyQuery, useKeyMap, useSynchronizeOption, useSynchronizeValue } from './hooks';
import { CodeMirrorType, CommonEditorProps } from './types';
import { useQuery } from 'src/providers';
import { QueryLanguage } from 'src/components/Query';

export type UseWizardStatementEditorArgs = CommonEditorProps & {
  className?: string;
};

const getStatement = (language: string, statement: string) => {
  // only use the statement if the language is QueryBuilder
  if (language === QueryLanguage.QueryBuilder) {
    return statement;
  }
  return '';
};

/**
 * Not actually used for Editing. This is the code "viewer" for the Query Wizard Statements
 * @param keyMap
 * @param caller
 */
export function useWizardStatementEditor(
  { keyMap = DEFAULT_KEY_MAP }: UseWizardStatementEditorArgs = {},
  caller?: Function,
) {
  const { language, statement } = useQuery();
  // used for setting initialWizardStatement if initialWizardStatement is empty;
  // initialWizardStatement reloads codemirror if modified, so we're using a Ref instead
  const getInitialQueryStatement = useRef(getStatement(language, statement));

  // used for synching the editor
  const {
    initialWizardStatement = getInitialQueryStatement.current,
    wizardStatementEditor,
    setWizardStatementEditor,
  } = useEditorContext({
    nonNull: true,
    caller: caller || useWizardStatementEditor,
  });
  const copy = useCopyQuery({ caller: caller || useWizardStatementEditor });
  const ref = useRef<HTMLDivElement>(null);

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
      import('../../modes/querybuilder/querybuilder'),
    ];
    void importCodeMirror(addons, { useCommonAddons: true }).then((CodeMirror) => {
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
        value: initialWizardStatement,
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
  }, [setWizardStatementEditor, wizardStatementEditor, initialWizardStatement]);

  useKeyMap(wizardStatementEditor, ['Shift-Ctrl-C'], copy);
  useSynchronizeOption(wizardStatementEditor, 'keyMap', keyMap);
  useSynchronizeValue(wizardStatementEditor, getStatement(language, statement));

  return ref;
}
