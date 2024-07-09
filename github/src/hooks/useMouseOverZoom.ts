import { RefObject, useEffect, useMemo } from "react";

import { useMouse } from "./useMouse";

export function useMouseOverZoom(
  highResImage: RefObject<HTMLImageElement | null>,
  source: RefObject<HTMLImageElement | null>,
  target: RefObject<HTMLCanvasElement | null>,
  cursor: RefObject<HTMLElement | null>,
  enablePreview = false,
  radius = 50,
  zoomFactor = 3,
) {
  // Capture Mouse position
  const { x, y, isActive, rect } = useMouse(source, enablePreview);

  const scale = useMemo(() => window.devicePixelRatio, []);

  // Compute the part of the image to zoom based on mouse position
  const zoomBounds = useMemo(() => {
    // mouse coordinates
    const left = x - radius;
    const top = y - radius;
    const width = radius * zoomFactor;
    const height = radius * zoomFactor;
    const right = rect.right - rect.x - width;
    const bottom = rect.bottom - rect.y - height;

    // This will prevent the cursor from going outside the source reference element bounds
    return {
      left:
        left + rect.left + width <= rect.right ? (left >= 0 ? left : 0) : right,
      top:
        top + rect.top + height <= rect.bottom ? (top >= 0 ? top : 0) : bottom,
      width,
      height,
    };
  }, [x, radius, y, zoomFactor, rect]);
  // move the cursor to the mouse position
  useEffect(() => {
    if (!enablePreview) {
      return;
    }
    if (cursor.current) {
      const { left, top, width, height } = zoomBounds;
      cursor.current.style.left = `${left}px`;
      cursor.current.style.top = `${top}px`;
      cursor.current.style.width = `${width}px`;
      cursor.current.style.height = `${height}px`;
      cursor.current.style.display = isActive ? "block" : "none";
    }
  }, [zoomBounds, isActive, enablePreview, cursor]);
  // draw the zoomed image on the canvas
  useEffect(() => {
    if (!enablePreview) {
      return;
    }
    if (source.current && target.current && highResImage.current?.complete) {
      const ctx = target.current.getContext("2d");
      if (ctx) {
        if (isActive) {
          const { left, top, width, height } = zoomBounds;
          const imageRatio =
            highResImage.current.naturalWidth / source.current.width;
          // Clear the canvas before drawing the new zoomed portion
          ctx.clearRect(0, 0, target.current.width, target.current.height);
          // dynamic canvas width once we get below resizing threshold
          const targetWidth =
            window.outerWidth > 1152 ? 600 : window.outerWidth * 0.52;
          console.log("target outer width", targetWidth);
          target.current.width = targetWidth * scale;
          target.current.height = 660 * scale;
          target.current.style.width = `${targetWidth}px`;
          target.current.style.height = "660px";
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(
            highResImage.current,
            left * imageRatio,
            top * imageRatio,
            width * imageRatio,
            height * imageRatio,
            0,
            0,
            target.current.width * scale,
            target.current.height * scale,
          );
        } else {
          // clear canvas
          ctx.clearRect(0, 0, target.current.width, target.current.height);
        }
      }
    }
  }, [
    zoomBounds,
    isActive,
    scale,
    enablePreview,
    source,
    target,
    highResImage,
  ]);
}
