import { forwardRef, JSX } from 'react';
import { clsx } from 'clsx';

import './button-group.scss';

export const ButtonGroup = forwardRef<HTMLDivElement, JSX.IntrinsicElements['div']>((props, ref) => (
  <div {...props} ref={ref} className={clsx('wizard-button-group', props.className)} />
));
ButtonGroup.displayName = 'ButtonGroup';
