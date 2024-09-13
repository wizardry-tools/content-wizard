import { useEffect } from 'react';
import { clsx } from 'clsx';
import type { VariableEditorProps } from '@/types';
import { useEditorContext } from '../context';
import { useVariableEditor } from '../variable-editor';
import '../style/codemirror.scss';
import '../style/fold.scss';
import '../style/lint.scss';
import '../style/hint.scss';
import '../style/editor.scss';

export const VariableEditor = ({ isHidden, ...hookArgs }: VariableEditorProps) => {
  const { variableEditor } = useEditorContext({
    nonNull: true,
    caller: VariableEditor,
  });
  const ref = useVariableEditor(hookArgs, VariableEditor);

  useEffect(() => {
    if (variableEditor && !isHidden) {
      variableEditor.refresh();
    }
  }, [variableEditor, isHidden]);

  return <div className={clsx('wizard-editor', isHidden && 'hidden')} ref={ref} />;
};
