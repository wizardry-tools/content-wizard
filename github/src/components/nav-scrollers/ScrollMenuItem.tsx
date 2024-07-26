import { MenuItem } from '@mui/material';
import { useScrollToId } from '@/utils';
import { ScrollMenuItemProps } from '@/types';

export const ScrollMenuItem = (props: ScrollMenuItemProps) => {
  const { scrollId, children } = props;
  const scrollToSection = useScrollToId();

  return <MenuItem onClick={() => scrollToSection.scroll(scrollId)}>{children}</MenuItem>;
};
