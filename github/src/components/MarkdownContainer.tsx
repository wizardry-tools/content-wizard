import { ElementType, memo, PropsWithChildren, useCallback, useState } from 'react';
import Markdown from 'react-markdown';
import rehypeReact from 'rehype-react';
import rehypeHighlight from 'rehype-highlight';
import { Container, useTheme, Link as MuiLink, Paper } from '@mui/material';
import { Node } from '@/types';
import { useClipBoard } from '@/utils';
import CopyFab from './CopyFab';
import 'src/styles/markdown.scss';

type MarkdownContainerProps = {
  children?: string | null | undefined;
};
type PaperPreProps = PropsWithChildren & {
  node: Node;
};

const Link = memo((props: MarkdownContainerProps) => {
  const { ...rest } = props;
  return <MuiLink target="_blank" {...rest} color="info.main" />;
});

const CodeContainer = ({ children, ...other }: PropsWithChildren) => {
  // I'm not sure why Paper does not accept mouse event listeners, so this is a workaround
  return (
    <div className="code-container" {...other}>
      {children}
    </div>
  );
};

const PaperPre = (props: PaperPreProps) => {
  const clipBoard = useClipBoard();
  const { node, children, ...rest } = props;
  const [hover, setHover] = useState(false);
  const [touched, setTouched] = useState(false);
  const copyCode = useCallback(() => {
    clipBoard.copy(node);
  }, [clipBoard, node]);
  const mouseEnter = useCallback(() => {
    setHover(true);
  }, []);
  const mouseLeave = useCallback(() => {
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
      component={CodeContainer as ElementType}
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
    <Container className={`markdown-container ${theme.palette.mode ?? 'dark'}`}>
      <Markdown
        rehypePlugins={[rehypeReact, rehypeHighlight]}
        components={{
          // @ts-expect-error markdown container types are weird
          a: Link,
          // @ts-expect-error markdown container types are weird
          pre: PaperPre,
        }}
      >
        {children}
      </Markdown>
    </Container>
  );
};
export default MarkdownContainer;
