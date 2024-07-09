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
    if (ref?.current) {
      const handleMouseMove = (e: MouseEvent) => {
        // get mouse position relative to ref
        const rect = ref?.current?.getBoundingClientRect();
        console.log("rect: ", rect);
        if (rect) {
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          console.log("{x,y}: ", { x, y });
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
      ref?.current.addEventListener("mousemove", handleMouseMove);
      ref?.current.addEventListener("mouseout", handleMouseOut);
      return () => {
        ref?.current?.removeEventListener("mousemove", handleMouseMove);
        ref?.current?.removeEventListener("mouseout", handleMouseOut);
      };
    }
  }, [ref?.current]);
  return mouse;
}
