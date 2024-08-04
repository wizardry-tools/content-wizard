import { forwardRef } from 'react';
import type { ComponentProps, ReactElement } from 'react';
import { clsx } from 'clsx';
import { Trigger, Portal, Content as RadixContent, Item as RadixItem, Root } from '@radix-ui/react-dropdown-menu';
import type { DropdownMenuContentProps, DropdownMenuItemProps } from '@radix-ui/react-dropdown-menu';
import { createComponentGroup } from '@/utility';

import './dropdown.scss';

const Button = forwardRef<HTMLButtonElement, ComponentProps<'button'>>((props, ref) => (
  <Trigger asChild>
    <button {...props} ref={ref} className={clsx('wizard-un-styled', props.className)} />
  </Trigger>
));
Button.displayName = 'DropdownMenuButton';

const Content = ({
  children,
  align = 'start',
  sideOffset = 5,
  className,
  ...props
}: DropdownMenuContentProps): ReactElement => {
  return (
    <Portal>
      <RadixContent
        align={align}
        sideOffset={sideOffset}
        className={clsx('wizard-dropdown-content', className)}
        {...props}
      >
        {children}
      </RadixContent>
    </Portal>
  );
};

const Item = ({ className, children, ...props }: DropdownMenuItemProps) => (
  <RadixItem className={clsx('wizard-dropdown-item', className)} {...props}>
    {children}
  </RadixItem>
);

export const DropdownMenu = createComponentGroup(Root, {
  Button,
  Item,
  Content,
});
