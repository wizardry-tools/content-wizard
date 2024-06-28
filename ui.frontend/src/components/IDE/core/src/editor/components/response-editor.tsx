import type { UseResponseEditorArgs } from '@/types';
import { useResponseEditor } from '../response-editor';
import '../style/codemirror.scss';
import '../style/fold.scss';
import '../style/info.scss';
import '../style/editor.scss';

export const ResponseEditor = (props: UseResponseEditorArgs) => {
  const ref = useResponseEditor(props, ResponseEditor);
  return (
    <section className="result-window" aria-label="Result Window" aria-live="polite" aria-atomic="true" ref={ref} />
  );
};
