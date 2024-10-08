import { getSelectedOperationName } from '@graphiql/toolkit';
import type { SchemaReference } from 'codemirror-graphql/utils/SchemaReference';
import type { GraphQLSchema, ValidationRule } from 'graphql';
import { getOperationFacts, GraphQLDocumentMode } from 'graphql-language-service';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { MutableRefObject } from 'react';

import {
  Caller,
  CodeMirrorEditor,
  CodeMirrorEditorWithOperationFacts,
  CodeMirrorImport,
  CodeMirrorType,
  UseQueryEditorArgs,
} from '@/types';
import { useRenderCount } from '@/utility';
import { useIsGraphQL, useLogger, useQuery, useQueryDispatcher } from '@/providers';
import {
  useExecutionContext,
  useSchemaContext,
  useStorageContext,
  DOC_EXPLORER_PLUGIN,
  usePluginContext,
} from '../ide-providers';
import { useExplorerContext } from '../explorer';
import { markdown } from '../markdown';
import debounce from '../utility/debounce';
import { commonKeys, DEFAULT_EDITOR_THEME, DEFAULT_KEY_MAP, importCodeMirror } from './common';
import { useEditorContext } from './context';
import {
  useCompletion,
  useCopyQuery,
  useKeyMap,
  useMergeQuery,
  usePrettifyEditors,
  useSynchronizeOption,
} from './hooks';
import { normalizeWhitespace } from './whitespace';

