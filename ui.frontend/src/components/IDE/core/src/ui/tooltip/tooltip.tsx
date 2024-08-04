import * as T from '@radix-ui/react-tooltip';
import { createComponentGroup } from '@/utility';
import { TooltipRoot } from './tooltip-root';
import './tooltip.scss';

export const Tooltip = createComponentGroup(TooltipRoot, {
  Provider: T.Provider,
});
