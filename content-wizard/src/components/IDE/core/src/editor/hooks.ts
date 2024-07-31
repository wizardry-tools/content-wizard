import { fillLeafs, mergeAst } from '@graphiql/toolkit';
import type { EditorChange, EditorConfiguration } from 'codemirror';
import type { SchemaReference } from 'codemirror-graphql/utils/SchemaReference';
import copyToClipboard from 'copy-to-clipboard';
import { parse, print } from 'graphql';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  Caller,
  CodeMirrorEditor,
  EmptyCallback,
  Query,
  UseAutoCompleteLeafsArgs,
  UseCopyQueryArgs,
  UseCopyResultArgs,
  UseMergeQueryArgs,
  UsePrettifyEditorsArgs,
} from '@/types';
import { useIsGraphQL, useLogger } from '@/providers';
import { useExplorerContext } from '../explorer';
import { usePluginContext } from '../plugin';
import { useSchemaContext } from '../schema';
import { useStorageContext } from '../storage';
import debounce from '../utility/debounce';
import { onHasCompletion } from './completion';
import { useEditorContext } from './context';

/**
 * This method synchronizes values across editors.
 * Pass a null value to avoid a synchronization.
 * @param editor
 * @param value
 */
export function useSynchronizeValue(editor: CodeMirrorEditor | null, value: Query | string | undefined | null) {
  useEffect(() => {
    if (editor && value) {
      if (typeof value === 'string' && value !== editor.getValue()) {
        editor.setValue(value);
      } else if (typeof value !== 'string' && typeof value !== 'undefined' && value.statement !== editor.getValue()) {
        editor.setValue(value.statement);
      }
    }
  }, [editor, value]);
}

export function useSynchronizeOption<K extends keyof EditorConfiguration>(
  editor: CodeMirrorEditor | null,
  option: K,
  value: EditorConfiguration[K],
) {
  const logger = useLogger();
  useEffect(() => {
    if (editor) {
      logger.debug({ message: `useSynchronizeOption useEffect() setOption` });
      editor.setOption(option, value);
    }
  }, [editor, logger, option, value]);
}

export function useChangeHandler(
  editor: CodeMirrorEditor | null,
  callback: ((value: string) => void) | undefined,
  storageKey: string | null,
  tabProperty: 'variables' | 'headers',
  caller: Caller,
) {
  const logger = useLogger();
  const { updateActiveTabValues } = useEditorContext({ nonNull: true, caller });
  const storage = useStorageContext();

  useEffect(() => {
    if (!editor) {
      return;
    }

    const store = debounce(500, (value: string) => {
      if (!storage || storageKey === null) {
        return;
      }
      storage.set(storageKey, value);
    });

    const updateTab = debounce(100, (value: string) => {
      updateActiveTabValues({ [tabProperty]: value });
    });

    const handleChange = (editorInstance: CodeMirrorEditor, changeObj: EditorChange | undefined) => {
      // When we signal a change manually without actually changing anything
      // we don't want to invoke the callback.
      if (!changeObj) {
        return;
      }
      logger.debug({ message: `useChangeHandler useEffect() handleChange` });
      const newValue = editorInstance.getValue();
      store(newValue);
      updateTab(newValue);
      callback?.(newValue);
    };
    editor.on('change', handleChange);
    return () => {
      editor.off('change', handleChange);
    };
  }, [callback, editor, logger, storage, storageKey, tabProperty, updateActiveTabValues]);
}

export function useCompletion(
  editor: CodeMirrorEditor | null,
  callback: ((reference: SchemaReference) => void) | null,
  caller: Caller,
) {
  const { schema } = useSchemaContext({ nonNull: true, caller });
  const explorer = useExplorerContext();
  const plugin = usePluginContext();
  useEffect(() => {
    if (!editor) {
      return;
    }

    const handleCompletion = (instance: CodeMirrorEditor, changeObj?: EditorChange) => {
      onHasCompletion(instance, changeObj, schema, explorer, plugin, (type) => {
        callback?.({ kind: 'Type', type, schema: schema ?? undefined });
      });
    };
    // @ts-expect-error Type Definition for the editor.on doesn't support 'hasCompletion', but the logic is working...
    editor.on('hasCompletion', handleCompletion);
    return () => {
      // @ts-expect-error Type Definition for the editor.on doesn't support 'hasCompletion', but the logic is working...
      editor.off('hasCompletion', handleCompletion);
    };
  }, [callback, editor, explorer, plugin, schema]);
}