export const useQueryEditor = (
  {
    editorTheme = DEFAULT_EDITOR_THEME,
    keyMap = DEFAULT_KEY_MAP,
    onCopyQuery,
    readOnly = false,
  }: UseQueryEditorArgs = {},
  caller?: Caller,
) => {
  const logger = useLogger();
  const renderCount = useRenderCount();
  logger.debug({ message: `useQueryEditor[${renderCount}] render()` });
  const { schema } = useSchemaContext({
    nonNull: true,
    caller: caller ?? useQueryEditor,
  });
  const queryObj = useQuery();
  const queryObjStatement = useRef(queryObj.statement);
  const queryLanguage = useMemo(() => queryObj.language, [queryObj.language]);
  const {
    initialQuery,
    queryEditor,
    setOperationName,
    setQueryEditor,
    validationRules,
    variableEditor,
    updateActiveTabValues,
  } = useEditorContext({
    nonNull: true,
    caller: caller ?? useQueryEditor,
  });
  const executionContext = useExecutionContext();
  const storage = useStorageContext();
  const explorer = useExplorerContext();
  const plugin = usePluginContext();
  const copy = useCopyQuery({ caller: caller ?? useQueryEditor, onCopyQuery });
  const merge = useMergeQuery({ caller: caller ?? useQueryEditor });
  const prettify = usePrettifyEditors({ caller: caller ?? useQueryEditor });
  const ref = useRef<HTMLDivElement>(null);
  const codeMirrorRef = useRef<CodeMirrorType>();
  const queryDispatcher = useQueryDispatcher();
  const isGraphQL = useIsGraphQL();

  const onClickReferenceRef = useRef<NonNullable<UseQueryEditorArgs['onClickReference']>>(() => ({}));
  useEffect(() => {
    onClickReferenceRef.current = (reference) => {
      if (!explorer || !plugin) {
        return;
      }
      plugin.setVisiblePlugin(DOC_EXPLORER_PLUGIN);
      switch (reference.kind) {
        case 'Type': {
          explorer.push({ name: reference.type.name, def: reference.type });
          break;
        }
        case 'Field': {
          explorer.push({ name: reference.field.name, def: reference.field });
          break;
        }
        case 'Argument': {
          if (reference.field) {
            explorer.push({ name: reference.field.name, def: reference.field });
          }
          break;
        }
        case 'EnumValue': {
          if (reference.type) {
            explorer.push({ name: reference.type.name, def: reference.type });
          }
          break;
        }
      }
    };
  }, [explorer, plugin]);

  useEffect(() => {
    let isActive = true;
    const addons: CodeMirrorImport[] = [
      import('codemirror/addon/comment/comment'),
      import('codemirror/addon/search/search'),
    ];

    let mode = '';
    switch (queryLanguage) {
      case 'GraphQL': {
        addons.push(
          import('codemirror-graphql/esm/hint'),
          import('codemirror-graphql/esm/lint'),
          import('codemirror-graphql/esm/info'),
          import('codemirror-graphql/esm/jump'),
          import('codemirror-graphql/esm/mode'),
        );
        mode = 'graphql';
        break;
      }
      case 'SQL': {
        addons.push(import('@/components/IDE/core/modes/sql/sql'));
        mode = 'text/x-sql';
        break;
      }
      case 'JCR_SQL2': {
        addons.push(import('@/components/IDE/core/modes/sql/sql'));
        mode = 'text/x-jcrsql2';
        break;
      }
      case 'XPATH': {
        addons.push(import('@/components/IDE/core/modes/xpath/xpath'));
        mode = 'xpath';
        break;
      }
      default: {
        addons.push(import('@/components/IDE/core/modes/querybuilder/querybuilder'));
        mode = 'querybuilder';
      }
    }

    void importCodeMirror(addons, { useCommonAddons: !isGraphQL }).then((CodeMirror) => {
      // Don't continue if the effect has already been cleaned up
      if (!isActive) {
        return;
      }

      codeMirrorRef.current = CodeMirror;

      const container = ref.current;
      if (!container) {
        return;
      }

      const newEditor = CodeMirror(container, {
        value: initialQuery?.statement ?? queryObjStatement.current ?? '',
        lineNumbers: true,
        tabSize: 2,
        foldGutter: true,
        mode: mode,
        theme: editorTheme,
        autoCloseBrackets: true,
        matchBrackets: true,
        showCursorWhenSelecting: true,
        readOnly: readOnly ? 'nocursor' : false,
        ...(isGraphQL
          ? {
              lint: {
                schema: undefined,
                validationRules: null,
                // linting accepts string or FragmentDefinitionNode[]
                externalFragments: undefined,
              },
              hintOptions: {
                schema: undefined,
                closeOnUnfocus: false,
                completeSingle: false,
                container,
                externalFragments: undefined,
                autocompleteOptions: {
                  // for the query editor, restrict to executable type definitions
                  mode: GraphQLDocumentMode.EXECUTABLE,
                },
              },
              info: {
                schema: undefined,
                renderDescription: (text: string) => markdown.render(text),
                onClick: (reference: SchemaReference) => {
                  onClickReferenceRef.current(reference);
                },
              },
            }
          : {
              lint: {},
              hintOptions: {},
              info: {},
            }),
        // @ts-expect-error CodeMirror Configs are severely outdated, need to migrate to CodeMirror6
        jump: {
          schema: undefined,
          onClick: (reference: SchemaReference) => {
            onClickReferenceRef.current(reference);
          },
        },
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
        extraKeys: {
          ...commonKeys,
          'Cmd-S': () => {
            // empty
          },
          'Ctrl-S': () => {
            // empty
          },
        },
      }) as CodeMirrorEditorWithOperationFacts;

      newEditor.addKeyMap({
        'Cmd-Space': () => {
          newEditor.showHint({ completeSingle: true, container });
        },
        'Ctrl-Space': () => {
          newEditor.showHint({ completeSingle: true, container });
        },
        'Alt-Space': () => {
          newEditor.showHint({ completeSingle: true, container });
        },
        'Shift-Space': () => {
          newEditor.showHint({ completeSingle: true, container });
        },
        'Shift-Alt-Space': () => {
          newEditor.showHint({ completeSingle: true, container });
        },
      });

      newEditor.on('keyup', (editorInstance, event) => {
        if (AUTO_COMPLETE_AFTER_KEY.test(event.key)) {
          editorInstance.execCommand('autocomplete');
        }
      });

      let showingHints = false;

      // fired whenever a hint dialog opens
      newEditor.on('startCompletion', () => {
        showingHints = true;
      });

      // the codemirror hint extension fires this anytime the dialog is closed
      // via any method (e.g. focus blur, escape key, ...)
      newEditor.on('endCompletion', () => {
        showingHints = false;
      });

      newEditor.on('keydown', (_editorInstance, event) => {
        if (event.key === 'Escape' && showingHints) {
          event.stopPropagation();
        }
      });

      newEditor.on('beforeChange', (_editorInstance, change) => {
        // The update function is only present on non-redo, non-undo events.
        if (change.origin === 'paste') {
          const text = change.text.map(normalizeWhitespace);
          change.update?.(change.from, change.to, text);
        }
      });

      newEditor.documentAST = null;
      newEditor.operations = null;
      newEditor.variableToType = null;

      setQueryEditor(newEditor);
    });

    return () => {
      isActive = false;
    };
  }, [editorTheme, initialQuery, isGraphQL, readOnly, queryLanguage, setQueryEditor]);

  useSynchronizeOption(queryEditor, 'keyMap', keyMap);

  /**
   * We don't use the generic `useChangeHandler` hook here because we want to
   * have additional logic that updates the operation facts that we store as
   * properties on the editor.
   */
  useEffect(() => {
    if (!queryEditor) {
      return;
    }
    const getAndUpdateOperationFacts = (editorInstance: CodeMirrorEditorWithOperationFacts) => {
      const operationFacts = getOperationFacts(schema, editorInstance.getValue());

      // Update operation name should any query names change.
      const operationName = getSelectedOperationName(
        editorInstance.operations ?? undefined,
        editorInstance.operationName ?? undefined,
        operationFacts?.operations,
      );

      // Store the operation facts on editor properties
      editorInstance.documentAST = operationFacts?.documentAST ?? null;
      editorInstance.operationName = operationName ?? null;
      editorInstance.operations = operationFacts?.operations ?? null;

      // Update variable types for the variable editor
      if (variableEditor?.options?.lint) {
        variableEditor.state.lint.linterOptions.variableToType = operationFacts?.variableToType;
        variableEditor.options.lint.variableToType = operationFacts?.variableToType;
        variableEditor.options.hintOptions.variableToType = operationFacts?.variableToType;
        codeMirrorRef.current?.signal(variableEditor, 'change', variableEditor);
      }
      return operationFacts ? { ...operationFacts, operationName } : null;
    };

    const handleChange = debounce(100, (editorInstance: CodeMirrorEditorWithOperationFacts) => {
      const query = {
        ...queryObj,
        statement: editorInstance.getValue(),
      };
      storage.set(STORAGE_KEY_QUERY, JSON.stringify(query));

      const currentOperationName = editorInstance.operationName;
      const operationFacts = getAndUpdateOperationFacts(editorInstance);
      if (operationFacts?.operationName !== undefined) {
        storage.set(STORAGE_KEY_OPERATION_NAME, operationFacts.operationName);
      }

      if (operationFacts?.operationName && currentOperationName !== operationFacts.operationName) {
        setOperationName(operationFacts.operationName);
      }

      updateActiveTabValues({
        query,
        operationName: operationFacts?.operationName ?? null,
      });
      queryDispatcher({
        statement: query.statement,
        type: 'statementChange',
      });
    }) as (editorInstance: CodeMirrorEditor) => void;

    // Call once to initially update the values
    getAndUpdateOperationFacts(queryEditor);

    queryEditor.on('change', handleChange);
    return () => {
      queryEditor.off('change', handleChange);
    };
  }, [
    queryEditor,
    schema,
    setOperationName,
    storage,
    variableEditor,
    updateActiveTabValues,
    queryDispatcher,
    queryObj,
  ]);

  useSynchronizeSchema(queryEditor, schema ?? null, codeMirrorRef);
  useSynchronizeValidationRules(queryEditor, validationRules ?? null, codeMirrorRef);

  useCompletion(queryEditor, null, useQueryEditor);

  const run = executionContext?.run;
  const runAtCursor = useCallback(() => {
    if (!run || !queryEditor?.operations || !queryEditor.hasFocus()) {
      run?.();
      return;
    }

    const cursorIndex = queryEditor.indexFromPos(queryEditor.getCursor());

    // Loop through all operations to see if one contains the cursor.
    let operationName: string | undefined;
    for (const operation of queryEditor.operations) {
      if (operation.loc && operation.loc.start <= cursorIndex && operation.loc.end >= cursorIndex) {
        operationName = operation.name?.value;
      }
    }

    if (operationName && operationName !== queryEditor.operationName) {
      setOperationName(operationName);
    }

    run();
  }, [queryEditor, run, setOperationName]);

  useKeyMap(queryEditor, ['Cmd-Enter', 'Ctrl-Enter'], runAtCursor);
  useKeyMap(queryEditor, ['Shift-Ctrl-C'], copy);
  useKeyMap(
    queryEditor,
    [
      'Shift-Ctrl-P',
      // Shift-Ctrl-P is hard coded in Firefox for private browsing so adding an alternative to prettify
      'Shift-Ctrl-F',
    ],
    prettify,
  );
  useKeyMap(queryEditor, ['Shift-Ctrl-M'], merge);

  return ref;
};

