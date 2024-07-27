import Button from '@mui/material/Button';
import { useScrollToId } from '@/utils';
import { ScrollButtonProps } from '@/types';

export const ScrollButton = (props: ScrollButtonProps) => {
  const { scrollId, children, hook, hookProps, ...other } = props;
  const scrollToSection = useScrollToId({ hook, hookProps });

  return (
    <Button {...other} onClick={() => scrollToSection.scroll(scrollId)}>
      {children}
    </Button>
  );
};
