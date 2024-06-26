import warning from 'warning';
import {
  constant,
  checkIndexBounds

} from 'react-swipeable-views-core';
import {
  createContext,
  isValidElement,
  MutableRefObject,
  ReactElement,
  useEffect,
  useRef,
  useState,
  useTransition
} from "react";
import {Axis, axisProperties, defaultSwiperStyles, Position} from "./swiper-props";
import computeIndex from "./computeIndex";
import {Children} from 'react';
import {SwipeableViewsProps} from "react-swipeable-views";

type EventListenerProps = {
  event: any,
  handler: any,
  options?: any | undefined,
}

type AddEventListenerProps = EventListenerProps & {
  node: HTMLDivElement
}


function addEventListener({node, event, handler, options}: AddEventListenerProps) {
  node.addEventListener(event, handler, options);
  return {
    remove() {
      node.removeEventListener(event, handler, options);
    },
  };
}

function adaptMouse(event: any) { //MouseEvent
  event.touches = [{ pageX: event.pageX, pageY: event.pageY}];
  return event; //TouchEvent
}

function createTransition(property:any, options:any):string {
  const { duration, easeFunction, delay } = options;

  return `${property} ${duration} ${easeFunction} ${delay}`;
}

function applyRotationMatrix(touch: any, axis: Axis) {
  const rotationMatrix: Position = axisProperties.rotationMatrix[axis] as Position;

  return {
    pageX: rotationMatrix.x[0] * touch.pageX + rotationMatrix.x[1] * touch.pageY,
    pageY: rotationMatrix.y[0] * touch.pageX + rotationMatrix.y[1] * touch.pageY,
  };
}
type IndexedChildren = {
  index: number | undefined;
  children: ReactElement[]
};
type DisplaySameSlideProps = {
  previousProps: IndexedChildren,
  props: IndexedChildren
}
const getDisplaySameSlide = ({previousProps, props}:DisplaySameSlideProps) => {
  let displaySameSlide = false;

  const getChildrenKey = (child:ReactElement) => (child ? child.key : 'empty');

  if (previousProps.children.length && props.children.length) {
    const oldKeys = Children.map(props.children, getChildrenKey);
    const oldKey = oldKeys[previousProps.index as number];

    if (oldKey !== null && oldKey !== undefined) {
      const newKeys = Children.map(props.children, getChildrenKey);
      const newKey = newKeys[props.index as number];

      if (oldKey === newKey) {
        displaySameSlide = true;
      }
    }
  }

  return displaySameSlide;
};

export const SwipeableViewsContext = createContext({slideUpdateHeight: () => {}});

if (process.env.NODE_ENV !== 'production') {
  SwipeableViewsContext.displayName = 'SwipeableViewsContext';
}

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
}

