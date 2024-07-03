import React, {
  Fragment,
  MouseEventHandler,
  PropsWithChildren,
  ReactElement,
  useCallback,
  useState
} from "react";
import {
  Button,
  ButtonGroup,
  ChevronDownIcon,
  ChevronUpIcon,
  CopyIcon, Dialog, ExecuteButton, HeaderEditor, KeyboardShortcutIcon,
  MergeIcon, PlusIcon,
  PrettifyIcon, QueryEditor, ReloadIcon, ResponseEditor, SettingsIcon, Spinner, Tab, Tabs,
  ToolbarButton, Tooltip, UnStyledButton,
  useCopyQuery, useDragResize,
  useEditorContext, useExecutionContext,
  useMergeQuery, usePluginContext, usePrettifyEditors,
  useSchemaContext, useStorageContext,
  VariableEditor
} from "./core/src";
import {
  useIsGraphQL,
  useIDETheme,
  useThemeDispatch
} from "../Providers";
import Paper from '@mui/material/Paper';
import "./style.scss"





const majorVersion = parseInt(React.version.slice(0, 2), 10);


if (majorVersion < 18) {
  throw new Error(
    [
      'IDE 0.18.0 and after is not compatible with React 15 or below.',
      'If you are using a CDN source (jsdelivr, unpkg, etc), follow this example:',
      'https://github.com/graphql/graphiql/blob/master/examples/graphiql-cdn/index.html#L49',
    ].join('\n'),
  );
}

export type IDEToolbarConfig = {
  /**
   * This content will be rendered after the built-in buttons of the toolbar.
   * Note that this will not apply if you provide a completely custom toolbar
   * (by passing `IDE.Toolbar` as child to the `IDE` component).
   */
  additionalContent?: React.ReactNode;

  /**
   * same as above, except a component with access to context
   */
  additionalComponent?: React.JSXElementConstructor<any>;
};


/**
 * The top-level React component for IDE, intended to encompass the entire
 * browser viewport.
 *
 * @see https://github.com/graphql/graphiql#usage
 */

export function IDE() {

  return (
    <IDEInterface/>
  );
}

// Export main windows/panes to be used separately if desired.
IDE.Logo = IDELogo;
IDE.Toolbar = IDEToolbar;
IDE.Footer = IDEFooter;

