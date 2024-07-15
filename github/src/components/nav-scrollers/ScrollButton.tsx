import { ScrollLinkProps } from "./ScrollLink";
import Button from "@mui/material/Button";
import { useScrollToId } from "../../utils/scroll";
import { ButtonProps } from "@mui/material/Button/Button";

export type ScrollButtonProps = ScrollLinkProps & ButtonProps;
export const ScrollButton = (props: ScrollButtonProps) => {
  const { scrollId, scrollOptions, children, ...other } = props;
  const scrollToSection = useScrollToId(scrollOptions);

  return (
    <Button {...other} onClick={() => scrollToSection.scroll(scrollId)}>
      {children}
    </Button>
  );
};
