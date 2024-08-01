import { useEffect, useRef } from 'react';
import { Caller, CodeMirrorType, QueryLanguage, Statement, UseWizardStatementEditorArgs } from '@/types';
import { useRenderCount } from '@/utility';
import { useLogger, useQuery } from '@/providers';
import { commonKeys, DEFAULT_KEY_MAP, importCodeMirror } from './common';
import { useEditorContext } from './context';
import { useCopyQuery, useKeyMap, useSynchronizeOption } from './hooks';

const getStatement = (language: QueryLanguage, statement: Statement) => {
  // only use the statement if the language is QueryBuilder
  if (language === 'QueryBuilder') {
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
  caller?: Caller,
) {
  const logger = useLogger();
  const renderCount = useRenderCount();
  logger.debug({ message: `useWizardStatementEditor[${renderCount}] render()` });
  const { language, statement } = useQuery();
  // used for setting initialWizardStatement if initialWizardStatement is empty;
  // initialWizardStatement reloads codemirror if modified, so we're using a Ref instead
  const getInitialQueryStatement = useRef(getStatement(language, statement));

  // used for syncing the editor
  const {
    initialWizardStatement = getInitialQueryStatement.current,
    wizardStatementEditor,
    setWizardStatementEditor,
  } = useEditorContext({
    nonNull: true,
    caller: caller ?? useWizardStatementEditor,
  });
  const copy = useCopyQuery({ caller: caller ?? useWizardStatementEditor });
  const ref = useRef<HTMLDivElement>(null);

  const codeMirrorRef = useRef<CodeMirrorType>();

  useEffect(() => {
    let isActive = true;
    const addons = [
      import('codemirror/addon/fold/foldgutter'),
      import('codemirror/addon/fold/brace-fold'),
      import('codemirror/addon/dialog/dialog'),
      import('codemirror/addon/search/search'),
      import('codemirror/addon/search/searchcursor'),
      import('codemirror/addon/search/jump-to-line'),
      import('codemirror/keymap/sublime' as never),
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
        // @ts-expect-error TODO: figure out if 'info' is needed, or why it's added to an Object that doesn't support it
        info: true,
        extraKeys: commonKeys,
      });

      setWizardStatementEditor(newEditor);
    });

    return () => {
      isActive = false;
    };
  }, [setWizardStatementEditor, initialWizardStatement]);

  useKeyMap(wizardStatementEditor, ['Shift-Ctrl-C'], copy);
  useSynchronizeOption(wizardStatementEditor, 'keyMap', keyMap);
  //useSynchronizeValue(wizardStatementEditor, getStatement(language, statement));

  return ref;
}
