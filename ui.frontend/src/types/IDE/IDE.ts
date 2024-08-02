import type { ComponentType, PropsWithChildren, ReactNode } from 'react';
import type { Query } from '@/types';

export type IDEProviderProps = PropsWithChildren;

export type Caller<T = never> = ((props?: T, caller?: Caller) => unknown) | ComponentType<T>;

export type ToolbarButtonProps = {
  label: string;
};

export type ToolbarMenuProps = {
  button: ReactNode;
  label: string;
};

export type ButtonProps = { state?: 'success' | 'error' };

export type MarkdownContentProps = {
  children: string;
  onlyShowFirstChild?: boolean;
  type: 'description' | 'deprecation';
};

export type TabDefinition = {
  /**
   * The contents of the query editor of this tab.
   */
  query: Query;
  /**
   * The contents of the variable editor of this tab.
   */
  variables?: string | null;
  /**
   * The contents of the headers editor of this tab.
   */
  headers?: string | null;
};

/**
 * This object describes the state of a single tab.
 */
export type TabState = TabDefinition & {
  /**
   * A GUID value generated when the tab was created.
   */
  id: string;
  /**
   * A hash that is unique for a combination of the contents of the query
   * editor, the variable editor and the header editor (i.e. all the editor
   * where the contents are persisted in storage).
   */
  hash: string;
  /**
   * The title of the tab shown in the tab element.
   */
  title: string;
  /**
   * The operation name derived from the contents of the query editor of this
   * tab.
   */
  operationName: string | null;
  /**
   * The contents of the response editor of this tab.
   */
  response: string | null;
};

/**
 * This object describes the state of all tabs.
 */
export type TabsState = {
  /**
   * A list of state objects for each tab.
   */
  tabs: TabState[];
  /**
   * The index of the currently active tab with regards to the `tabs` list of
   * this object.
   */
  activeTabIndex: number;
};

export type TabProps = {
  isActive?: boolean;
  value: TabState;
  className?: string;
  children: ReactNode;
};

export type TabsProps = {
  values: TabState[];
  onReorder: (newOrder: TabState[]) => void;
  className?: string;
  children: ReactNode;
};

export type ResizableElement = 'first' | 'second';

export type UseDragResizeArgs = {
  /**
   * Set the default sizes for the two resizable halves by passing their ratio
   * (first divided by second).
   */
  defaultSizeRelation?: number;
  /**
   * The direction in which the two halves should be resizable.
   */
  direction: 'horizontal' | 'vertical';
  /**
   * Choose one of the two halves that should initially be hidden.
   */
  initiallyHidden?: ResizableElement;
  /**
   * Invoked when the visibility of one of the halves changes.
   * @param hiddenElement The element that is now hidden after the change
   * (`null` if both are visible).
   */
  onHiddenElementChange?(hiddenElement: ResizableElement | null): void;
  /**
   * The minimum width in pixels for the first half. If it is resized to a
   * width smaller than this threshold, the half will be hidden.
   */
  sizeThresholdFirst?: number;
  /**
   * The minimum width in pixels for the second half. If it is resized to a
   * width smaller than this threshold, the half will be hidden.
   */
  sizeThresholdSecond?: number;
  /**
   * A key for which the state of resizing is persisted in storage (if storage
   * is available).
   */
  storageKey?: string;
};
