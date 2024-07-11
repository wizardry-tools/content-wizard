import { useResultExplorerEditor, UseResultExplorerEditorArgs } from '../result-explorer-editor';

import '../style/codemirror.scss';
import '../style/fold.scss';
import '../style/info.scss';
import '../style/editor.scss';
import { useMemo } from 'react';
import { Paper, Stack } from '@mui/material';
import { ToolbarButton } from '../../toolbar';
import { CopyIcon } from 'src/icons';
import { useCopyResult } from '../hooks';

import './result-explorer-editor.scss';
import { styled, useTheme } from '@mui/material/styles';

const StyledToolbarButton = styled(ToolbarButton)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'light' ? theme.palette.primary.light : theme.palette.primary.dark,
  '&:hover': {
    backgroundColor: theme.palette.mode === 'light' ? theme.palette.secondary.light : theme.palette.secondary.dark,
  },
}));

export function ResultExplorerEditor(props: UseResultExplorerEditorArgs) {
  const { className = '' } = { ...props };
  const theme = useTheme();
  const copy = useCopyResult({ caller: ResultExplorerEditor });
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
            <StyledToolbarButton onClick={copy} label="Copy query (Shift-Ctrl-C)" theme={theme}>
              <CopyIcon className="wizard-toolbar-icon" aria-hidden="true" />
            </StyledToolbarButton>
          </div>
        </Stack>
      </Paper>
    </section>
  );
}
