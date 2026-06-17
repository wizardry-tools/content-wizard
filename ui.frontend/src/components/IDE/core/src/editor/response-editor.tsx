import { formatError } from '@graphiql/toolkit';
import type { Position, Token } from 'codemirror';
import { useEffect, useRef } from 'react';
import type { JSX } from 'react';
import { createRoot } from 'react-dom/client';

import { Caller, CodeMirrorEditor, ResponseTooltipType, UseResponseEditorArgs } from '@/types';
import { useSchemaContext } from '../ide-providers';
import { commonKeys, DEFAULT_EDITOR_THEME, DEFAULT_KEY_MAP, importCodeMirror } from './common';
import { ImagePreview } from './components';
import { useEditorContext } from './context';
import { useSynchronizeOption } from './hooks';

export const useResponseEditor = (
  { responseTooltip, editorTheme = DEFAULT_EDITOR_THEME, keyMap = DEFAULT_KEY_MAP }: UseResponseEditorArgs = {},
  caller?: Caller,
) => {
  const { fetchError, validationErrors } = useSchemaContext({
    nonNull: true,
    caller: caller ?? useResponseEditor,
  });
  const { initialResponse, responseEditor, setResponseEditor } = useEditorContext({
    nonNull: true,
    caller: caller ?? useResponseEditor,
  });
  const ref = useRef<HTMLDivElement>(null);

  const responseTooltipRef = useRef<ResponseTooltipType | undefined>(responseTooltip);
  useEffect(() => {
    responseTooltipRef.current = responseTooltip;
  }, [responseTooltip]);

  useEffect(() => {
    let isActive = true;
    void importCodeMirror(
      [
        import('codemirror/addon/fold/foldgutter'),
        import('codemirror/addon/fold/brace-fold'),
        import('codemirror/addon/dialog/dialog'),
        import('codemirror/addon/search/search'),
        import('codemirror/addon/search/searchcursor'),
        import('codemirror/addon/search/jump-to-line'),
        import('codemirror/keymap/sublime' as never),
        import('codemirror-graphql/esm/results/mode'),
        import('codemirror-graphql/esm/utils/info-addon'),
      ],
      { useCommonAddons: false },
    ).then((CodeMirror) => {
      // Don't continue if the effect has already been cleaned up
      if (!isActive) {
        return;
      }

      // Handle image tooltips and custom tooltips
      const tooltipDiv = document.createElement('div');
      const tooltipRoot = createRoot(tooltipDiv);
      CodeMirror.registerHelper(
        'info',
        'graphql-results',
        (token: Token, _options: never, _cm: CodeMirrorEditor, pos: Position) => {
          const infoElements: JSX.Element[] = [];

          const ResponseTooltipComponent = responseTooltipRef.current;
          if (ResponseTooltipComponent) {
            infoElements.push(<ResponseTooltipComponent pos={pos} token={token} />);
          }

          if (ImagePreview.shouldRender(token)) {
            infoElements.push(<ImagePreview key="image-preview" token={token} />);
          }

          // React 19: render into a persistent root; render(null) clears it when there is
          // nothing to show (a createRoot root cannot be reused after unmount()).
          if (!infoElements.length) {
            tooltipRoot.render(null);
            return null;
          }
          tooltipRoot.render(infoElements);
          return tooltipDiv;
        },
      );

      const container = ref.current;
      if (!container) {
        return;
      }

      const newEditor = CodeMirror(container, {
        value: initialResponse,
        lineWrapping: true,
        readOnly: true,
        theme: editorTheme,
        mode: 'graphql-results',
        foldGutter: true,
        gutters: ['CodeMirror-foldgutter'],
        // @ts-expect-error CodeMirror Configs are severely outdated, need to migrate to CodeMirror6
        info: true,
        extraKeys: commonKeys,
      });

      setResponseEditor(newEditor);
    });

    return () => {
      isActive = false;
    };
  }, [editorTheme, initialResponse, setResponseEditor]);

  useSynchronizeOption(responseEditor, 'keyMap', keyMap);

  useEffect(() => {
    if (fetchError) {
      responseEditor?.setValue(fetchError);
    }
    if (validationErrors.length > 0) {
      responseEditor?.setValue(formatError(validationErrors));
    }
  }, [responseEditor, fetchError, validationErrors]);

  return ref;
};
