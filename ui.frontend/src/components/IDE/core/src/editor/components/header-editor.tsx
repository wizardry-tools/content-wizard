import { useEffect } from 'react';
import { clsx } from 'clsx';
import type { HeaderEditorProps } from '@/types';
import { useEditorContext } from '../context';
import { useHeaderEditor } from '../header-editor';
import '../style/codemirror.scss';
import '../style/fold.scss';
import '../style/editor.scss';

export const HeaderEditor = ({ isHidden, ...hookArgs }: HeaderEditorProps) => {
  const { headerEditor } = useEditorContext({
    nonNull: true,
    caller: HeaderEditor,
  });
  const ref = useHeaderEditor(hookArgs, HeaderEditor);

  useEffect(() => {
    if (!isHidden) {
      headerEditor?.refresh();
    }
  }, [headerEditor, isHidden]);

  return <div className={clsx('wizard-editor', isHidden && 'hidden')} ref={ref} />;
};
