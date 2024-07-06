import { CSSProperties } from 'react';

export type SwiperStyles = {
  container: CSSProperties;
  slide: CSSProperties;
};
export const defaultSwiperStyles: SwiperStyles = {
  container: {
    direction: 'ltr',
    display: 'flex',
    willChange: 'transform',
  },
  slide: {
    width: '100vw',
    WebkitFlexShrink: 0,
    flexShrink: 0,
    //overflow: 'auto',
  },
};

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
export const axisProperties: AxisProps = {
  root: {
    x: {
      overflowX: 'hidden',
      overflowY: 'hidden',
    },
    'x-reverse': {
      overflowX: 'hidden',
    },
    y: {
      overflowY: 'hidden',
    },
    'y-reverse': {
      overflowY: 'hidden',
    },
  },
  flexDirection: {
    x: 'row',
    'x-reverse': 'row-reverse',
    y: 'column',
    'y-reverse': 'column-reverse',
  },
  transform: {
    x: (translate) => `translate(${-translate}%, 0)`,
    'x-reverse': (translate) => `translate(${translate}%, 0)`,
    y: (translate) => `translate(0, ${-translate}%)`,
    'y-reverse': (translate) => `translate(0, ${translate}%)`,
  },
  length: {
    x: 'width',
    'x-reverse': 'width',
    y: 'height',
    'y-reverse': 'height',
  },
  rotationMatrix: {
    x: {
      x: [1, 0],
      y: [0, 1],
    },
    'x-reverse': {
      x: [-1, 0],
      y: [0, 1],
    },
    y: {
      x: [0, 1],
      y: [1, 0],
    },
    'y-reverse': {
      x: [0, -1],
      y: [1, 0],
    },
  },
  scrollPosition: {
    x: 'scrollLeft',
    'x-reverse': 'scrollLeft',
    y: 'scrollTop',
    'y-reverse': 'scrollTop',
  },
  scrollLength: {
    x: 'scrollWidth',
    'x-reverse': 'scrollWidth',
    y: 'scrollHeight',
    'y-reverse': 'scrollHeight',
  },
  clientLength: {
    x: 'clientWidth',
    'x-reverse': 'clientWidth',
    y: 'clientHeight',
    'y-reverse': 'clientHeight',
  },
};
