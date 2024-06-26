import React from 'react';

export const defaultValues = {
  RESISTANCE_COEF: 0.6,

  // This value is closed to what browsers are using internally to
  // trigger a native scroll.
  UNCERTAINTY_THRESHOLD: 3, // px
};

export default function computeIndex(params: any) {
  const { children, startIndex, startX, pageX, viewLength, resistance } = params;

  const indexMax = React.Children.count(children) - 1;
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
    computedIndex = Math.exp(computedIndex * defaultValues.RESISTANCE_COEF) - 1;
  } else if (computedIndex > indexMax) {
    computedIndex = indexMax + 1 - Math.exp((indexMax - computedIndex) * defaultValues.RESISTANCE_COEF);
  }

  return {
    computedIndex,
    computedX: newStartX,
  };
}