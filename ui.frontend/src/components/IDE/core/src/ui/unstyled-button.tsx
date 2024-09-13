import { forwardRef, type JSX } from 'react';
import { clsx } from 'clsx';

export const UnStyledButton = forwardRef<HTMLButtonElement, JSX.IntrinsicElements['button']>((props, ref) => (
  <button {...props} ref={ref} className={clsx('wizard-un-styled', props.className)} />
));
UnStyledButton.displayName = 'UnStyledButton';
