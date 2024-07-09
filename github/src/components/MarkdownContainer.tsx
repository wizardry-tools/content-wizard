import Markdown from "react-markdown";
import rehypeReact from "rehype-react";
import rehypeHighlight from "rehype-highlight";
import { Container, useTheme, Link as MuiLink, Paper } from "@mui/material";

import "../styles/markdown.scss";
import { memo, useCallback, useState, MouseEvent } from "react";
import { useClipBoard } from "../utils/clipboard";
import CopyFab from "./CopyFab";

type MarkdownContainerProps = {
  children?: string | null | undefined;
};
type ComponentOverride = MarkdownContainerProps & any;

const Link = memo((props: ComponentOverride) => {
  const { _node, ...rest } = props;
  return <MuiLink {...rest} color="info.main" />;
});

const CodeContainer = ({ children, ...other }: any) => {
  // I'm not sure why Paper does not accept mouse event listeners, so this is a workaround
  return (
    <div className="code-container" {...other}>
      {children}
    </div>
  );
};

const PaperPre = (props: ComponentOverride) => {
  const clipBoard = useClipBoard();
  const { node, children, ...rest } = props;
  const [hover, setHover] = useState(false);
  const [touched, setTouched] = useState(false);
  const copyCode = useCallback(
    (_e: Event) => {
      clipBoard.copy(node);
    },
    [clipBoard, node],
  );
  const mouseEnter = useCallback((_e: MouseEvent) => {
    setHover(true);
  }, []);
  const mouseLeave = useCallback((_e: MouseEvent) => {
    setTimeout(() => {
      setHover(false);
    }, 100);
  }, []);

  // TODO: Test these listeners on mobile
  const onTouch = useCallback(() => {
    setTouched(true);
  }, []);
  const offTouch = useCallback(() => {
    setTimeout(() => {
      setTouched(false);
    }, 100);
  }, []);
  return (
    <Paper
      className="markdown-paper"
      component={CodeContainer as any}
      onMouseOver={mouseEnter}
      onMouseLeave={mouseLeave}
      onTouchStartCapture={onTouch}
      onTouchEnd={offTouch}
    >
      <div className="code-copy-wrapper">
        <CopyFab hover={hover || touched} onClick={copyCode} />
        <pre {...rest}>{children}</pre>
      </div>
    </Paper>
  );
};

const MarkdownContainer = ({ children }: MarkdownContainerProps) => {
  const theme = useTheme();
  return (
    <Container className={`markdown-container ${theme.palette.mode ?? "dark"}`}>
      <Markdown
        rehypePlugins={[rehypeReact, rehypeHighlight]}
        components={
          {
            a: Link,
            pre: PaperPre,
          } as any
        }
      >
        {children}
      </Markdown>
    </Container>
  );
};
export default MarkdownContainer;
