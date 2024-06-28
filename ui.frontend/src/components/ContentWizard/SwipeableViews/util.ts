import { Children } from 'react';
import type { PropsWithChildren, ReactElement, MouseEvent } from 'react';
import { axisProperties } from './swiper-props';
import type {
  Axis,
  DisplaySameSlideProps,
  IndexBoundsCheck,
  NativeHandlerParams,
  Position,
  SpringConfig,
  SwipeableTouch,
  DomTreeShape,
} from '@/types';

export const defaultComputeValues = {
  RESISTANCE_COEF: 0.6,

  // This value is closed to what browsers are using internally to
  // trigger a native scroll.
  UNCERTAINTY_THRESHOLD: 3, // px
};

export type ComputeIndexProps = PropsWithChildren & {
  startIndex: number;
  startX: number;
  pageX: number;
  viewLength: number;
  resistance?: boolean;
};
export const computeIndex = (params: ComputeIndexProps) => {
  const { children, startIndex, startX, pageX, viewLength, resistance } = params;

  const indexMax = Children.count(children) - 1;
  let computedIndex = startIndex + (startX - pageX) / viewLength;
  let newStartX;

  if (!resistance) {
    // Reset the starting point
    if (computedIndex < 0) {
      computedIndex = 0;
      newStartX = (computedIndex - startIndex) * viewLength + pageX;
    } else if (computedIndex > indexMax) {
      computedIndex = indexMax;
      newStartX = (computedIndex - startIndex) * viewLength + pageX;
    }
  } else if (computedIndex < 0) {
    computedIndex = Math.exp(computedIndex * defaultComputeValues.RESISTANCE_COEF) - 1;
  } else if (computedIndex > indexMax) {
    computedIndex = indexMax + 1 - Math.exp((indexMax - computedIndex) * defaultComputeValues.RESISTANCE_COEF);
  }

  return {
    computedIndex,
    computedX: newStartX,
  };
};

export const adaptMouse = <T>(event: MouseEvent<T>) => {
  const { ...eventProps } = event;
  const touches = [{ pageX: event.pageX, pageY: event.pageY }];
  return {
    ...eventProps,
    touches,
  };
};

export const createTransition = (property: string, options: SpringConfig): string => {
  const { duration, easeFunction, delay } = options;

  return `${property} ${duration} ${easeFunction} ${delay}`;
};

export const applyRotationMatrix = (touch: SwipeableTouch, axis: Axis) => {
  const rotationMatrix: Position = axisProperties.rotationMatrix[axis];

  return {
    pageX: rotationMatrix.x[0] * touch.pageX + rotationMatrix.x[1] * touch.pageY,
    pageY: rotationMatrix.y[0] * touch.pageX + rotationMatrix.y[1] * touch.pageY,
  };
};

export const getDisplaySameSlide = ({ previousProps, props }: DisplaySameSlideProps) => {
  let displaySameSlide = false;

  const getChildrenKey = (child: ReactElement) => (child ? child.key : 'empty');

  if (previousProps.children.length && props.children.length) {
    const oldKeys = Children.map(props.children, getChildrenKey);
    const oldKey = oldKeys[previousProps.index!];

    if (oldKey) {
      const newKeys = Children.map(props.children, getChildrenKey);
      const newKey = newKeys[props.index!];

      if (oldKey === newKey) {
        displaySameSlide = true;
      }
    }
  }

  return displaySameSlide;
};

export const getDomTreeShapes = (element: HTMLDivElement | undefined, rootNode: HTMLDivElement): DomTreeShape[] => {
  let domTreeShapes: DomTreeShape[] = [];

  while (element && element !== rootNode && element !== document.body) {
    // We reach a Swipeable View, no need to look higher in the dom tree.
    if (element.hasAttribute('data-swipeable')) {
      break;
    }

    const style = window.getComputedStyle(element);

    if (
      // Ignore the scroll children if the element is absolute positioned.
      style.getPropertyValue('position') === 'absolute' ||
      // Ignore the scroll children if the element has an overflowX hidden
      style.getPropertyValue('overflow-x') === 'hidden'
    ) {
      domTreeShapes = [];
    } else if (
      (element.clientWidth > 0 && element.scrollWidth > element.clientWidth) ||
      (element.clientHeight > 0 && element.scrollHeight > element.clientHeight)
    ) {
      // Ignore the nodes that have no width.
      // Keep elements with a scroll
      domTreeShapes.push({
        element,
        scrollWidth: element.scrollWidth,
        scrollHeight: element.scrollHeight,
        clientWidth: element.clientWidth,
        clientHeight: element.clientHeight,
        scrollLeft: element.scrollLeft,
        scrollTop: element.scrollTop,
      });
    }

    element = element.parentNode as HTMLDivElement;
  }

  return domTreeShapes;
};

export const findNativeHandler = (params: NativeHandlerParams) => {
  const { domTreeShapes, pageX, startX, axis, nodeReference } = params;

  return domTreeShapes.some((shape: DomTreeShape) => {
    // Determine if we are going backward or forward.
    let goingForward = pageX >= startX;
    if (axis === 'x' || axis === 'y') {
      goingForward = !goingForward;
    }

    // scrollTop is not always be an integer.
    // https://github.com/jquery/api.jquery.com/issues/608
    const scrollPosition = Math.round(shape[axisProperties.scrollPosition[axis] as keyof DomTreeShape] as number);
    const clientLength = shape[axisProperties.clientLength[axis] as keyof DomTreeShape] as number;
    const scrollLength = shape[axisProperties.scrollLength[axis] as keyof DomTreeShape] as number;

    const areNotAtStart = scrollPosition > 0;
    const areNotAtEnd = scrollPosition + clientLength < scrollLength;

    if ((goingForward && areNotAtEnd) || (!goingForward && areNotAtStart)) {
      nodeReference.current = shape.element;
      return true;
    }

    return false;
  });
};

export const checkIndexBounds = (props: IndexBoundsCheck): void => {
  const { index, children } = props;

  const childrenCount = Children.count(children);

  if (!(index >= 0 && index <= childrenCount)) {
    console.warn(`react-swipeable-view: the new index: ${index} is out of bounds: [0-${childrenCount}].`);
  }
};