const useSynchronizeSchema = (
  editor: CodeMirrorEditor | null,
  schema: GraphQLSchema | null,
  codeMirrorRef: MutableRefObject<CodeMirrorType | undefined>,
) => {
  useEffect(() => {
    if (!editor) {
      return;
    }
    const didChange = JSON.stringify(editor.options.lint.schema) !== JSON.stringify(schema);

    editor.state.lint.linterOptions.schema = schema;
    editor.options.lint.schema = schema;
    editor.options.hintOptions.schema = schema;
    editor.options.info.schema = schema;
    editor.options.jump.schema = schema;

    if (didChange && codeMirrorRef.current) {
      codeMirrorRef.current.signal(editor, 'change', editor);
    }
  }, [editor, schema, codeMirrorRef]);
};

const useSynchronizeValidationRules = (
  editor: CodeMirrorEditor | null,
  validationRules: ValidationRule[] | null,
  codeMirrorRef: MutableRefObject<CodeMirrorType | undefined>,
) => {
  useEffect(() => {
    if (!editor) {
      return;
    }

    const didChange = editor.options.lint.validationRules !== validationRules;

    editor.state.lint.linterOptions.validationRules = validationRules;
    editor.options.lint.validationRules = validationRules;

    if (didChange && codeMirrorRef.current) {
      codeMirrorRef.current.signal(editor, 'change', editor);
    }
  }, [editor, validationRules, codeMirrorRef]);
};

const AUTO_COMPLETE_AFTER_KEY = /^[a-zA-Z0-9_@(]$/;

export const STORAGE_KEY_QUERY = 'query';

const STORAGE_KEY_OPERATION_NAME = 'operationName';