export function IDEInterface() {
  const isGraphQL = useIsGraphQL();
  const isVariablesEditorEnabled = isGraphQL ?? true;
  const isHeadersEditorEnabled = isGraphQL ?? true;
  const editorContext = useEditorContext({ nonNull: true });
  const executionContext = useExecutionContext({ nonNull: true });
  const schemaContext = useSchemaContext({ nonNull: true });
  const storageContext = useStorageContext();
  const pluginContext = usePluginContext();

  const copy = useCopyQuery();
  const merge = useMergeQuery();
  const prettify = usePrettifyEditors();

  const theme = useIDETheme();
  const themeDispatch = useThemeDispatch();

  const PluginContent = pluginContext?.visiblePlugin?.content;

  const pluginResize = useDragResize({
    defaultSizeRelation: 1 / 3,
    direction: 'horizontal',
    initiallyHidden: pluginContext?.visiblePlugin ? undefined : 'first',
    onHiddenElementChange(resizableElement) {
      if (resizableElement === 'first') {
        pluginContext?.setVisiblePlugin(null);
      }
    },
    sizeThresholdSecond: 200,
    storageKey: 'docExplorerFlex',
  });
  const editorResize = useDragResize({
    direction: 'horizontal',
    storageKey: 'editorFlex',
  });
  const editorToolsResize = useDragResize({
    defaultSizeRelation: 3,
    direction: 'vertical',
    initiallyHidden: 'second',
    sizeThresholdSecond: 60,
    storageKey: 'secondaryEditorFlex',
  });

  const [activeSecondaryEditor, setActiveSecondaryEditor] = useState<
    'variables' | 'headers'
    >(() => {

    return !editorContext.initialVariables &&
    editorContext.initialHeaders &&
    isHeadersEditorEnabled
      ? 'headers'
      : 'variables';
  });
  const [showDialog, setShowDialog] = useState<
    'settings' | 'short-keys' | null
    >(null);
  const [clearStorageStatus, setClearStorageStatus] = useState<
    'success' | 'error' | null
    >(null);

  const logo = <IDE.Logo />;

  const toolbar = (
    <>
      {isGraphQL && (
        <>
          <ToolbarButton onClick={prettify} label="Prettify query (Shift-Ctrl-P)">
            <PrettifyIcon className="wizard-toolbar-icon" aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            onClick={merge}
            label="Merge fragments into query (Shift-Ctrl-M)"
          >
            <MergeIcon className="wizard-toolbar-icon" aria-hidden="true" />
          </ToolbarButton>
        </>
      )}
      <ToolbarButton onClick={copy} label="Copy query (Shift-Ctrl-C)">
        <CopyIcon className="wizard-toolbar-icon" aria-hidden="true" />
      </ToolbarButton>
    </>
  );

  const footer = <IDE.Footer />;

  const onClickReference = useCallback(() => {
    if (pluginResize.hiddenElement === 'first') {
      pluginResize.setHiddenElement(null);
    }
  }, [pluginResize]);

  const handleClearData = useCallback(() => {
    try {
      storageContext?.clear();
      setClearStorageStatus('success');
    } catch {
      setClearStorageStatus('error');
    }
  }, [storageContext]);

  const handlePersistHeaders: MouseEventHandler<HTMLButtonElement> =
    useCallback(
      event => {
        editorContext.setShouldPersistHeaders(
          event.currentTarget.dataset.value === 'true',
        );
      },
      [editorContext],
    );

  const handleChangeTheme: MouseEventHandler<HTMLButtonElement> = useCallback(
    event => {
      const selectedTheme = event.currentTarget.dataset.theme as
        | 'light'
        | 'dark'
        | undefined;
      themeDispatch(selectedTheme || null);
    },
    [themeDispatch],
  );

  const handleAddTab = editorContext.addTab;
  const handleRefetchSchema = schemaContext.introspect;
  const handleReorder = editorContext.moveTab;

  const handleShowDialog: MouseEventHandler<HTMLButtonElement> = useCallback(
    event => {
      setShowDialog(
        event.currentTarget.dataset.value as 'short-keys' | 'settings',
      );
    },
    [],
  );

  const handlePluginClick: MouseEventHandler<HTMLButtonElement> = useCallback(
    e => {
      const context = pluginContext!;
      const pluginIndex = Number(e.currentTarget.dataset.index!);
      const plugin = context.plugins.find((_, index) => pluginIndex === index)!;
      const isVisible = plugin === context.visiblePlugin;
      if (isVisible) {
        context.setVisiblePlugin(null);
        pluginResize.setHiddenElement('first');
      } else {
        context.setVisiblePlugin(plugin);
        pluginResize.setHiddenElement(null);
      }
    },
    [pluginContext, pluginResize],
  );

  const handleToolsTabClick: MouseEventHandler<HTMLButtonElement> = useCallback(
    event => {
      if (editorToolsResize.hiddenElement === 'second') {
        editorToolsResize.setHiddenElement(null);
      }
      setActiveSecondaryEditor(
        event.currentTarget.dataset.name as 'variables' | 'headers',
      );
    },
    [editorToolsResize],
  );

  const toggleEditorTools: MouseEventHandler<HTMLButtonElement> =
    useCallback(() => {
      editorToolsResize.setHiddenElement(
        editorToolsResize.hiddenElement === 'second' ? null : 'second',
      );
    }, [editorToolsResize]);

  const handleOpenShortKeysDialog = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      setShowDialog(null);
    }
  }, []);

  const handleOpenSettingsDialog = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      setShowDialog(null);
      setClearStorageStatus(null);
    }
  }, []);

  const addTab = (
    <Tooltip label="Add tab">
      <UnStyledButton
        type="button"
        className="wizard-tab-add"
        onClick={handleAddTab}
        aria-label="Add tab"
      >
        <PlusIcon aria-hidden="true" />
      </UnStyledButton>
    </Tooltip>
  );

  return (
    <Tooltip.Provider>
      <div data-testid="wizard-container" className="wizard-container">
        <div className="wizard-sidebar">
          <div className="wizard-sidebar-section">
            {pluginContext?.plugins.map((plugin, index) => {
              const isVisible = plugin === pluginContext.visiblePlugin;
              const label = `${isVisible ? 'Hide' : 'Show'} ${plugin.title}`;
              const Icon = plugin.icon;
              return (
                <Tooltip key={plugin.title} label={label}>
                  <UnStyledButton
                    type="button"
                    className={isVisible ? 'active' : ''}
                    onClick={handlePluginClick}
                    data-index={index}
                    aria-label={label}
                  >
                    <Icon aria-hidden="true" />
                  </UnStyledButton>
                </Tooltip>
              );
            })}
          </div>
          <div className="wizard-sidebar-section">
            {isGraphQL && (
              <Tooltip label="Re-fetch GraphQL schema">
                <UnStyledButton
                  type="button"
                  disabled={schemaContext.isFetching}
                  onClick={handleRefetchSchema}
                  aria-label="Re-fetch GraphQL schema"
                >
                  <ReloadIcon
                    className={schemaContext.isFetching ? 'wizard-spin' : ''}
                    aria-hidden="true"
                  />
                </UnStyledButton>
              </Tooltip>
            )}
            <Tooltip label="Open short keys dialog">
              <UnStyledButton
                type="button"
                data-value="short-keys"
                onClick={handleShowDialog}
                aria-label="Open short keys dialog"
              >
                <KeyboardShortcutIcon aria-hidden="true" />
              </UnStyledButton>
            </Tooltip>
            <Tooltip label="Open settings dialog">
              <UnStyledButton
                type="button"
                data-value="settings"
                onClick={handleShowDialog}
                aria-label="Open settings dialog"
              >
                <SettingsIcon aria-hidden="true" />
              </UnStyledButton>
            </Tooltip>
          </div>
        </div>
        <div className="wizard-main">
          <div
            ref={pluginResize.firstRef}
            style={{
              // Make sure the container shrinks when containing long
              // non-breaking texts
              minWidth: '200px',
            }}
          >
            <div className="wizard-plugin">
              {PluginContent ? <PluginContent /> : null}
            </div>
          </div>
          {pluginContext?.visiblePlugin && (
            <div
              className="wizard-horizontal-drag-bar"
              ref={pluginResize.dragBarRef}
            />
          )}
          <Paper ref={pluginResize.secondRef} elevation={3} className="wizard-sessions">
            <div className="wizard-session-header">
              <Tabs
                values={editorContext.tabs}
                onReorder={handleReorder}
                aria-label="Select active operation"
              >
                {editorContext.tabs.length > 1 && (
                  <>
                    {editorContext.tabs.map((tab, index) => (
                      <Tab
                        key={tab.id}
                        value={tab}
                        isActive={index === editorContext.activeTabIndex}
                      >
                        <Tab.Button
                          aria-controls="wizard-session"
                          id={`wizard-session-tab-${index}`}
                          onClick={() => {
                            executionContext.stop();
                            editorContext.changeTab(index);
                          }}
                        >
                          {tab.title}
                        </Tab.Button>
                        <Tab.Close
                          onClick={() => {
                            if (editorContext.activeTabIndex === index) {
                              executionContext.stop();
                            }
                            editorContext.closeTab(index);
                          }}
                        />
                      </Tab>
                    ))}
                    {addTab}
                  </>
                )}
              </Tabs>
              <div className="wizard-session-header-right">
                {editorContext.tabs.length === 1 && addTab}
                {logo}
              </div>
            </div>
            <div
              role="tabpanel"
              id="wizard-session"
              className="wizard-session"
              aria-labelledby={`wizard-session-tab-${editorContext.activeTabIndex}`}
            >
              <div ref={editorResize.firstRef}>
                <Paper
                  className={`wizard-editors${
                    editorContext.tabs.length === 1 ? ' full-height' : ''
                  }`}
                  elevation={3}
                >
                  <div ref={editorToolsResize.firstRef}>
                    <section
                      className="wizard-query-editor"
                      aria-label="Query Editor"
                    >
                      <QueryEditor
                        editorTheme="wizard"
                        keyMap="sublime"
                        onClickReference={onClickReference}
                      />
                      <div
                        className="wizard-toolbar"
                        role="toolbar"
                        aria-label="Editor Commands"
                      >
                        <ExecuteButton />
                        {toolbar}
                      </div>
                    </section>
                  </div>

                  {(isVariablesEditorEnabled || isHeadersEditorEnabled) && (
                    <div ref={editorToolsResize.dragBarRef}>
                      <div className="wizard-editor-tools">
                        {isVariablesEditorEnabled && (
                          <UnStyledButton
                            type="button"
                            className={
                              activeSecondaryEditor === 'variables' &&
                              editorToolsResize.hiddenElement !== 'second'
                                ? 'active'
                                : ''
                            }
                            onClick={handleToolsTabClick}
                            data-name="variables"
                          >
                            Variables
                          </UnStyledButton>
                        )}
                        {isHeadersEditorEnabled && (
                          <UnStyledButton
                            type="button"
                            className={
                              activeSecondaryEditor === 'headers' &&
                              editorToolsResize.hiddenElement !== 'second'
                                ? 'active'
                                : ''
                            }
                            onClick={handleToolsTabClick}
                            data-name="headers"
                          >
                            Headers
                          </UnStyledButton>
                        )}

                        <Tooltip
                          label={
                            editorToolsResize.hiddenElement === 'second'
                              ? 'Show editor tools'
                              : 'Hide editor tools'
                          }
                        >
                          <UnStyledButton
                            type="button"
                            onClick={toggleEditorTools}
                            aria-label={
                              editorToolsResize.hiddenElement === 'second'
                                ? 'Show editor tools'
                                : 'Hide editor tools'
                            }
                            className="wizard-toggle-editor-tools"
                          >
                            {editorToolsResize.hiddenElement === 'second' ? (
                              <ChevronUpIcon
                                className="wizard-chevron-icon"
                                aria-hidden="true"
                              />
                            ) : (
                              <ChevronDownIcon
                                className="wizard-chevron-icon"
                                aria-hidden="true"
                              />
                            )}
                          </UnStyledButton>
                        </Tooltip>
                      </div>
                    </div>
                  )}

                  {(isVariablesEditorEnabled || isHeadersEditorEnabled) && (
                    <div ref={editorToolsResize.secondRef}>
                      <section
                        className="wizard-editor-tool"
                        aria-label={
                          activeSecondaryEditor === 'variables'
                            ? 'Variables'
                            : 'Headers'
                        }
                      >
                        {isVariablesEditorEnabled && (
                          <VariableEditor
                            editorTheme="wizard"
                            isHidden={activeSecondaryEditor !== 'variables'}
                            keyMap="sublime"
                            onClickReference={onClickReference}
                          />
                        )}
                        {isHeadersEditorEnabled && (
                          <HeaderEditor
                            editorTheme="wizard"
                            isHidden={activeSecondaryEditor !== 'headers'}
                            keyMap="sublime"
                          />
                        )}
                      </section>
                    </div>
                  )}
                </Paper>
              </div>

              <div
                className="wizard-horizontal-drag-bar"
                ref={editorResize.dragBarRef}
              />

              <div ref={editorResize.secondRef}>
                <div className="wizard-response">
                  {executionContext.isFetching ? <Spinner /> : null}
                  <ResponseEditor
                    editorTheme="wizard"
                    keyMap="sublime"
                  />
                  {footer}
                </div>
              </div>
            </div>
          </Paper>
        </div>
        <Dialog
          open={showDialog === 'short-keys'}
          onOpenChange={handleOpenShortKeysDialog}
        >
          <div className="wizard-dialog-header">
            <Dialog.Title className="wizard-dialog-title">
              Short Keys
            </Dialog.Title>
            <Dialog.Close />
          </div>
          <div className="wizard-dialog-section">
            <ShortKeys keyMap="sublime" />
          </div>
        </Dialog>
        <Dialog
          open={showDialog === 'settings'}
          onOpenChange={handleOpenSettingsDialog}
        >
          <div className="wizard-dialog-header">
            <Dialog.Title className="wizard-dialog-title">
              Settings
            </Dialog.Title>
            <Dialog.Close />
          </div>
          <div className="wizard-dialog-section">
            <div>
              <div className="wizard-dialog-section-title">
                Persist headers
              </div>
              <div className="wizard-dialog-section-caption">
                Save headers upon reloading.{' '}
                <span className="wizard-warning-text">
                  Only enable if you trust this device.
                </span>
              </div>
            </div>
            <ButtonGroup>
              <Button
                type="button"
                id="enable-persist-headers"
                className={editorContext.shouldPersistHeaders ? 'active' : ''}
                data-value="true"
                onClick={handlePersistHeaders}
              >
                On
              </Button>
              <Button
                type="button"
                id="disable-persist-headers"
                className={editorContext.shouldPersistHeaders ? '' : 'active'}
                onClick={handlePersistHeaders}
              >
                Off
              </Button>
            </ButtonGroup>
          </div>
          <div className="wizard-dialog-section">
            <div>
              <div className="wizard-dialog-section-title">Theme</div>
              <div className="wizard-dialog-section-caption">
                Adjust how the interface looks like.
              </div>
            </div>
            <ButtonGroup>
              <Button
                type="button"
                className={theme === null ? 'active' : ''}
                onClick={handleChangeTheme}
              >
                System
              </Button>
              <Button
                type="button"
                className={theme === 'light' ? 'active' : ''}
                data-theme="light"
                onClick={handleChangeTheme}
              >
                Light
              </Button>
              <Button
                type="button"
                className={theme === 'dark' ? 'active' : ''}
                data-theme="dark"
                onClick={handleChangeTheme}
              >
                Dark
              </Button>
            </ButtonGroup>
          </div>
          {storageContext ? (
            <div className="wizard-dialog-section">
              <div>
                <div className="wizard-dialog-section-title">
                  Clear storage
                </div>
                <div className="wizard-dialog-section-caption">
                  Remove all locally stored data and start fresh.
                </div>
              </div>
              <Button
                type="button"
                state={clearStorageStatus || undefined}
                disabled={clearStorageStatus === 'success'}
                onClick={handleClearData}
              >
                {{
                  success: 'Cleared data',
                  error: 'Failed',
                }[clearStorageStatus!] || 'Clear data'}
              </Button>
            </div>
          ) : null}
        </Dialog>
      </div>
    </Tooltip.Provider>
  );
}

