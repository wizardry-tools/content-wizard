import { useMemo } from 'react';
import { Paper, Stack } from '@mui/material';
import type { UseWizardStatementEditorArgs } from '@/types';
import { CopyIcon } from '@/icons';
import { ToolbarButton } from '../../toolbar';
import { useWizardStatementEditor } from '../wizard-statement-editor';
import { useCopyQuery } from '../hooks';
import '../style/codemirror.scss';
import '../style/fold.scss';
import '../style/info.scss';
import '../style/editor.scss';
import './wizard-statement-editor.scss';

export const WizardStatementEditor = (props: UseWizardStatementEditorArgs) => {
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
};
