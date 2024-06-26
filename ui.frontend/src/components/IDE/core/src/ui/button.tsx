import { forwardRef } from 'react';
import { clsx } from 'clsx';

import './button.scss';

export const UnStyledButton = forwardRef<
  HTMLButtonElement,
  JSX.IntrinsicElements['button']
>((props, ref) => (
  <button
    {...props}
    ref={ref}
    className={clsx('wizard-un-styled', props.className)}
  />
));
UnStyledButton.displayName = 'UnStyledButton';

type ButtonProps = { state?: 'success' | 'error' };

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonProps & JSX.IntrinsicElements['button']
>((props, ref) => (
  <button
    {...props}
    ref={ref}
    className={clsx(
      'wizard-button',
      {
        success: 'wizard-button-success',
        error: 'wizard-button-error',
      }[props.state!],
      props.className,
    )}
  />
));
Button.displayName = 'Button';
