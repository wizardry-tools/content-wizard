import { Children, MouseEvent } from 'react';
import { expect } from 'vitest';
import {
  adaptMouse,
  applyRotationMatrix,
  checkIndexBounds,
  computeIndex,
  ComputeIndexProps,
  createTransition,
  findNativeHandler,
  getDisplaySameSlide,
  getDomTreeShapes,
} from '../util';
import { DomTreeShape, IndexBoundsCheck, NativeHandlerParams } from '@/types';

// Test suite for ComputeIndex function
describe('computeIndex function', () => {
  // Test case no resistance and computed index < 0
  test('should return computed index = 0 when no resistance and computed index < 0', () => {
    const props: ComputeIndexProps = {
      children: (
        <>
          <div>ChildOne</div>
          <div>ChildTwo</div>
        </>
      ),
      startIndex: 1,
      startX: 3,
      pageX: 5,
      viewLength: 1,
      resistance: false,
    };
    const result = computeIndex(props);
    expect(result.computedIndex).toBe(0);
  });

  // Test case no resistance and computed index > maximum
  test('should return computed index = maximum when no resistance and computed index > maximum', () => {
    const props: ComputeIndexProps = {
      children: (
        <>
          <div>ChildOne</div>
          <div>ChildTwo</div>
        </>
      ),
      startIndex: 1,
      startX: 5,
      pageX: 2,
      viewLength: 1,
      resistance: false,
    };
    const result = computeIndex(props);
    expect(result.computedIndex).toBe(Children.count(props.children) - 1);
  });

  // Test when the resistance is true and computedIndex < 0
  test('should return computed index, calculated using exponential formula when resistance = true and computed index < 0', () => {
    const props: ComputeIndexProps = {
      children: (
        <>
          <div>ChildOne</div>
          <div>ChildTwo</div>
        </>
      ),
      startIndex: 1,
      startX: 3,
      pageX: 5,
      viewLength: 1,
      resistance: true,
    };
    const result = computeIndex(props);
    expect(result.computedIndex).toBe(-0.4511883639059735);
  });

  // Test when the resistance is true and computedIndex > maximum
  test('should return computed index, calculated using exponential formula when resistance = true and computed index > maximum', () => {
    const props: ComputeIndexProps = {
      children: (
        <>
          <div>ChildOne</div>
          <div>ChildTwo</div>
        </>
      ),
      startIndex: 1,
      startX: 5,
      pageX: 2,
      viewLength: 1,
      resistance: true,
    };
    const result = computeIndex(props);
    expect(result.computedIndex).toBe(0.9092820467105875);
  });
});