export function useKeyMap(editor: CodeMirrorEditor | null, keys: string[], callback: EmptyCallback | undefined) {
  useEffect(() => {
    if (!editor) {
      return;
    }
    for (const key of keys) {
      editor.removeKeyMap(key);
    }

    if (callback) {
      const keyMap: Record<string, EmptyCallback> = {};
      for (const key of keys) {
        keyMap[key] = () => {
          callback();
        };
      }
      editor.addKeyMap(keyMap);
    }
  }, [editor, keys, callback]);
}

export function useCopyQuery({ caller, onCopyQuery }: UseCopyQueryArgs = {}): EmptyCallback {
  const { queryEditor } = useEditorContext({
    nonNull: true,
    caller: caller ?? useCopyQuery,
  });
  return useCallback(() => {
    if (!queryEditor) {
      return;
    }

    const query = queryEditor.getValue();
    copyToClipboard(query);

    onCopyQuery?.(query);
  }, [queryEditor, onCopyQuery]);
}

export function useCopyResult({ caller }: UseCopyResultArgs = {}): EmptyCallback {
  const { resultExplorerEditor } = useEditorContext({
    nonNull: true,
    caller: caller ?? useCopyResult,
  });
  return useCallback(() => {
    if (!resultExplorerEditor) {
      return;
    }
    const result = resultExplorerEditor.getValue();
    copyToClipboard(result);
  }, [resultExplorerEditor]);
}

export function useMergeQuery({ caller }: UseMergeQueryArgs = {}): EmptyCallback {
  const { queryEditor } = useEditorContext({
    nonNull: true,
    caller: caller ?? useMergeQuery,
  });
  const { schema } = useSchemaContext({ nonNull: true, caller: useMergeQuery });
  return useCallback(() => {
    const documentAST = queryEditor?.documentAST;
    const query = queryEditor?.getValue();
    if (!documentAST || !query) {
      return;
    }

    queryEditor.setValue(print(mergeAst(documentAST, schema)));
  }, [queryEditor, schema]);
}

export function usePrettifyEditors({ caller }: UsePrettifyEditorsArgs = {}): EmptyCallback {
  const { queryEditor, headerEditor, variableEditor } = useEditorContext({
    nonNull: true,
    caller: caller ?? usePrettifyEditors,
  });
  const isGraphQL = useIsGraphQL();
  return useCallback(() => {
    if (variableEditor) {
      const variableEditorContent = variableEditor.getValue();
      try {
        const prettifiedVariableEditorContent = JSON.stringify(JSON.parse(variableEditorContent), null, 2);
        if (prettifiedVariableEditorContent !== variableEditorContent) {
          variableEditor.setValue(prettifiedVariableEditorContent);
        }
      } catch {
        /* Parsing JSON failed, skip prettification */
      }
    }

    if (headerEditor) {
      const headerEditorContent = headerEditor.getValue();

      try {
        const prettifiedHeaderEditorContent = JSON.stringify(JSON.parse(headerEditorContent), null, 2);
        if (prettifiedHeaderEditorContent !== headerEditorContent) {
          headerEditor.setValue(prettifiedHeaderEditorContent);
        }
      } catch {
        /* Parsing JSON failed, skip prettification */
      }
    }

    if (queryEditor && isGraphQL) {
      const editorContent = queryEditor.getValue();
      const prettifiedEditorContent = print(parse(editorContent));

      if (prettifiedEditorContent !== editorContent) {
        queryEditor.setValue(prettifiedEditorContent);
      }
    }
  }, [isGraphQL, queryEditor, variableEditor, headerEditor]);
}

