import { useResultExplorerEditor, UseResultExplorerEditorArgs } from '../result-explorer-editor';

import '../style/codemirror.scss';
import '../style/fold.scss';
import '../style/info.scss';
import '../style/editor.scss';
import {useMemo} from 'react';
import { Paper, Stack } from '@mui/material';
import { ToolbarButton } from '../../toolbar';
import { CopyIcon } from 'src/icons';
import {useCopyResult} from '../hooks';

import "./result-explorer-editor.scss";

export function ResultExplorerEditor(props: UseResultExplorerEditorArgs) {
  const { className = '' } = { ...props };
  const copy = useCopyResult({caller: ResultExplorerEditor});
  const ref = useResultExplorerEditor(props, ResultExplorerEditor);
  const id = useMemo(() => Math.random(), []);

  return (
    <section
      className={`result-explorer-editor editor-${id} ${className}`}
      aria-label="Result Window"
      aria-live="polite"
      aria-atomic="true"
    >
      <Paper className="result-explorer-editor-paper">
        <Stack className="result-explorer-editor-stack" direction="row" justifyContent={'stretch'}>
          <div className="result-explorer-editor-codemirror" ref={ref} />
          <div className="result-explorer-editor-toolbar" role="toolbar" aria-label="Editor Commands">
            <ToolbarButton onClick={copy} label="Copy query (Shift-Ctrl-C)">
              <CopyIcon className="wizard-toolbar-icon" aria-hidden="true" />
            </ToolbarButton>
          </div>
        </Stack>
      </Paper>
    </section>
  );
}

