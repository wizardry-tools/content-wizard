import { createComponentGroup } from '@/utility';
import { TabButton } from './tab-button';
import { TabClose } from './tab-close';
import { TabRoot } from './tab-root';

export const Tab = createComponentGroup(TabRoot, {
  Button: TabButton,
  Close: TabClose,
});