export function findNativeHandler(params: NativeHandlerParams) {
  const { domTreeShapes, pageX, startX, axis, nodeReference } = params;

  return domTreeShapes.some(shape => {
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

/**
 * This is the main component
 * Probably not the cleanest implementation,
 * but I didn't write the original code,
 * which was written for older versions of React.
 * @param props
 * @constructor
 */
const SwipeableViews = (props: SwipeableViewsProps) => {

  const initialIndex = props.index || 0;
  const {
    action,
    animateHeight = false,
    animateTransitions = true,
    axis = "x",
    children,
    containerStyle,
    disabled = false,
    disableLazyLoading = false,
    enableMouseEvents = false,
    hysteresis = 0.6,
    ignoreNativeScroll = false,
    onChangeIndex,
    onSwitching,
    onTransitionEnd,
    resistance = false,
    slideClassName,
    slideStyle,
    springConfig = {
      duration: '0.35s',
      easeFunction: 'cubic-bezier(0.15, 0.3, 0.25, 1)',
      delay: '0s'
    },
    style,
    threshold = 5,
    ...other
  } = {...props};

  if (process.env.NODE_ENV !== 'production') {
    checkIndexBounds(props);
  }

  // old state props, init directly from props or from static value
  const [indexLatest, setIndexLatest] = useState(initialIndex);
  const [isDragging, setIsDragging] = useState(false);
  const [renderOnlyActive, setRenderOnlyActive] = useState(!props.disableLazyLoading);
  const [heightLatest, setHeightLatest] = useState(0);
  const [displaySameSlide, setDisplaySameSlide] = useState(true);
  // const [isFirstRender, setIsFirstRender] = useState(true); // exists in the public @types module


  /**
   * Previously, the old component class stored some param props
   * as class props and some as state props. The class props were
   * constantly referenced to and modified during render.
   * The state props were actually updated with the intent of being
   * read on the next render.
   * Old class props are updated as references and old state props
   * have their own states.
   */
  const rootNode = useRef({} as HTMLDivElement);
  const containerNode = useRef({} as HTMLDivElement);
  const activeSlide = useRef({} as HTMLDivElement);
  const index = useRef(initialIndex) // indexCurrent
  // old param props
  const viewLength = useRef(0);
  //const [viewLength, setViewLength] = useState(0);
  const startIndex = useRef(0);
  const startX = useRef(0);
  const startY = useRef(0);
  const lastX = useRef(0);
  //const [startIndex, setStartIndex] = useState(0);
  //const [startX, setStartX] = useState(0);
  //const [startY, setStartY] = useState(0);
  //const [lastX, setLastX] = useState(0);
  const vx = useRef(0);
  const isSwiping = useRef(false);
  const ignoreNextScrollEvents = useRef(false)
  //const [vx, setVx] = useState(0);
  //const [isSwiping, setIsSwiping] = useState(false);
  //const [ignoreNextScrollEvents, setIgnoreNextScrollEvents] = useState(false);

  const [started, startTransition] = useTransition();
  //const [started, setStarted] = useState(false);
  const firstRenderTimeout = useRef<ReturnType<typeof setTimeout>>();
  const previousProps = useRef(props);

  // Previously existed outside of Component
  // We can only have one node at the time claiming ownership for handling the swipe.
  // Otherwise, the UX would be confusing.
  // That's why we use a singleton here.
  const nodeWhoClaimedTheScroll = useRef({} as HTMLDivElement);


  const updateHeight = () => {
    if (activeSlide.current.tagName && activeSlide.current?.children.length) {
      const child = activeSlide.current.children[0] as any;
      if (
        child !== undefined &&
        child.offsetHeight !== undefined &&
        heightLatest !== child.offsetHeight
      ) {
        setHeightLatest(child.offsetHeight);
      }
    }
  };


  // componentDidMount
  useEffect(()=>{
    const transitionListener = addEventListener({
      node: containerNode.current,
      event: 'transitionend',
      handler: (event: any) => {
        if (event.target !== containerNode.current) {
          return;
        }
        handleTransitionEnd();
      }
    })
    const touchMoveListener = addEventListener({
      node: rootNode.current,
      event: 'touchmove',
      handler: (event:any) => {
        // Handling touch events is disabled.
        if (disabled) {
          return;
        }
        handleSwipeMove(event);
      },
      options: {
        passive: false,
      },
    });
    if (!disableLazyLoading) {
      clearTimeout(firstRenderTimeout.current);
      firstRenderTimeout.current = setTimeout(() => {
        setRenderOnlyActive(false);
      }, 0);
    }

    // Send all functions in an object if action param is set.
    if (action && typeof action === 'function') {
      action({
        updateHeight: updateHeight,
      });
    }


    // componentWillUnmount()
    return() => {
      transitionListener.remove();
      touchMoveListener.remove();
      clearTimeout(firstRenderTimeout.current);
    }

  },[]) // run only once


  useEffect(()=>{
    const newIndex = props.index as number;
    if (newIndex !== previousProps.current.index) {
      if (process.env.NODE_ENV !== 'production') {
        checkIndexBounds(props);
      }

      index.current = newIndex;
      setIndexLatest(newIndex);
      setDisplaySameSlide(getDisplaySameSlide({previousProps: previousProps.current, props} as DisplaySameSlideProps))
      // If true, we are going to change the children. We shoudn't animate it.
    }
    previousProps.current = props;
  },[props]);

  function getSwipeableViewsContext() {
    return {
      slideUpdateHeight: () => {
        updateHeight();
      },
    };
  }

  const indexUpdate = (i: number) => {
    if (!props.animateTransitions && i !== index.current) {
      handleTransitionEnd();
    }

    index.current = i;

    if (containerNode.current.tagName) {

      const transform: string = axisProperties.transform[axis as Axis](i * 100);
      containerNode.current.style.webkitTransform = transform;
      containerNode.current.style.transform = transform;
    }
  }


  const updateActiveSlide = (node: HTMLDivElement) => {
    activeSlide.current = node;
    updateHeight();
  };




  const handleSwipeStart = (event: any) => {
    const touch = applyRotationMatrix(event.touches[0], axis);
    startTransition(()=>{
      const rect:DOMRect = rootNode.current?.getBoundingClientRect();
      viewLength.current = rect[axisProperties.length[axis] as keyof DOMRect] as number;
      startX.current = touch.pageX;
      lastX.current = touch.pageX;
      startY.current = touch.pageY;
      vx.current = 0
      isSwiping.current = false; // should this be undefined???
      // old
      // this.isSwiping = undefined;

      const computedStyle = window.getComputedStyle(containerNode.current);
      const transform =
        computedStyle.getPropertyValue('-webkit-transform') ||
        computedStyle.getPropertyValue('transform');

      if (transform && transform !== 'none') {
        const transformValues = transform
          .split('(')[1]
          .split(')')[0]
          .split(',');
        const rootStyle = window.getComputedStyle(rootNode.current);

        const tranformNormalized = applyRotationMatrix(
          {
            pageX: parseInt(transformValues[4], 10),
            pageY: parseInt(transformValues[5], 10),
          },
          axis,
        );

        startIndex.current = (((-tranformNormalized.pageX) /
          (viewLength.current -
            parseInt(rootStyle.paddingLeft, 10) -
            parseInt(rootStyle.paddingRight, 10))) || 0);
      }
    });
  }

  const handleSwipeMove = (event: any) => {
    // The touch start event can be cancel.
    // Makes sure we set a starting point.
    if (!started) {
      handleTouchStart(event);
      return;
    }

    // We are not supposed to handle this touch move.
    if (nodeWhoClaimedTheScroll.current.tagName && nodeWhoClaimedTheScroll.current !== rootNode.current) {
      return;
    }

    const touch = applyRotationMatrix(event.touches[0], axis);

    // We don't know yet.
    if (!isSwiping.current) {
      const dx = Math.abs(touch.pageX - startX.current);
      const dy = Math.abs(touch.pageY - startY.current);

      const swiping = dx > dy && dx > constant.UNCERTAINTY_THRESHOLD;

      // We let the parent handle the scroll.
      if (
        !resistance &&
        (axis === 'y' || axis === 'y-reverse') &&
        ((index.current === 0 && startX.current < touch.pageX) ||
          (index.current === Children.count(children) - 1 &&
            startX.current > touch.pageX))
      ) {
        isSwiping.current = false;
        return;
      }

      // We are likely to be swiping, let's prevent the scroll event.
      if (dx > dy) {
        event.preventDefault();
      }

      if (swiping || dy > constant.UNCERTAINTY_THRESHOLD) {
        isSwiping.current = true// ensure swiping is true
        startX.current = touch.pageX; // Shift the starting point.

        return; // Let's wait the next touch event to move something.
      }
    }

    if (!isSwiping.current) {
      return;
    }

    // We are swiping, let's prevent the scroll event.
    event.preventDefault();

    // Low Pass filter.
    vx.current = (vx.current * 0.5 + (touch.pageX - lastX.current) * 0.5);
    lastX.current = touch.pageX;

    const { computedIndex, computedX } = computeIndex({
      children,
      resistance,
      pageX: touch.pageX,
      startIndex: startIndex.current,
      startX: startX.current,
      viewLength: viewLength.current,
    });
    // Add support for native scroll elements.
    if (!nodeWhoClaimedTheScroll.current.tagName && !ignoreNativeScroll) {
      const domTreeShapes = getDomTreeShapes(event.target, rootNode.current);
      const hasFoundNativeHandler = findNativeHandler({
        domTreeShapes,
        startX: computedX,
        pageX: touch.pageX,
        axis,
        nodeReference: nodeWhoClaimedTheScroll //pass the reference, not the node
      });

      // We abort the touch move handler.
      if (hasFoundNativeHandler) {
        return;
      }
    }

    // We are moving toward the edges.
    if (computedX) {
      startX.current = computedX;
    } else if (!nodeWhoClaimedTheScroll.current.tagName) {
      nodeWhoClaimedTheScroll.current = rootNode.current;
    }

    indexUpdate(computedIndex);

    const callback = () => {
      if (onSwitching && typeof onSwitching === 'function') {
        onSwitching(computedIndex, 'move');
      }
    };

    if (displaySameSlide || !isDragging) {
      setDisplaySameSlide(false);
      setIsDragging(true);
    }

    callback();
  };

  // the old code didn't have a param here, but only called
  // this function with a param... so it's unused as of now...
  const handleSwipeEnd = (_event: any) => {
    nodeWhoClaimedTheScroll.current = {} as HTMLDivElement;

    // The touch start event can be cancel.
    // Makes sure that a starting point is set.
    if (!started) {
      return;
    }

    // setStarted(false); // no need mark somethign as started, it will not be marked as started by the end of the render

    if (!isSwiping) {
      return;
    }

    const delta = indexLatest - index.current;

    let indexNew;

    // Quick movement
    if (Math.abs(vx.current) > threshold) {
      if (vx.current > 0) {
        indexNew = Math.floor(index.current);
      } else {
        indexNew = Math.ceil(index.current);
      }
    } else if (Math.abs(delta) > hysteresis) {
      // Some hysteresis with indexLatest.
      indexNew = delta > 0 ? Math.floor(index.current) : Math.ceil(index.current);
    } else {
      indexNew = indexLatest;
    }

    const indexMax = Children.count(children) - 1;

    if (typeof indexNew === 'undefined' || indexNew < 0) {
      indexNew = 0;
    } else if (indexNew > indexMax) {
      indexNew = indexMax;
    }

    indexUpdate(indexNew);
    setIndexLatest(indexNew);
    setIsDragging(false);
    if (onSwitching && typeof onSwitching === 'function') {
      onSwitching(indexNew, 'end')
    }
    if (onChangeIndex && typeof onChangeIndex === 'function' && indexNew !== indexLatest) {
      onChangeIndex(indexNew, indexLatest);
    }

    // Manually calling handleTransitionEnd in that case as isn't otherwise.
    if (index.current === indexLatest) {
      handleTransitionEnd();
    }
  };

  const handleTouchStart = (event: any) => {
    if (props.onTouchStart && typeof props.onTouchStart === 'function') {
      props.onTouchStart(event);
    }
    handleSwipeStart(event);
  };

  const handleTouchEnd = (event: any) => {
    if (props.onTouchEnd && typeof props.onTouchEnd === 'function') {
      props.onTouchEnd(event);
    }
    handleSwipeEnd(event);
  };

  const handleMouseDown = (event: any) => {
    if (props.onMouseDown) {
      props.onMouseDown(event);
    }
    event.persist();
    handleSwipeStart(adaptMouse(event));
  };

  const handleMouseUp = (event: any) => {
    if (props.onMouseUp) {
      props.onMouseUp(event);
    }
    handleSwipeEnd(adaptMouse(event));
  };

  const handleMouseLeave = (event: any) => {
    if (props.onMouseLeave) {
      props.onMouseLeave(event);
    }

    // Filter out events
    if (started) {
      handleSwipeEnd(adaptMouse(event));
    }
  };

  const handleMouseMove = (event: any) => {
    if (props.onMouseMove) {
      props.onMouseMove(event);
    }

    // Filter out events
    if (started) {
      handleSwipeMove(adaptMouse(event));
    }
  };

  const handleScroll = (event: any) => {
    if (props.onScroll) {
      props.onScroll(event);
    }

    // Ignore events bubbling up.
    if (event.target !== rootNode.current) {
      return;
    }

    if (ignoreNextScrollEvents.current) {
      ignoreNextScrollEvents.current = false;
      return;
    }

    const indexNew = Math.ceil(event.target.scrollLeft / event.target.clientWidth) + indexLatest;

    ignoreNextScrollEvents.current = true;
    // Reset the scroll position.
    event.target.scrollLeft = 0;

    if (onChangeIndex && typeof onChangeIndex === 'function' && indexNew !== indexLatest) {
      onChangeIndex(indexNew, indexLatest);
    }
  };


  const handleTransitionEnd = () => {
    if (!onTransitionEnd) {
      return;
    }

    // Filters out when changing the children
    if (displaySameSlide) {
      return;
    }

    // The rest callback is triggered when swiping. It's just noise.
    // We filter it out.
    if (!isDragging) {
      onTransitionEnd();
    }
  }




    const touchEvents = !disabled ? {
        onTouchStart: handleTouchStart,
        onTouchEnd: handleTouchEnd,
      } : {};
    const mouseEvents = !disabled && enableMouseEvents ? {
          onMouseDown: handleMouseDown,
          onMouseUp: handleMouseUp,
          onMouseLeave: handleMouseLeave,
          onMouseMove: handleMouseMove,
        } : {};

    // There is no point to animate if we are already providing a height.
    warning(
      !animateHeight || !containerStyle || !containerStyle.height,
      `react-swipeable-view: You are setting animateHeight to true but you are
also providing a custom height.
The custom height has a higher priority than the animateHeight property.
So animateHeight is most likely having no effect at all.`,
    );

    const slideStyleProp = Object.assign({}, defaultSwiperStyles.slide, slideStyle);

    let transition;
    let WebkitTransition;

    if (isDragging || !animateTransitions || displaySameSlide) {
      transition = 'all 0s ease 0s';
      WebkitTransition = 'all 0s ease 0s';
    } else {
      transition = createTransition('transform', springConfig);
      WebkitTransition = createTransition('-webkit-transform', springConfig);

      if (heightLatest !== 0) {
        const additionalTranstion = `, ${createTransition('height', springConfig)}`;
        transition += additionalTranstion;
        WebkitTransition += additionalTranstion;
      }
    }

    const containerStyleProp: any = {
      height: undefined,
      WebkitFlexDirection: axisProperties.flexDirection[axis],
      flexDirection: axisProperties.flexDirection[axis],
      WebkitTransition,
      transition,
    };

    // Apply the styles for SSR considerations
    if (!renderOnlyActive) {
      const transform = axisProperties.transform[axis](index.current * 100);
      containerStyleProp.WebkitTransform = transform;
      containerStyleProp.transform = transform;
    }

    if (animateHeight) {
      containerStyleProp.height = heightLatest;
    }


    return (
      <SwipeableViewsContext.Provider value={getSwipeableViewsContext()}>
        <div
          ref={(node:HTMLDivElement)=>{
            rootNode.current = node;
          }}
          style={Object.assign({}, axisProperties.root[axis], style)}
          {...other}
          {...touchEvents}
          {...mouseEvents}
          onScroll={handleScroll}
        >
          <div
            ref={(node:HTMLDivElement)=>{
              containerNode.current = node
            }}
            style={Object.assign({}, containerStyleProp, defaultSwiperStyles.container, containerStyle)}
            className="react-swipeable-view-container"
          >
            {Children.map(children, (child, indexChild) => {
              if (renderOnlyActive && indexChild !== indexLatest) {
                return null;
              }

              warning(
                isValidElement(child),
                `react-swipeable-view: one of the children provided is invalid: ${child}.
  We are expecting a valid React Element`,
              );

              let ref;
              let hidden = true;

              if (indexChild === indexLatest) {
                hidden = false;

                if (animateHeight && typeof slideStyleProp !== 'undefined') {
                  ref = updateActiveSlide;
                  slideStyleProp.overflowY = 'hidden';
                }
              }

              return (
                <div
                  ref={ref}
                  style={slideStyleProp}
                  className={slideClassName}
                  aria-hidden={hidden}
                  data-swipeable="true"
                >
                  {child}
                </div>
              );
            })}
          </div>
        </div>
      </SwipeableViewsContext.Provider>
    );

}

// Added as an ads for people using the React dev tools in production.
// So they know, the tool used to build the awesome UI they
// are looking at/retro engineering.
SwipeableViews.displayName = 'ReactSwipableView';

export default SwipeableViews;