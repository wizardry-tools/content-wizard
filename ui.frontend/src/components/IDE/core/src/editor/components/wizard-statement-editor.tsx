import { useWizardStatementEditor, UseWizardStatementEditorArgs } from '../wizard-statement-editor';

import '../style/codemirror.scss';
import '../style/fold.scss';
import '../style/info.scss';
import '../style/editor.scss';
import { useMemo } from 'react';
import { Paper, Stack } from '@mui/material';
import { ToolbarButton } from '../../toolbar';
import { CopyIcon } from 'src/icons';
import { useCopyQuery } from '../hooks';

import "./wizard-statement-editor.scss";

export function WizardStatementEditor(props: UseWizardStatementEditorArgs) {
  const { className = '' } = { ...props };
  const copy = useCopyQuery();
  const ref = useWizardStatementEditor(props, WizardStatementEditor);
  const id = useMemo(() => Math.random(), []);

  return (
    <section
      className={`wizard-statement-editor editor-${id} ${className}`}
      aria-label="Result Window"
      aria-live="polite"
      aria-atomic="true"
    >
      <Paper className="wizard-statement-editor-paper">
        <Stack className="wizard-statement-editor-stack" direction="row" justifyContent={'stretch'}>
          <div className="wizard-statement-editor-codemirror" ref={ref} />
          <div className="wizard-statement-editor-toolbar" role="toolbar" aria-label="Editor Commands">
            <ToolbarButton onClick={copy} label="Copy query (Shift-Ctrl-C)">
              <CopyIcon className="wizard-toolbar-icon" aria-hidden="true" />
            </ToolbarButton>
          </div>
        </Stack>
      </Paper>
    </section>
  );
}
