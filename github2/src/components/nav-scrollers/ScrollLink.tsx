import { useScrollToId } from '../../utils/scroll';
import { PropsWithChildren } from 'react';
import { Link } from '@mui/material';

export type ScrollLinkProps = PropsWithChildren & {
  scrollId: string;
  scrollOptions?: any;
};
export const ScrollLink = (props: ScrollLinkProps) => {
  const { scrollId, scrollOptions, children } = props;
  const scrollToSection = useScrollToId(scrollOptions);

  return <Link onClick={() => scrollToSection.scroll(scrollId)}>{children}</Link>;
};
