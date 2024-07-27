import { Link } from '@mui/material';
import { useScrollToId } from '@/utils';
import { ScrollLinkProps } from '@/types';

export const ScrollLink = (props: ScrollLinkProps) => {
  const { scrollId, children } = props;
  const scrollToSection = useScrollToId();

  return <Link onClick={() => scrollToSection.scroll(scrollId)}>{children}</Link>;
};
