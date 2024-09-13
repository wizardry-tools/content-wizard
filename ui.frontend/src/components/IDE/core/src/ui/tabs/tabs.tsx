import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { Reorder } from 'framer-motion';
import type { TabsProps } from '@/types';
import './tabs.scss';

export const Tabs = forwardRef<HTMLUListElement, TabsProps>(
  ({ values, onReorder, children, className, ...props }, ref) => (
    <Reorder.Group
      {...props}
      ref={ref}
      values={values}
      onReorder={onReorder}
      axis="x"
      role="tablist"
      className={clsx('wizard-tabs', className)}
    >
      {children}
    </Reorder.Group>
  ),
);
Tabs.displayName = 'Tabs';
