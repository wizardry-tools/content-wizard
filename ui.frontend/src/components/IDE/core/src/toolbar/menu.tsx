import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';
import type { ToolbarMenuProps } from '@/types';
import { DropdownMenu, Tooltip } from '../ui';
import { createComponentGroup } from '../utility/component-group';
import './menu.scss';

const ToolbarMenuRoot = ({
  button,
  children,
  label,
  ...props
}: ToolbarMenuProps & {
  children: ReactNode;
  className?: string;
} & DropdownMenuProps) => (
  <DropdownMenu {...props}>
    <Tooltip label={label}>
      <DropdownMenu.Button className={clsx('wizard-un-styled wizard-toolbar-menu', props.className)} aria-label={label}>
        {button}
      </DropdownMenu.Button>
    </Tooltip>
    <DropdownMenu.Content>{children}</DropdownMenu.Content>
  </DropdownMenu>
);

export const ToolbarMenu = createComponentGroup(ToolbarMenuRoot, {
  Item: DropdownMenu.Item,
});
