import type { ReactElement, ReactNode } from 'react';
import * as T from '@radix-ui/react-tooltip';
import { createComponentGroup } from '../utility/component-group';
import './tooltip.scss';

export function TooltipRoot({
  children,
  align = 'start',
  side = 'bottom',
  sideOffset = 5,
  label,
}: T.TooltipContentProps & { label: ReactNode }): ReactElement {
  return (
    <T.Root>
      <T.Trigger asChild>{children}</T.Trigger>
      <T.Portal>
        <T.Content className="wizard-tooltip" align={align} side={side} sideOffset={sideOffset}>
          {label}
        </T.Content>
      </T.Portal>
    </T.Root>
  );
}

export const Tooltip = createComponentGroup(TooltipRoot, {
  Provider: T.Provider,
});