describe('adaptMouse function', () => {
  test('should adapt MouseEvent', () => {
    const event: MouseEvent<HTMLDivElement> = {
      pageX: 10,
      pageY: 20,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as MouseEvent<HTMLDivElement>;
    const adaptedEvent = adaptMouse(event);
    expect(adaptedEvent.touches).toEqual([{ pageX: event.pageX, pageY: event.pageY }]);
  });
});

describe('createTransition function', () => {
  test('should create CSS transition', () => {
    const options = {
      duration: '5',
      easeFunction: '4',
      delay: '1000',
    };
    const propertyName = 'propertyName';
    const result = createTransition(propertyName, options);
    expect(result).toBe('propertyName 5 4 1000');
  });
});

describe('applyRotationMatrix function', () => {
  test('should apply rotation matrix x', () => {
    const touch = {
      pageX: 3,
      pageY: 5,
    };
    const axis = 'x';
    const result = applyRotationMatrix(touch, axis);
    expect(result.pageX).toBe(3);
    expect(result.pageY).toBe(5);
  });
  test('should apply rotation matrix x-reverse', () => {
    const touch = {
      pageX: 3,
      pageY: 5,
    };
    const axis = 'x-reverse';
    const result = applyRotationMatrix(touch, axis);
    expect(result.pageX).toBe(-3);
    expect(result.pageY).toBe(5);
  });
  test('should apply rotation matrix y', () => {
    const touch = {
      pageX: 3,
      pageY: 5,
    };
    const axis = 'y';
    const result = applyRotationMatrix(touch, axis);
    expect(result.pageX).toBe(5);
    expect(result.pageY).toBe(3);
  });
  test('should apply rotation matrix y-reverse', () => {
    const touch = {
      pageX: 3,
      pageY: 5,
    };
    const axis = 'y-reverse';
    const result = applyRotationMatrix(touch, axis);
    expect(result.pageX).toBe(-5);
    expect(result.pageY).toBe(3);
  });
});

describe('getDisplaySameSlide function', () => {
  const children = [<div key="one">ChildOne</div>, <div key="two">ChildTwo</div>];
  const previousProps = {
    children,
    index: 1,
  };
  const props = {
    ...previousProps,
  };
  test('should return true when slides are same', () => {
    const result = getDisplaySameSlide({ previousProps, props });
    expect(result).toBe(true);
  });
  test('should return false when slides are different', () => {
    props.index = 2;
    const result = getDisplaySameSlide({ previousProps, props });
    expect(result).toBe(false);
  });
});

describe('getDomTreeShapes function', () => {
  let div: HTMLDivElement;
  let rootDiv: HTMLDivElement;
  beforeEach(() => {
    div = document.createElement('div');
    rootDiv = document.createElement('div');
    rootDiv.appendChild(div);
    document.body.appendChild(rootDiv);
  });
  afterEach(() => {
    // Clean up the element from the body
    if (div && rootDiv) {
      rootDiv.removeChild(div);
    }
    if (rootDiv) {
      document.body.removeChild(rootDiv);
    }
  });

  test('returns an empty list when there is no element', () => {
    const result = getDomTreeShapes(undefined, rootDiv);
    expect(result).toEqual([]);
  });

  test('does not include elements with position: absolute', () => {
    div.style.position = 'absolute';
    //getDomTreeShapes(div, rootDiv);
    expect(getDomTreeShapes(div, rootDiv)).toEqual([]);
  });

  test('does not include elements with overflow-x: hidden', () => {
    div.style.overflowX = 'hidden';
    //getDomTreeShapes(div, rootDiv);
    expect(getDomTreeShapes(div, rootDiv)).toEqual([]);
  });

  test('includes nodes that have width and are scrollable', () => {
    Object.defineProperty(div, 'clientWidth', { value: 100 });
    Object.defineProperty(div, 'clientHeight', { value: 100 });
    Object.defineProperty(div, 'scrollWidth', { value: 200 });
    Object.defineProperty(div, 'scrollHeight', { value: 200 });
    div.style.width = '100px';
    div.style.height = '100px';
    div.style.overflow = 'scroll';
    div.innerHTML = '<div style="width:200px;height:200px"></div>';
    expect(div.clientWidth).toBe(100);
    const result: DomTreeShape[] = getDomTreeShapes(div, rootDiv);
    expect(result).toHaveLength(1);
    expect(result[0].scrollWidth).toBeGreaterThan(result[0].clientWidth);
    expect(result[0].scrollHeight).toBeGreaterThan(result[0].clientHeight);
  });
});

describe('findNativeHandler function', () => {
  it('Returns true if going forward and not at end', () => {
    const params: NativeHandlerParams = {
      domTreeShapes: [
        {
          scrollWidth: 300,
          scrollHeight: 100,
          clientWidth: 100,
          clientHeight: 100,
          scrollLeft: 100,
          scrollTop: 0,
          element: document.createElement('div'),
        },
      ],
      pageX: 0,
      startX: 100,
      axis: 'x',
      nodeReference: { current: document.createElement('div') },
    };
    const result = findNativeHandler(params);
    expect(result).toBe(true);
  });
  it('Returns false if going forward and at end', () => {
    const params: NativeHandlerParams = {
      domTreeShapes: [
        {
          scrollWidth: 300,
          scrollHeight: 100,
          clientWidth: 100,
          clientHeight: 100,
          scrollLeft: 200,
          scrollTop: 0,
          element: document.createElement('div'),
        },
      ],
      pageX: 0,
      startX: 100,
      axis: 'x',
      nodeReference: { current: document.createElement('div') },
    };
    const result = findNativeHandler(params);
    expect(result).toBe(false);
  });

  it('Returns true if not going forward and not at start', () => {
    const params: NativeHandlerParams = {
      domTreeShapes: [
        {
          scrollWidth: 300,
          scrollHeight: 100,
          clientWidth: 100,
          clientHeight: 100,
          scrollLeft: 200,
          scrollTop: 0,
          element: document.createElement('div'),
        },
      ],
      pageX: 100,
      startX: 0,
      axis: 'x',
      nodeReference: { current: document.createElement('div') },
    };
    const result = findNativeHandler(params);
    expect(result).toBe(true);
  });

  it('Returns false if not going forward and at start', () => {
    const params: NativeHandlerParams = {
      domTreeShapes: [
        {
          scrollWidth: 300,
          scrollHeight: 100,
          clientWidth: 100,
          clientHeight: 100,
          scrollLeft: 0,
          scrollTop: 0,
          element: document.createElement('div'),
        },
      ],
      pageX: 100,
      startX: 0,
      axis: 'x',
      nodeReference: { current: document.createElement('div') },
    };
    const result = findNativeHandler(params);
    expect(result).toBe(false);
  });
});

describe('checkIndexBounds', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });
  test('warns when index is out of bounds', () => {
    const childrenArray = Children.toArray([<div key={1}></div>, <div key={2}></div>, <div key={3}></div>]);
    const props: IndexBoundsCheck = { index: 4, children: childrenArray };

    checkIndexBounds(props);
    expect(console.warn).toHaveBeenCalled();
  });

  test('does not warn when index is within bounds', () => {
    const childrenArray = Children.toArray([<div key={1}></div>, <div key={2}></div>, <div key={3}></div>]);
    const props: IndexBoundsCheck = { index: 2, children: childrenArray };

    checkIndexBounds(props);
    expect(console.warn).toHaveBeenCalledTimes(0);
  });
});
