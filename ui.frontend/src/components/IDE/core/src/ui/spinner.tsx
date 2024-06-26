import { forwardRef } from 'react';
import { clsx } from 'clsx';

import './spinner.scss';

export const Spinner = forwardRef<HTMLDivElement, JSX.IntrinsicElements['div']>(
  (props, ref) => (
    <div
      {...props}
      ref={ref}
      className={clsx('wizard-spinner', props.className)}
    />
  ),
);
Spinner.displayName = 'Spinner';
