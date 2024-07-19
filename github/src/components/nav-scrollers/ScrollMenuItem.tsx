import { MenuItem } from '@mui/material';
import { useScrollToId } from '../../utils/scroll';
import { ScrollLinkProps } from './ScrollLink';
import { MenuItemProps } from '@mui/material/MenuItem/MenuItem';

export type ScrollMenuItemProps = ScrollLinkProps & MenuItemProps;
export const ScrollMenuItem = (props: ScrollMenuItemProps) => {
  const { scrollId, scrollOptions, children } = props;
  const scrollToSection = useScrollToId(scrollOptions);

  return <MenuItem onClick={() => scrollToSection.scroll(scrollId)}>{children}</MenuItem>;
};
