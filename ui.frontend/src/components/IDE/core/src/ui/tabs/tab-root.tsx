import { forwardRef } from 'react';
import { Reorder } from 'framer-motion';
import { clsx } from 'clsx';
import type { TabProps } from '@/types';

export const TabRoot = forwardRef<HTMLLIElement, TabProps>(
  ({ isActive, value, children, className, ...props }, ref) => (
    <Reorder.Item
      {...props}
      ref={ref}
      value={value}
      aria-selected={isActive ? 'true' : undefined}
      role="tab"
      className={clsx('wizard-tab', isActive && 'wizard-tab-active', className)}
    >
      {children}
    </Reorder.Item>
  ),
);
TabRoot.displayName = 'Tab';
