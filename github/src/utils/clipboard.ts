import { visit } from "unist-util-visit";
import { useCallback, useRef } from "react";
import copyToClipboard from "copy-to-clipboard";

/**
 * ClipBoard use hook
 *
 * Takes the supplied Node and visits each Node in
 * the Node Tree, applying the captureContent callback.
 *
 * The end result, is that the raw text content is
 * captured from the supplied Node and all of it's descendants.
 */
export const useClipBoard = () => {
  const content = useRef("");

  const captureContent = useCallback((node: any, index: any) => {
    if (
      node.value &&
      typeof node.value !== "undefined" &&
      typeof index === "number"
    ) {
      content.current += node.value;
    }
  }, []);

  const copy = useCallback(
    (node: any) => {
      visit(node, captureContent);
      copyToClipboard(content.current);
      content.current = "";
    },
    [captureContent],
  );

  return { copy };
};
