import { RefObject, useState, useEffect } from "react";

const emptyRect = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};
export function useMouse(
  ref: RefObject<HTMLElement | null>,
  enablePreview: boolean,
) {
  const [mouse, setMouse] = useState<{
    x: number;
    y: number;
    isActive: boolean;
    rect: typeof emptyRect;
  }>({ x: 0, y: 0, isActive: false, rect: emptyRect });
  useEffect(() => {
    if (!enablePreview) {
      return;
    }
    const refElement = ref.current;
    if (refElement) {
      const handleMouseMove = (e: MouseEvent) => {
        // get mouse position relative to ref
        const rect = refElement.getBoundingClientRect();
        if (rect) {
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          setMouse({
            x: x >= 0 ? x : 0,
            y: y >= 0 ? y : 0,
            isActive: true,
            rect,
          });
        }
      };
      const handleMouseOut = (e: MouseEvent) => {
        setMouse({
          x: 0,
          y: 0,
          isActive: false,
          rect: emptyRect,
        });
      };
      refElement.addEventListener("mousemove", handleMouseMove);
      refElement.addEventListener("mouseout", handleMouseOut);
      return () => {
        refElement.removeEventListener("mousemove", handleMouseMove);
        refElement.removeEventListener("mouseout", handleMouseOut);
      };
    }
  }, [enablePreview, ref]);
  return mouse;
}