const modifier =
  typeof window !== 'undefined' &&
  window.navigator.platform.toLowerCase().indexOf('mac') === 0
    ? 'Cmd'
    : 'Ctrl';

const SHORT_KEYS = Object.entries({
  'Search in editor': [modifier, 'F'],
  'Search in documentation': [modifier, 'K'],
  'Execute query': [modifier, 'Enter'],
  'Prettify editors': ['Ctrl', 'Shift', 'P'],
  'Merge fragments definitions into operation definition': [
    'Ctrl',
    'Shift',
    'M',
  ],
  'Copy query': ['Ctrl', 'Shift', 'C'],
  'Re-fetch schema using introspection': ['Ctrl', 'Shift', 'R'],
});

function ShortKeys({ keyMap }: { keyMap: string }): ReactElement {
  return (
    <div>
      <table className="wizard-table">
        <thead>
        <tr>
          <th>Short Key</th>
          <th>Function</th>
        </tr>
        </thead>
        <tbody>
        {SHORT_KEYS.map(([title, keys]) => (
          <tr key={title}>
            <td>
              {keys.map((key, index, array) => (
                <Fragment key={key}>
                  <code className="wizard-key">{key}</code>
                  {index !== array.length - 1 && ' + '}
                </Fragment>
              ))}
            </td>
            <td>{title}</td>
          </tr>
        ))}
        </tbody>
      </table>
      <p>
        The editors use{' '}
        <a
          href="https://codemirror.net/5/doc/manual.html#keymaps"
          target="_blank"
          rel="noopener noreferrer"
        >
          CodeMirror Key Maps
        </a>{' '}
        that add more short keys. This instance of Graph<em>i</em>QL uses{' '}
        <code>{keyMap}</code>.
      </p>
    </div>
  );
}

// Configure the UI by providing this Component as a child of IDE.
function IDELogo<TProps>(props: PropsWithChildren<TProps>) {
  return (
    <div className="wizard-logo">
      {props.children || (
        <a
          className="wizard-logo-link"
          href="https://github.com/graphql/graphiql"
          target="_blank"
          rel="noreferrer"
        >
          Graph
          <em>i</em>
          QL
        </a>
      )}
    </div>
  );
}

IDELogo.displayName = 'IDELogo';

// Configure the UI by providing this Component as a child of IDE.
function IDEToolbar<TProps>(props: PropsWithChildren<TProps>) {
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{props.children}</>;
}

IDEToolbar.displayName = 'IDEToolbar';

// Configure the UI by providing this Component as a child of IDE.
function IDEFooter<TProps>(props: PropsWithChildren<TProps>) {
  if (props.children) {
    return <div className="wizard-footer">{props.children}</div>;
  }
  return null;
}

IDEFooter.displayName = 'IDEFooter';

