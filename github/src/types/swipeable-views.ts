import { CSSProperties, HTMLProps } from 'react';

export type TranslationFunc = (translate: number) => string;
export type Position = {
  x: number[];
  y: number[];
};
export type Axis = 'x' | 'x-reverse' | 'y' | 'y-reverse';
export type AxisProps = {
  root: Record<Axis, CSSProperties>;
  flexDirection: Record<Axis, string>;
  transform: Record<Axis, TranslationFunc>;
  length: Record<Axis, string>;
  rotationMatrix: Record<Axis, Position>;
  scrollPosition: Record<Axis, string>;
  scrollLength: Record<Axis, string>;
  clientLength: Record<Axis, string>;
};

export type SwiperStyles = {
  container: CSSProperties;
  slide: CSSProperties;
};

export type SpringConfig = {
  duration: string;
  easeFunction: string;
  delay: string;
};

export type OnChangeIndexCallback = (index: number, indexLatest: number) => void;

export type OnTransitionEndCallback = () => void;

export type OnSwitchingCallback = (index: number, type: OnSwitchingCallbackTypeDescriptor) => void;

export type OnSwitchingCallbackTypeDescriptor = 'move' | 'end';

export type SwipeableViewsProps = Omit<HTMLProps<HTMLDivElement>, 'action'> & {
  animateHeight?: boolean | undefined;
  animateTransitions?: boolean | undefined;
  axis?: Axis | undefined;
  containerStyle?: CSSProperties | undefined;
  disabled?: boolean | undefined;
  /*
   * This is the config used to disable lazy loading, if true it will render all the views in first rendering.
   */
  disableLazyLoading?: boolean | undefined;
  enableMouseEvents?: boolean | undefined;
  hysteresis?: number | undefined;
  ignoreNativeScroll?: boolean | undefined;
  index?: number | undefined;
  onChangeIndex?: OnChangeIndexCallback | undefined;
  onSwitching?: OnSwitchingCallback | undefined;
  onTransitionEnd?: OnTransitionEndCallback | undefined;
  resistance?: boolean | undefined;
  style?: CSSProperties | undefined;
  slideStyle?: CSSProperties | undefined;
  springConfig?: SpringConfig | undefined;
  slideClassName?: string | undefined;
  threshold?: number | undefined;
  action?: ActionCallback;
};

export type UpdateHeightAction = () => void;

export type Actions = {
  updateHeight: UpdateHeightAction;
};

export type ActionCallback = (actions: Actions) => void;

export type EventListenerProps = {
  event: any;
  handler: any;
  options?: SpringConfig;
};

export type AddEventListenerProps = EventListenerProps & {
  node: HTMLDivElement;
};
