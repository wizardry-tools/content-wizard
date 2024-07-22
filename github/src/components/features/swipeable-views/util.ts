import { Children, MutableRefObject, PropsWithChildren, ReactElement } from 'react';
import { Axis, axisProperties, Position } from './swiper-props';

export const defaultComputeValues = {
  RESISTANCE_COEF: 0.6,

  // This value is closed to what browsers are using internally to
  // trigger a native scroll.
  UNCERTAINTY_THRESHOLD: 3, // px
};

export function computeIndex(params: any) {
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
}

export type EventListenerProps = {
  event: any;
  handler: any;
  options?: any | undefined;
};

export type AddEventListenerProps = EventListenerProps & {
  node: HTMLDivElement;
};

export function addEventListener({ node, event, handler, options }: AddEventListenerProps) {
  node.addEventListener(event, handler, options);
  return {
    remove() {
      node.removeEventListener(event, handler, options);
    },
  };
}

export function adaptMouse(event: any) {
  //MouseEvent
  event.touches = [{ pageX: event.pageX, pageY: event.pageY }];
  return event; //TouchEvent
}

export function createTransition(property: any, options: any): string {
  const { duration, easeFunction, delay } = options;

  return `${property} ${duration} ${easeFunction} ${delay}`;
}

export function applyRotationMatrix(touch: any, axis: Axis) {
  const rotationMatrix: Position = axisProperties.rotationMatrix[axis] as Position;

  return {
    pageX: rotationMatrix.x[0] * touch.pageX + rotationMatrix.x[1] * touch.pageY,
    pageY: rotationMatrix.y[0] * touch.pageX + rotationMatrix.y[1] * touch.pageY,
  };
}

export type IndexedChildren = {
  index: number | undefined;
  children: ReactElement[];
};
export type DisplaySameSlideProps = {
  previousProps: IndexedChildren;
  props: IndexedChildren;
};
export const getDisplaySameSlide = ({ previousProps, props }: DisplaySameSlideProps) => {
  let displaySameSlide = false;

  const getChildrenKey = (child: ReactElement) => (child ? child.key : 'empty');

  if (previousProps.children.length && props.children.length) {
    const oldKeys = Children.map(props.children, getChildrenKey);
    const oldKey = oldKeys[previousProps.index as number];

    if (oldKey) {
      const newKeys = Children.map(props.children, getChildrenKey);
      const newKey = newKeys[props.index as number];

      if (oldKey === newKey) {
        displaySameSlide = true;
      }
    }
  }

  return displaySameSlide;
};

export function getDomTreeShapes(element: HTMLDivElement, rootNode: HTMLDivElement) {
  let domTreeShapes = [];

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
}

export type NativeHandlerParams = {
  domTreeShapes: any[];
  pageX: number;
  startX: number;
  axis: Axis;
  nodeReference: MutableRefObject<HTMLDivElement>;
};

export function findNativeHandler(params: NativeHandlerParams) {
  const { domTreeShapes, pageX, startX, axis, nodeReference } = params;

  return domTreeShapes.some((shape) => {
    // Determine if we are going backward or forward.
    let goingForward = pageX >= startX;
    if (axis === 'x' || axis === 'y') {
      goingForward = !goingForward;
    }

    // scrollTop is not always be an integer.
    // https://github.com/jquery/api.jquery.com/issues/608
    const scrollPosition = Math.round(shape[axisProperties.scrollPosition[axis] as string]);

    const areNotAtStart = scrollPosition > 0;
    const areNotAtEnd =
      scrollPosition + shape[axisProperties.clientLength[axis] as string] <
      shape[axisProperties.scrollLength[axis] as string];

    if ((goingForward && areNotAtEnd) || (!goingForward && areNotAtStart)) {
      nodeReference.current = shape.element;
      return true;
    }

    return false;
  });
}

type IndexBoundsCheck = PropsWithChildren & {
  index: number;
};
export const checkIndexBounds = (props: IndexBoundsCheck) => {
  const { index, children } = props;

  const childrenCount = Children.count(children);

  if (!(index >= 0 && index <= childrenCount)) {
    console.warn(`react-swipeable-view: the new index: ${index} is out of bounds: [0-${childrenCount}].`);
  }
};