export function useAutoCompleteLeafs({ getDefaultFieldNames, caller }: UseAutoCompleteLeafsArgs = {}): () =>
  | string
  | undefined {
  const { schema } = useSchemaContext({
    nonNull: true,
    caller: caller ?? useAutoCompleteLeafs,
  });
  const { queryEditor } = useEditorContext({
    nonNull: true,
    caller: caller ?? useAutoCompleteLeafs,
  });
  return useCallback(() => {
    if (!queryEditor) {
      return;
    }

    const query = queryEditor.getValue();
    const { insertions, result } = fillLeafs(schema, query, getDefaultFieldNames);
    if (insertions && insertions.length > 0) {
      queryEditor.operation(() => {
        const cursor = queryEditor.getCursor();
        const cursorIndex = queryEditor.indexFromPos(cursor);
        queryEditor.setValue(result ?? '');
        let added = 0;
        const markers = insertions.map(({ index, string }) =>
          queryEditor.markText(
            queryEditor.posFromIndex(index + added),
            queryEditor.posFromIndex(index + (added += string.length)),
            {
              className: 'auto-inserted-leaf',
              clearOnEnter: true,
              title: 'Automatically added leaf fields',
            },
          ),
        );
        setTimeout(() => {
          for (const marker of markers) {
            marker.clear();
          }
        }, 7000);
        let newCursorIndex = cursorIndex;
        for (const { index, string } of insertions) {
          if (index < cursorIndex) {
            newCursorIndex += string.length;
          }
        }
        queryEditor.setCursor(queryEditor.posFromIndex(newCursorIndex));
      });
    }

    return result;
  }, [getDefaultFieldNames, queryEditor, schema]);
}

// https://react.dev/learn/you-might-not-need-an-effect

export const useEditorState = (editor: 'query' | 'variable' | 'header') => {
  const context = useEditorContext({
    nonNull: true,
  });

  const editorInstance = context[`${editor}Editor` as const];
  let valueString = '';
  const editorValue = editorInstance?.getValue() ?? false;
  if (editorValue && editorValue.length > 0) {
    valueString = editorValue;
  }

  const handleEditorValue = useCallback((value: string) => editorInstance?.setValue(value), [editorInstance]);
  return useMemo<[string, (val: string) => void]>(
    () => [valueString, handleEditorValue],
    [valueString, handleEditorValue],
  );
};

/**
 * useState-like hook for current tab operations editor state
 */
export const useOperationsEditorState = (): [operations: string, setOperations: (content: string) => void] => {
  return useEditorState('query');
};

/**
 * useState-like hook for current tab variables editor state
 */
export const useVariablesEditorState = (): [variables: string, setVariables: (content: string) => void] => {
  return useEditorState('variable');
};

/**
 * useState-like hook for current tab variables editor state
 */
export const useHeadersEditorState = (): [headers: string, setHeaders: (content: string) => void] => {
  return useEditorState('header');
};

/**
 * Implements an optimistic caching strategy around a useState-like hook in
 * order to prevent loss of updates when the hook has an internal delay and the
 * update function is called again before the updated state is sent out.
 *
 * Use this as a wrapper around `useOperationsEditorState`,
 * `useVariablesEditorState`, or `useHeadersEditorState` if you anticipate
 * calling them with great frequency (due to, for instance, mouse, keyboard, or
 * network events).
 *
 * Example:
 *
 * ```ts
 * const [operationsString, handleEditOperations] =
 *   useOptimisticState(useOperationsEditorState());
 * ```
 */
export function useOptimisticState([upstreamState, upstreamSetState]: ReturnType<typeof useEditorState>): ReturnType<
  typeof useEditorState
> {
  const lastStateRef = useRef({
    /** The last thing that we sent upstream; we're expecting this back */
    pending: null as string | null,
    /** The last thing we received from upstream */
    last: upstreamState,
  });

  const [state, setOperationsText] = useState(upstreamState);

  useEffect(() => {
    if (lastStateRef.current.last === upstreamState) {
      // No change; ignore
    } else {
      lastStateRef.current.last = upstreamState;
      if (lastStateRef.current.pending === null) {
        // Gracefully accept update from upstream
        setOperationsText(upstreamState);
      } else if (lastStateRef.current.pending === upstreamState) {
        // They received our update and sent it back to us - clear pending, and
        // send next if appropriate
        lastStateRef.current.pending = null;
        if (upstreamState !== state) {
          // Change has occurred; upstream it
          lastStateRef.current.pending = state;
          upstreamSetState(state);
        }
      } else {
        // They got a different update; overwrite our local state (!!)
        lastStateRef.current.pending = null;
        setOperationsText(upstreamState);
      }
    }
  }, [upstreamState, state, upstreamSetState]);

  const setState = useCallback(
    (newState: string) => {
      setOperationsText(newState);
      if (lastStateRef.current.pending === null && lastStateRef.current.last !== newState) {
        // No pending updates and change has occurred... send it upstream
        lastStateRef.current.pending = newState;
        upstreamSetState(newState);
      }
    },
    [upstreamSetState],
  );

  return useMemo(() => [state, setState], [state, setState]);
}
