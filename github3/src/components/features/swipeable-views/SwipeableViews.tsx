import {
  isValidElement,
  Children,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
  CSSProperties,
  ReactNode,
  TouchEvent as ReactTouchEvent,
  MouseEvent as ReactMouseEvent,
  UIEvent as ReactUIEvent,
} from 'react';
import { axisProperties, defaultSwiperStyles } from './swiper-props';
import {
  adaptMouse,
  applyRotationMatrix,
  computeIndex,
  createTransition,
  defaultComputeValues,
  findNativeHandler,
  getDisplaySameSlide,
  getDomTreeShapes,
  checkIndexBounds,
} from './util';
import { Axis, DisplaySameSlideProps, SwipeableElement, SwipeableEvent, SwipeableViewsProps } from '@/types';

/**
 * This is the main component
 * Probably not the cleanest implementation,
 * but I didn't write the original code,
 * which was written for older versions of React.
 * @param props
 * @constructor
 */
export const SwipeableViews = (props: SwipeableViewsProps) => {
  const initialIndex = props.index ?? 0;
  const {
    action,
    animateHeight = false,
    animateTransitions = true,
    axis = 'x' as Axis,
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
    onTouchStart,
    onTouchEnd,
    onMouseUp,
    onMouseDown,
    onMouseMove,
    onMouseLeave,
    onScroll,
    resistance = false,
    slideClassName,
    slideStyle,
    springConfig = {
      duration: '0.35s',
      easeFunction: 'cubic-bezier(0.15, 0.3, 0.25, 1)',
      delay: '0s',
    },
    style,
    threshold = 5,
    ...other
  } = { ...props };

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
  const index = useRef(initialIndex); // indexCurrent
  // old param props
  const viewLength = useRef(0);
  const startIndex = useRef(0);
  const startX = useRef(0);
  const startY = useRef(0);
  const lastX = useRef(0);
  const vx = useRef(0);
  const isSwiping = useRef(false);
  const ignoreNextScrollEvents = useRef(false);
  const [started, startTransition] = useTransition();
  const firstRenderTimeout = useRef<number | null>(null);
  const previousProps = useRef(props);

  // Previously existed outside of Component
  // We can only have one node at the time claiming ownership for handling the swipe.
  // Otherwise, the UX would be confusing.
  // That's why we use a singleton here.
  const nodeWhoClaimedTheScroll = useRef({} as HTMLDivElement);

  if (process.env.NODE_ENV !== 'production') {
    checkIndexBounds({ index: index.current, children });
  }

  const updateHeight = useCallback(() => {
    if (activeSlide.current?.tagName && activeSlide.current?.children.length) {
      const child = activeSlide.current.children[0] as SwipeableElement;
      if (child !== undefined && child.offsetHeight !== undefined && heightLatest !== child.offsetHeight) {
        setHeightLatest(child.offsetHeight);
      }
    }
  }, [heightLatest]);

  const handleTransitionEnd = useCallback(() => {
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
  }, [onTransitionEnd, displaySameSlide, isDragging]);

  useEffect(() => {
    const newIndex = props.index!;
    if (newIndex !== previousProps.current.index) {
      if (process.env.NODE_ENV !== 'production') {
        checkIndexBounds({ index: index.current, children });
      }

      index.current = newIndex;
      setIndexLatest(newIndex);
      setDisplaySameSlide(
        getDisplaySameSlide({ previousProps: previousProps.current, props } as DisplaySameSlideProps),
      );
      // If true, we are going to change the children. We shoudn't animate it.
    }
    previousProps.current = props;
  }, [children, props]);

  const indexUpdate = useCallback(
    (i: number) => {
      if (!animateTransitions && i !== index.current) {
        handleTransitionEnd();
      }

      index.current = i;

      if (containerNode.current.tagName) {
        const transform: string = axisProperties.transform[axis](i * 100);
        containerNode.current.style.webkitTransform = transform;
        containerNode.current.style.transform = transform;
      }
    },
    [animateTransitions, handleTransitionEnd, axis],
  );

  const updateActiveSlide = useCallback(
    (node: HTMLDivElement) => {
      activeSlide.current = node;
      updateHeight();
    },
    [updateHeight],
  );

  const handleSwipeStart = useCallback(
    (event: SwipeableEvent) => {
      if (!event || !(event instanceof TouchEvent) || !event.touches) {
        return;
      }
      const touch = applyRotationMatrix(event.touches[0], axis);
      startTransition(() => {
        const rect: DOMRect = rootNode.current?.getBoundingClientRect();
        viewLength.current = rect[axisProperties.length[axis] as keyof DOMRect] as number;
        startX.current = touch.pageX;
        lastX.current = touch.pageX;
        startY.current = touch.pageY;
        vx.current = 0;
        isSwiping.current = false; // should this be undefined???
        // old
        // this.isSwiping = undefined;

        const computedStyle = window.getComputedStyle(containerNode.current);
        const transform =
          computedStyle.getPropertyValue('-webkit-transform') || computedStyle.getPropertyValue('transform');

        if (transform && transform !== 'none') {
          const transformValues = transform.split('(')[1].split(')')[0].split(',');
          const rootStyle = window.getComputedStyle(rootNode.current);

          const tranformNormalized = applyRotationMatrix(
            {
              pageX: parseInt(transformValues[4], 10),
              pageY: parseInt(transformValues[5], 10),
            },
            axis,
          );

          startIndex.current =
            -tranformNormalized.pageX /
              (viewLength.current - parseInt(rootStyle.paddingLeft, 10) - parseInt(rootStyle.paddingRight, 10)) || 0;
        }
      });
    },
    [axis],
  );

  const handleTouchStart = useCallback(
    (event: SwipeableEvent) => {
      if (onTouchStart && typeof onTouchStart === 'function') {
        onTouchStart(event as ReactTouchEvent<HTMLDivElement>);
      }
      handleSwipeStart(event);
    },
    [onTouchStart, handleSwipeStart],
  );

  const handleSwipeMove = useCallback(
    (event: SwipeableEvent) => {
      // The touch start event can be cancel.
      // Makes sure we set a starting point.
      if (!started) {
        handleTouchStart(event);
        return;
      }

      // We are not supposed to handle this touch move.
      if (
        (nodeWhoClaimedTheScroll.current.tagName && nodeWhoClaimedTheScroll.current !== rootNode.current) ||
        !event ||
        !(event instanceof TouchEvent) ||
        !event.touches ||
        !event.preventDefault
      ) {
        return;
      }

      const touch = applyRotationMatrix(event.touches[0], axis);

      // We don't know yet.
      if (!isSwiping.current) {
        const dx = Math.abs(touch.pageX - startX.current);
        const dy = Math.abs(touch.pageY - startY.current);

        const swiping = dx > dy && dx > defaultComputeValues.UNCERTAINTY_THRESHOLD;

        // We let the parent handle the scroll.
        if (
          !resistance &&
          (axis === 'y' || axis === 'y-reverse') &&
          ((index.current === 0 && startX.current < touch.pageX) ||
            (index.current === Children.count(children) - 1 && startX.current > touch.pageX))
        ) {
          isSwiping.current = false;
          return;
        }

        // We are likely to be swiping, let's prevent the scroll event.
        if (dx > dy) {
          event.preventDefault();
        }

        if (swiping || dy > defaultComputeValues.UNCERTAINTY_THRESHOLD) {
          isSwiping.current = true; // ensure swiping is true
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
      vx.current = vx.current * 0.5 + (touch.pageX - lastX.current) * 0.5;
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
      if (!nodeWhoClaimedTheScroll.current.tagName && !ignoreNativeScroll && computedX) {
        const domTreeShapes = getDomTreeShapes(event.target as HTMLDivElement, rootNode.current);
        const hasFoundNativeHandler = findNativeHandler({
          domTreeShapes,
          startX: computedX,
          pageX: touch.pageX,
          axis,
          nodeReference: nodeWhoClaimedTheScroll, //pass the reference, not the node
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
    },
    [
      axis,
      children,
      displaySameSlide,
      handleTouchStart,
      ignoreNativeScroll,
      isDragging,
      indexUpdate,
      onSwitching,
      resistance,
      started,
    ],
  );

  // componentDidMount
  useEffect(() => {
    const transitionListener = (ev: Event) => {
      const target = ev.target as HTMLDivElement;
      if (target !== containerNode.current) {
        return;
      }
      handleTransitionEnd();
    };
    containerNode.current.addEventListener('transitionend', transitionListener);
    const removeTransitionListener = () =>
      containerNode.current.removeEventListener('transitionend', transitionListener);

    const touchListener = (event: TouchEvent) => {
      // Handling touch events is disabled.
      if (disabled) {
        return;
      }
      handleSwipeMove(event);
    };

    rootNode.current.addEventListener('touchmove', touchListener, { passive: false });
    const removeTouchListener = () => rootNode.current.removeEventListener('touchmove', touchListener);

    if (!disableLazyLoading) {
      if (firstRenderTimeout.current !== null) {
        clearTimeout(firstRenderTimeout.current);
      }
      firstRenderTimeout.current = window.setTimeout(() => {
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
    return () => {
      removeTransitionListener();
      removeTouchListener();
      if (firstRenderTimeout.current !== null) {
        clearTimeout(firstRenderTimeout.current);
      }
    };
  }, [action, disableLazyLoading, disabled, handleSwipeMove, handleTransitionEnd, updateHeight]); // ideally, run only once

  // the old code didn't have a param here, but only called
  // this function with a param... so it's unused as of now...
  const handleSwipeEnd = useCallback(
    (_event: SwipeableEvent) => {
      nodeWhoClaimedTheScroll.current = {} as HTMLDivElement;

      // The touch start event can be cancelled.
      // Makes sure that a starting point is set.
      if (!started) {
        return;
      }

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
        onSwitching(indexNew, 'end');
      }
      if (onChangeIndex && typeof onChangeIndex === 'function' && indexNew !== indexLatest) {
        onChangeIndex(indexNew, indexLatest);
      }

      // Manually calling handleTransitionEnd in that case as isn't otherwise.
      if (index.current === indexLatest) {
        handleTransitionEnd();
      }
    },
    [
      started,
      isSwiping,
      onSwitching,
      onChangeIndex,
      handleTransitionEnd,
      children,
      hysteresis,
      indexLatest,
      indexUpdate,
      threshold,
    ],
  );

  const handleTouchEnd = useCallback(
    (event: ReactTouchEvent<HTMLDivElement>) => {
      if (onTouchEnd && typeof onTouchEnd === 'function') {
        onTouchEnd(event);
      }
      handleSwipeEnd(event);
    },
    [onTouchEnd, handleSwipeEnd],
  );

  const handleMouseDown = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (!event || !event.persist) {
        return;
      }
      if (onMouseDown) {
        onMouseDown(event);
      }
      event.persist();
      handleSwipeStart(adaptMouse(event));
    },
    [onMouseDown, handleSwipeStart],
  );

  const handleMouseUp = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (onMouseUp) {
        onMouseUp(event);
      }
      handleSwipeEnd(adaptMouse(event));
    },
    [onMouseUp, handleSwipeEnd],
  );

  const handleMouseLeave = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (onMouseLeave) {
        onMouseLeave(event);
      }

      // Filter out events
      if (started) {
        handleSwipeEnd(adaptMouse(event));
      }
    },
    [onMouseLeave, handleSwipeEnd, started],
  );

  const handleMouseMove = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (onMouseMove) {
        onMouseMove(event);
      }

      // Filter out events
      if (started) {
        handleSwipeMove(adaptMouse(event));
      }
    },
    [onMouseMove, handleSwipeMove, started],
  );

  const handleScroll = useCallback(
    (event: ReactUIEvent<HTMLDivElement>) => {
      if (onScroll) {
        onScroll(event);
      }
      const target = event.target as HTMLDivElement;
      const { scrollLeft, clientWidth } = target;

      // Ignore events bubbling up.
      if (target !== rootNode.current) {
        return;
      }

      if (!scrollLeft || !clientWidth) {
        return;
      }
      if (ignoreNextScrollEvents.current) {
        ignoreNextScrollEvents.current = false;
        return;
      }

      const indexNew = Math.ceil(scrollLeft / clientWidth) + indexLatest;

      ignoreNextScrollEvents.current = true;
      // Reset the scroll position.
      target.scrollLeft = 0;

      if (onChangeIndex && typeof onChangeIndex === 'function' && indexNew !== indexLatest) {
        onChangeIndex(indexNew, indexLatest);
      }
    },
    [onScroll, onChangeIndex, indexLatest],
  );

  const touchEvents = !disabled
    ? {
        onTouchStart: handleTouchStart,
        onTouchEnd: handleTouchEnd,
      }
    : {};
  const mouseEvents =
    !disabled && enableMouseEvents
      ? {
          onMouseDown: handleMouseDown,
          onMouseUp: handleMouseUp,
          onMouseLeave: handleMouseLeave,
          onMouseMove: handleMouseMove,
        }
      : {};

  // There is no point to animate if we are already providing a height.
  if (!(!animateHeight || !containerStyle || !containerStyle.height)) {
    console.warn(
      'react-swipeable-view: You are setting animateHeight to true but you are ' +
        'also providing a custom height. ' +
        'The custom height has a higher priority than the animateHeight property. ' +
        'So animateHeight is most likely having no effect at all.',
    );
  }

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
      const additionalTransition = `, ${createTransition('height', springConfig)}`;
      transition += additionalTransition;
      WebkitTransition += additionalTransition;
    }
  }

  const containerStyleProp: CSSProperties = {
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
    <div
      ref={(node: HTMLDivElement) => {
        rootNode.current = node;
      }}
      style={Object.assign({}, axisProperties.root[axis], style)}
      {...other}
      {...touchEvents}
      {...mouseEvents}
      onScroll={handleScroll}
    >
      <div
        ref={(node: HTMLDivElement) => {
          containerNode.current = node;
        }}
        style={Object.assign({}, containerStyleProp, defaultSwiperStyles.container, containerStyle)}
        className="react-swipeable-view-container"
      >
        {Children.map(children, (child: ReactNode, indexChild) => {
          if (renderOnlyActive && indexChild !== indexLatest) {
            return null;
          }

          if (!isValidElement(child)) {
            console.warn(
              `react-swipeable-view: one of the children provided is invalid: ${child}. We are expecting a valid React Element`,
            );
          }

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
              className={slideClassName || ''}
              aria-hidden={hidden}
              data-swipeable="true"
            >
              {child}
            </div>
          );
        })}
      </div>
    </div>
  );
};

SwipeableViews.displayName = 'ReactSwipableView';
