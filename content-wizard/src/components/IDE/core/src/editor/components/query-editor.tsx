import { UseQueryEditorArgs } from '@/types';
import { useQueryEditor } from '../query-editor';
import '../style/codemirror.scss';
import '../style/fold.scss';
import '../style/lint.scss';
import '../style/hint.scss';
import '../style/info.scss';
import '../style/jump.scss';
import '../style/auto-insertion.scss';
import '../style/editor.scss';

export function QueryEditor(props: UseQueryEditorArgs) {
  const ref = useQueryEditor(props, QueryEditor);
  return <div className="wizard-editor" ref={ref} />;
}
