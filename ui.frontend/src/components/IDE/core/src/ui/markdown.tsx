import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { markdown } from '../markdown';

import './markdown.scss';

type MarkdownContentProps = {
  children: string;
  onlyShowFirstChild?: boolean;
  type: 'description' | 'deprecation';
};

export const MarkdownContent = forwardRef<
  HTMLDivElement,
  MarkdownContentProps & Omit<JSX.IntrinsicElements['div'], 'children'>
>(({ children, onlyShowFirstChild, type, ...props }, ref) => (
  <div
    {...props}
    ref={ref}
    className={clsx(`wizard-markdown-${type}`, onlyShowFirstChild && 'wizard-markdown-preview', props.className)}
    dangerouslySetInnerHTML={{ __html: markdown.render(children) }}
  />
));
MarkdownContent.displayName = 'MarkdownContent';
